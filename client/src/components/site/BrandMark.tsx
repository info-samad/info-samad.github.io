type BrandMarkProps = { className?: string };

export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}brand-logo.svg`}
      alt=""
      aria-hidden="true"
      width="48"
      height="48"
    />
  );
}
