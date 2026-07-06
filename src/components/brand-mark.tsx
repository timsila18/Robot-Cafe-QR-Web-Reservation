import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandMark({ className = "", imageClassName = "w-[122px]", priority = true }: BrandMarkProps) {
  return (
    <div className={`robot-logo-mark flex items-center ${className}`} aria-label="Robot Cafe">
      <span className="robot-logo-aura" aria-hidden="true" />
      <Image
        alt="Robot Cafe"
        className={`relative z-10 h-auto ${imageClassName}`}
        height={40}
        priority={priority}
        src="/robot-cafe-logo.png"
        width={112}
      />
    </div>
  );
}
