import { useEffect, useRef, useState } from "react";

export const FRAME_COUNT = 150;
export const frameUrl = (index: number) =>
  `${import.meta.env.BASE_URL}plant-frames/f${String(index).padStart(3, "0")}.webp`;
export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const frameAt = (progress: number) =>
  Math.round(clamp(progress) * (FRAME_COUNT - 1));
export const journeyRange = (sectionHeight: number, stageHeight: number) =>
  Math.max(1, sectionHeight - stageHeight);
export const progressAt = (
  sectionTop: number,
  sectionHeight: number,
  stageHeight: number
) => clamp(-sectionTop / journeyRange(sectionHeight, stageHeight));

type DecodedFrame = ImageBitmap | HTMLImageElement;
const anchors = new Set([0, 36, 74, 112, 149]);
const MAX_DECODED_FRAMES = 56;

export function usePlantSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    const canvasNode = canvasRef.current;
    if (!sectionNode || !canvasNode) return;
    const context = canvasNode.getContext("2d", { alpha: false });
    const stageNode = canvasNode.parentElement;
    if (!context || !stageNode) return;
    const section = sectionNode;
    const canvas = canvasNode;
    const drawingContext = context;
    const stage = stageNode;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const desired = Array.from(
      { length: FRAME_COUNT },
      (_, index) => index
    ).filter(index => !mobile || index % 2 === 0 || anchors.has(index));
    const blobs = new Map<number, Blob>();
    const frames = new Map<number, DecodedFrame>();
    const decoding = new Set<number>();
    const decodeQueue = new Set<number>();
    const decodeFailures = new Set<number>();
    const pending = new Set(desired);
    const controller = new AbortController();
    let disposed = false;
    let target = 0;
    let current = 0;
    let animation = 0;
    let width = window.innerWidth;
    let height = stage.offsetHeight;
    let lastDrawn = -1;
    let lastPublished = -1;
    let activeDecoders = 0;
    let processed = 0;

    const release = (frame: DecodedFrame) => {
      if ("close" in frame) frame.close();
    };
    const distanceToRoute = (index: number) =>
      Math.min(
        Math.abs(index - frameAt(target)),
        Math.abs(index - frameAt(current))
      );

    function paint() {
      if (disposed) return;
      const requested = frameAt(current);
      let closest = -1;
      let distance = Infinity;
      for (const index of frames.keys()) {
        if (Math.abs(requested - index) < distance) {
          distance = Math.abs(requested - index);
          closest = index;
        }
      }
      if (closest < 0 || closest === lastDrawn) return;
      const image = frames.get(closest)!;
      const imageWidth =
        "naturalWidth" in image ? image.naturalWidth : image.width;
      const imageHeight =
        "naturalHeight" in image ? image.naturalHeight : image.height;
      const scale = Math.max(width / imageWidth, height / imageHeight);
      drawingContext.drawImage(
        image,
        (width - imageWidth * scale) / 2,
        (height - imageHeight * scale) / 2,
        imageWidth * scale,
        imageHeight * scale
      );
      lastDrawn = closest;
      setReady(true);
    }

    function schedule() {
      if (!disposed && !animation) animation = requestAnimationFrame(animate);
    }

    function animate() {
      animation = 0;
      if (disposed) return;
      current = reducedMotion ? target : current + (target - current) * 0.2;
      if (Math.abs(current - target) < 0.0004) current = target;
      requestNearby();
      const rounded = Math.round(current * 1000) / 1000;
      if (rounded !== lastPublished) {
        setProgress(rounded);
        lastPublished = rounded;
      }
      paint();
      if (current !== target) schedule();
    }

    async function decode(index: number, blob: Blob): Promise<DecodedFrame> {
      if (typeof createImageBitmap === "function") {
        try {
          return await createImageBitmap(blob, {
            resizeWidth: Math.min(
              mobile ? 900 : 1440,
              Math.max(768, window.innerWidth)
            ),
            resizeQuality: "high",
          });
        } catch {
          // Fallback below supports browsers without bitmap resizing.
        }
      }
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(blob);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(`Frame ${index}`));
        };
        image.src = url;
      });
    }

    function evict() {
      for (const [index, image] of frames) {
        if (!anchors.has(index) && distanceToRoute(index) > 12) {
          release(image);
          frames.delete(index);
        }
      }
      const removable = [...frames.keys()]
        .filter(index => !anchors.has(index))
        .sort((a, b) => distanceToRoute(b) - distanceToRoute(a));
      while (frames.size > MAX_DECODED_FRAMES && removable.length) {
        const index = removable.shift()!;
        const image = frames.get(index);
        if (image) release(image);
        frames.delete(index);
      }
    }

    function pumpDecode() {
      if (disposed) return;
      while (activeDecoders < 3 && decodeQueue.size) {
        const index = [...decodeQueue].sort(
          (a, b) => distanceToRoute(a) - distanceToRoute(b)
        )[0];
        decodeQueue.delete(index);
        if (
          frames.has(index) ||
          decoding.has(index) ||
          decodeFailures.has(index)
        )
          continue;
        const blob = blobs.get(index);
        if (!blob || (!anchors.has(index) && distanceToRoute(index) > 12))
          continue;
        decoding.add(index);
        activeDecoders++;
        void decode(index, blob)
          .then(image => {
            if (disposed) {
              release(image);
              return;
            }
            frames.set(index, image);
            evict();
            lastDrawn = -1;
            schedule();
          })
          .catch(() => {
            if (!disposed) {
              decodeFailures.add(index);
              setFailed(true);
            }
          })
          .finally(() => {
            decoding.delete(index);
            activeDecoders--;
            pumpDecode();
          });
      }
    }

    function requestNearby() {
      for (const index of desired) {
        if (
          (anchors.has(index) || distanceToRoute(index) <= 8) &&
          blobs.has(index) &&
          !frames.has(index) &&
          !decoding.has(index) &&
          !decodeFailures.has(index)
        ) {
          decodeQueue.add(index);
        }
      }
      pumpDecode();
    }

    function onScroll() {
      target = progressAt(
        section.getBoundingClientRect().top,
        section.offsetHeight,
        stage.offsetHeight
      );
      requestNearby();
      schedule();
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawingContext.imageSmoothingEnabled = true;
      drawingContext.imageSmoothingQuality = "high";
      lastDrawn = -1;
      onScroll();
    }

    async function loadWorker() {
      while (!disposed && pending.size) {
        const index = [...pending].sort((a, b) => {
          const priority = (value: number) =>
            value === 0
              ? -10000
              : anchors.has(value)
                ? -1000 + value
                : distanceToRoute(value);
          return priority(a) - priority(b);
        })[0];
        pending.delete(index);
        let blob: Blob | undefined;
        for (let attempt = 0; attempt < 3 && !disposed; attempt++) {
          const request = new AbortController();
          const abort = () => request.abort();
          controller.signal.addEventListener("abort", abort, { once: true });
          const timeout = window.setTimeout(abort, 15000);
          try {
            const response = await fetch(frameUrl(index), {
              signal: request.signal,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.blob();
            if (!result.type.startsWith("image/") || result.size === 0) {
              throw new Error("Invalid frame");
            }
            blob = result;
            break;
          } catch {
            if (controller.signal.aborted) return;
            if (attempt < 2) {
              await new Promise(resolve =>
                window.setTimeout(resolve, 250 * (attempt + 1))
              );
            }
          } finally {
            window.clearTimeout(timeout);
            controller.signal.removeEventListener("abort", abort);
          }
        }
        if (disposed) return;
        processed++;
        setLoaded(Math.round((processed / desired.length) * 100));
        if (blob) {
          blobs.set(index, blob);
          requestNearby();
        } else {
          setFailed(true);
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    void Promise.all(Array.from({ length: 5 }, () => loadWorker()));

    return () => {
      disposed = true;
      controller.abort();
      window.cancelAnimationFrame(animation);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      for (const image of frames.values()) release(image);
      frames.clear();
      blobs.clear();
      decodeQueue.clear();
    };
  }, []);

  const goToProgress = (value: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const stage = section.querySelector<HTMLElement>(".motion-hero-stage");
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({
      top:
        sectionTop +
        clamp(value) *
          journeyRange(
            section.offsetHeight,
            stage?.offsetHeight ?? window.innerHeight
          ),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return {
    sectionRef,
    canvasRef,
    progress,
    loaded,
    ready,
    failed,
    goToProgress,
  };
}
