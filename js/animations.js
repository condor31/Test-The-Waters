import { inView, animate } from "https://esm.sh/motion";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const enterDuration = reduceMotion ? 0.25 : 1.1;
const exitDuration = reduceMotion ? 0.2 : 0.6;
const enterEase = [0.16, 1, 0.3, 1];

function slideRow(rowSelector, offscreenTransform) {
  const row = document.querySelector(rowSelector);
  const track = row?.querySelector(".slide-arrow__track");
  if (!track) return;

  inView(
    row,
    () => {
      animate(track, { transform: "translateX(0px) translateY(0px)" }, { duration: enterDuration, ease: enterEase });
      return () => {
        animate(track, { transform: offscreenTransform }, { duration: exitDuration, ease: "easeIn" });
      };
    },
    { amount: 0.15 }
  );
}

slideRow(".slide-arrow--cyan", "translateX(-70vw)");
slideRow(".slide-arrow--magenta", "translateX(70vw)");
slideRow(".slide-arrow--yellow", "translateY(60vh)");
