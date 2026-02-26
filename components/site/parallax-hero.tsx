'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, type ReactNode } from 'react'

type Props = {
  src: string
  alt: string
  children: ReactNode
  minHeight?: string
  imgClassName?: string
  useVideo?: boolean
  videoSrcMp4?: string
  videoSrcWebm?: string
  posterSrc?: string
}

export function ParallaxHero({
  src,
  alt,
  children,
  minHeight = 'min-h-screen',
  imgClassName = 'object-center',
  useVideo = false,
  videoSrcMp4,
  videoSrcWebm,
  posterSrc,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const shouldUseVideo = useVideo && !videoFailed && (!!videoSrcMp4 || !!videoSrcWebm)

  return (
    <section ref={ref} className={`relative flex items-end overflow-hidden pb-24 md:pb-36 ${minHeight}`}>
      <motion.div className="absolute inset-0 h-[130%] -top-[15%]" style={{ y: imageY }}>
        {shouldUseVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc ?? src}
            onError={() => setVideoFailed(true)}
            className={`h-full w-full object-cover ${imgClassName}`}
          >
            {videoSrcWebm ? <source src={videoSrcWebm} type="video/webm" /> : null}
            {videoSrcMp4 ? <source src={videoSrcMp4} type="video/mp4" /> : null}
          </video>
        ) : (
          <>
            {/* Plain img intentional; fill layout is incompatible with this parallax overflow trick */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              fetchPriority="high"
              className={`h-full w-full object-cover ${imgClassName}`}
            />
          </>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/40 to-stone-900/10" />
      {children}
    </section>
  )
}
