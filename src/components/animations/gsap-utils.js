import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* -----------------------------------------------------------
   TEXT ANIMATIONS (with blur+opacity baseline)
----------------------------------------------------------- */
export function animateText(el, variant = "fade", delay = 0) {
  if (!el) return;

  // Common defaults for your brand style
  const base = {
    opacity: 0,
    filter: "blur(8px)",
    ease: "sine.out",
    duration: 1.6,
    delay: delay + 0.5, // Add 0.5s delay to let CSS section fade-in happen first
    immediateRender: false,
    scrollTrigger: { trigger: el, start: "top 85%" },
  };

  switch (variant) {
    /* ---- soft fade ---- */
    case "fade":
      gsap.from(el, {
        ...base,
        y: 30,
        immediateRender: false,
      });
      break;

    /* ---- staggered words ---- */
    case "words": {
      const words = el.textContent.split(" ");
      el.innerHTML = words
        .map(
          (w) =>
            `<span class='word inline-block opacity-0 will-change-transform will-change-filter'>${w}</span>`
        )
        .join(" ");

      gsap.fromTo(
        el.querySelectorAll(".word"),
        { opacity: 0, filter: "blur(8px)", y: 15, immediateRender: false},
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.08,
          duration: 1.3,
          ease: "power3.out",
          delay: delay + 0.5,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
      break;
    }

    /* ---- masked slide ---- */
    case "mask": {
        // Ensure the element is block-level and overflow hidden for the mask
        el.style.display = "inline-block";
        el.style.overflow = "hidden";
        el.style.position = "relative";
      
        // Wrap the text in an inner span for the moving mask effect
        const inner = document.createElement("span");
        inner.innerHTML = el.innerHTML;
        inner.style.display = "inline-block";
        inner.style.transform = "translateY(110%)";
        inner.style.filter = "blur(8px)";
        inner.style.opacity = "0";
        el.innerHTML = "";
        el.appendChild(inner);
      
        gsap.to(inner, {
          y: "0%",
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.4,
          delay: delay + 0.5,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
        break;
      }

    /* ---- character by character ---- */
    case "chars": {
      const chars = el.textContent.split("");
      el.innerHTML = chars
        .map(
          (c) =>
            `<span class='char inline-block opacity-0 will-change-transform will-change-filter'>${c}</span>`
        )
        .join("");
      gsap.fromTo(
        el.querySelectorAll(".char"),
        { opacity: 0, filter: "blur(6px)", y: 12, immediateRender: false },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.02,
          duration: 1.6,
          ease: "power1.out",
          delay: delay + 0.5,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
      break;
    }
  }
}

/* -----------------------------------------------------------
   IMAGE ANIMATIONS (same baseline)
----------------------------------------------------------- */
export function animateImage(el, variant = "fade", delay = 0) {
  if (!el) return;

  const base = {
    opacity: 0,
    filter: "blur(12px)",
    duration: 2,
    delay,
    ease: "sine.out",
  };

  switch (variant) {
    case "fade":
      gsap.from(el, {
        ...base,
        y: 40,
        scale: 1.05,
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
      break;

    case "parallax":
      gsap.to(el, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          scrub: true,
        },
      });
      break;

    case "mask":
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)", opacity: 0, filter: "blur(12px)" },
        {
          clipPath: "inset(0 0 0% 0)",
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.8,
          ease: "power2.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );
      break;
  }
}

/* -----------------------------------------------------------
   SECTION TIMELINE (unchanged, but uses same blur+fade logic)
----------------------------------------------------------- */
export function animateSection(triggerSelector, options = {}) {
  const {
    texts = [],
    images = [],
    delay = 0,
    duration = 1.4,
    stagger = 0.15,
  } = options;

  const section = document.querySelector(triggerSelector);
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 95%", // triggers earlier
    },
    delay,
  });

  texts.forEach((selector, i) => {
    tl.from(
      selector,
      {
        opacity: 0,
        y: 30,
        filter: "blur(8px)",
        duration,
        ease: "sine.out",
        immediateRender: false,
      },
      i === 0 ? 0 : `-=${duration * 0.5}`
    );
  });

  images.forEach((selector) => {
    tl.from(
      selector,
      {
        opacity: 0,
        y: 60,
        scale: 1.05,
        filter: "blur(12px)",
        duration: duration * 1.5,
        ease: "power2.out",
        immediateRender: false,
      },
      `-=${duration * 0.7}`
    );
  });

  return tl;
}