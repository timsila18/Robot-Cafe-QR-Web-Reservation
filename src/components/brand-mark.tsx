import Image from "next/image";

export function BrandMark() {
  return (
    <div className="flex items-center" aria-label="Robot Cafe">
      <Image
        alt="Robot Cafe"
        className="h-auto w-[122px]"
        height={40}
        priority
        src="/robot-cafe-logo.png"
        width={112}
      />
    </div>
  );
}
