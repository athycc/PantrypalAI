import { jsx } from "react/jsx-runtime";
const chef = "/assets/bee-chef-BwhDiCVG.png";
const happy = "/assets/bee-happy-CmCBgT7H.png";
const sleepy = "/assets/bee-sleepy-sYTeGiGE.png";
const worried = "/assets/bee-worried-BgBdsD_t.png";
const MASCOTS = [
  { id: "bee-chef", src: chef, label: "Chef Bee", tagline: "Your cooking buddy" },
  { id: "bee-happy", src: happy, label: "Happy Bee", tagline: "Celebrates your savings" },
  { id: "bee-sleepy", src: sleepy, label: "Sleepy Bee", tagline: "Cozy & calm" },
  { id: "bee-worried", src: worried, label: "Worry Bee", tagline: "Watches your wallet" }
];
function mascotSrc(id) {
  return MASCOTS.find((m) => m.id === id)?.src ?? chef;
}
function Mascot({ id, size = 96, className = "" }) {
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: mascotSrc(id),
      alt: "",
      width: size,
      height: size,
      loading: "lazy",
      className,
      style: { width: size, height: size, objectFit: "contain" }
    }
  );
}
export {
  MASCOTS as M,
  Mascot as a
};
