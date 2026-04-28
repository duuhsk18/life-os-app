import { motion } from 'framer-motion'

/**
 * Wrapper que dá fade-in + leve slide-up nas páginas internas do Life OS.
 * Aplicar nas páginas filhas (não no LifeOSLayout que é pai persistente).
 */
export default function MotionPage({ children, className = '', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Variants prontos pra reutilizar dentro das páginas */
export const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export const staggerContainer = {
  initial: {},
  animate: {},
  transition: { staggerChildren: 0.06 },
}

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
}
