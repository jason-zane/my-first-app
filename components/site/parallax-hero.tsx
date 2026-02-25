'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type Props = {
  src: string
  alt: string
  children: ReactNode
  minHeight?: string
}

export function ParallaxHero({ src, alt, children, minHeight = 'min-h-screen' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])

  return (
    <section ref={ref} className={`relative flex items-end overflow-hidden pb-24 md:pb-36 ${minHeight}`}>
      <motion.div className="absolute inset-0 h-[130%] -top-[15%]" style={{ y: imageY }}>
        {/* Plain img intentional — fill layout incompatible with parallax overflow trick */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/40 to-stone-900/10" />
      {children}
    </section>
  )
}
