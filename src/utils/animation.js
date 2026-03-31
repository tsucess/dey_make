// animations.js
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15
    }
  }
};
export const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2
    }
  }
};