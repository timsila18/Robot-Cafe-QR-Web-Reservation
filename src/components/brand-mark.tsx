import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: "dark" | "light";
};

export function BrandMark({ className = "", imageClassName = "w-[168px]", priority = true, variant = "dark" }: BrandMarkProps) {
  const src = variant === "light" ? "/robot-cafe-logo-light.png" : "/robot-cafe-logo-dark.png";

  return (
    <div className={`robot-logo-mark inline-flex max-w-full items-center ${className}`} aria-label="Robot Cafe">
      <span className="robot-logo-aura" aria-hidden="true" />
      <Image
        alt="Robot Cafe"
        className={`relative z-10 h-auto max-w-full object-contain ${imageClassName}`}
        height={257}
        priority={priority}
        src={src}
        width={1202}
      />
    </div>
  );
}
