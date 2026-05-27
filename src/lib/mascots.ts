import chef from "@/assets/bee-chef.png";
import happy from "@/assets/bee-happy.png";
import sleepy from "@/assets/bee-sleepy.png";
import worried from "@/assets/bee-worried.png";
import type { MascotId } from "./store";

export const MASCOTS: { id: MascotId; src: string; label: string; tagline: string }[] = [
  { id: "bee-chef", src: chef, label: "Chef Bee", tagline: "Your cooking buddy" },
  { id: "bee-happy", src: happy, label: "Happy Bee", tagline: "Celebrates your savings" },
  { id: "bee-sleepy", src: sleepy, label: "Sleepy Bee", tagline: "Cozy & calm" },
  { id: "bee-worried", src: worried, label: "Worry Bee", tagline: "Watches your wallet" },
];

export function mascotSrc(id: MascotId): string {
  return MASCOTS.find((m) => m.id === id)?.src ?? chef;
}
