import { Variants, Transition } from "framer-motion";

// Spring físico para botones e interacciones táctiles
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

// Suave desaceleración para transiciones de elementos y scroll
export const smoothEase: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

// Variantes de contenedor para grillas y catálogos (Stagger)
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Variantes para elementos de catálogo o tarjetas
export const cardFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothEase,
  },
};

// Efectos hover y tap universales
export const hoverScaleProps = {
  whileHover: { scale: 1.03, y: -2 },
  whileTap: { scale: 0.97 },
  transition: springTransition,
};
