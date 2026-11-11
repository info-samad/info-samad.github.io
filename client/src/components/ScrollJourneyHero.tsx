import {
  ArrowDown,
  ArrowLeft,
  ArrowUpLeft,
  Leaf,
  RotateCcw,
  Sprout,
} from "lucide-react";
import { frameUrl, usePlantSequence } from "@/hooks/usePlantSequence";

const stages = [
  {
    label: "الأساس الذي لا نراه",
    number: "01 / 03",
    name: "الجذور",
    english: "ROOTS",
    title: (
      <>
        كل نمو قوي
        <br />
        يبدأ من <em>جذور صحية.</em>
      </>
    ),
    description:
      "من عمق التربة تبدأ رحلة النبات. نعتني بالمادة العضوية وبأساس الأرض قبل أن نبحث عن النتيجة فوقها.",
    position: 0,
  },
  {
    label: "من التربة إلى الساق",
    number: "02 / 03",
    name: "النمو",
    english: "GROWTH",
    title: (
      <>
        غذاء متوازن،
        <br />
        <em>نمو يمكن ملاحظته.</em>
      </>
    ),
    description:
      "سماد عضوي وإرشاد زراعي يراعي بيانات التربة والمحصول، حتى تتحول العناية اليومية إلى نمو واضح.",
    position: 0.48,
  },
  {
    label: "نحو موسم أفضل",
    number: "03 / 03",
    name: "الأفق",
    english: "CANOPY",
    title: (
      <>
        من المعمل،
        <br />
        <em>إلى حقل أكثر حيوية.</em>
      </>
    ),
    description:
      "نرافقك من اختيار المنتج إلى فهم احتياج الأرض، بخطوات عملية تستند إلى بيانات الحقل وملصق المنتج.",
    position: 1,
  },
];

export default function ScrollJourneyHero() {
  const {
    sectionRef,
    canvasRef,
    progress,
    loaded,
    ready,
    failed,
    goToProgress,
  } = usePlantSequence();
  const active = progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2;

  return (
    <section
      ref={sectionRef}
      id="top"
      className="motion-hero"
      aria-label="رحلة من جذور النبات إلى نموه"
    >
      <div className="motion-hero-stage">
        <img
          className="motion-hero-fallback"
          src={frameUrl(0)}
          alt="جذور نبات في عمق التربة"
          fetchPriority="high"
        />
        <canvas
          ref={canvasRef}
          className={`motion-hero-canvas ${ready ? "is-ready" : ""}`}
          aria-label="مشهد النبات يتغير مع تمرير الصفحة"
        />
        <div className="motion-hero-overlay" />
        <div className="motion-hero-grain" />

        {failed && (
          <div className="motion-hero-error" role="status">
            تعذر تجهيز بعض إطارات الحركة. سيبقى المشهد المتاح ظاهرًا.
            <button type="button" onClick={() => window.location.reload()}>
              إعادة المحاولة <RotateCcw size={13} />
            </button>
          </div>
        )}

        <div className="motion-hero-kicker">
          <span className="motion-dot" /> معمل الأسمدة العضوية والمخصبات <i />{" "}
          <b dir="ltr">A JOURNEY FROM SOIL</b>
        </div>

        <div className="motion-hero-copy">
          {stages.map((stage, index) => (
            <div
              className={`motion-stage-copy ${index === active ? "is-active" : ""}`}
              key={stage.name}
              aria-hidden={index !== active}
            >
              <div className="motion-eyebrow">
                <span dir="ltr">{stage.number}</span>
                <i />
                {stage.label}
              </div>
              {index === 0 ? <h1>{stage.title}</h1> : <h2>{stage.title}</h2>}
              <p>{stage.description}</p>
              <div className="motion-copy-actions">
                {index < 2 ? (
                  <button
                    type="button"
                    onClick={() => goToProgress(index === 0 ? 0.48 : 1)}
                  >
                    تابع الصعود <ArrowDown size={16} />
                  </button>
                ) : (
                  <a href="#about">
                    اكتشف المعمل <ArrowUpLeft size={16} />
                  </a>
                )}
                {index === 0 && (
                  <span className="motion-product-note">
                    <Sprout size={14} /> أساس تسميد أفضل
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="motion-altitude" aria-hidden="true">
          <span dir="ltr">THE WAY UP</span>
          <div>
            <i style={{ height: `${progress * 100}%` }} />
            <b style={{ top: `${progress * 100}%` }} />
          </div>
          <small dir="ltr">
            {String(Math.round(progress * 100)).padStart(2, "0")}%
          </small>
        </div>

        <div className="motion-hero-bottom">
          <button
            type="button"
            className="motion-scroll-cue"
            onClick={() =>
              goToProgress(active === 2 ? 0 : active === 0 ? 0.48 : 1)
            }
            aria-label={active === 2 ? "إعادة الرحلة" : "مرر للصعود مع النبات"}
          >
            <span>
              {active === 2 ? <RotateCcw size={17} /> : <ArrowDown size={17} />}
            </span>
            <b>
              {active === 2 ? "أعد الرحلة" : "مرّر لتصعد"}
              <small dir="ltr">
                {active === 2 ? "BACK TO ROOTS" : "SCROLL TO GROW"}
              </small>
            </b>
          </button>

          <nav className="motion-stage-nav" aria-label="مراحل رحلة النبات">
            {stages.map((stage, index) => (
              <button
                type="button"
                key={stage.name}
                onClick={() => goToProgress(stage.position)}
                className={active === index ? "is-active" : ""}
                aria-current={active === index ? "step" : undefined}
              >
                <span dir="ltr">0{index + 1}</span>
                {stage.name}
                {active === index && <Leaf size={13} />}
              </button>
            ))}
          </nav>

          <div className="motion-load-status">
            <span className="motion-dot" />{" "}
            {failed
              ? "تحقق من الإطارات"
              : loaded < 100
                ? `تجهيز المشهد ${loaded}%`
                : "من التربة إلى الحقل"}
          </div>
        </div>
        <div
          className="motion-progress"
          role="progressbar"
          aria-label="تقدم رحلة النبات"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
