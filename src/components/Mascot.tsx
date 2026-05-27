import { mascotSrc } from "@/lib/mascots";
import type { MascotId } from "@/lib/store";

export function Mascot({ id, size = 96, className = "" }: { id: MascotId; size?: number; className?: string }) {
  return (
    <img
      src={mascotSrc(id)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
