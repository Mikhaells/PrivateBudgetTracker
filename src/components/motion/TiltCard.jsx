import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react'

export default function TiltCard({
  children,
  className = '',
  max = 9,
  scale = 1.02,
  glare = true,
}) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const springCfg = { stiffness: 260, damping: 22, mass: 0.6 }
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), springCfg)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), springCfg)

  const glareX = useTransform(px, [0, 1], ['25%', '75%'])
  const glareY = useTransform(py, [0, 1], ['15%', '85%'])
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(217,119,6,0.12) 0%, transparent 55%)`
  )

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set(Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1))
    py.set(Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1))
  }

  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div className="h-full" style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        role="presentation"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ scale }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={className}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  )
}
