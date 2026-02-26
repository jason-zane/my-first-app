'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

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
  useYouTube?: boolean
  youtubeVideoId?: string
  youtubeStartSeconds?: number
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
  useYouTube = false,
  youtubeVideoId,
  youtubeStartSeconds = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const [youtubeLoaded, setYoutubeLoaded] = useState(false)
  const [youtubeFailed, setYoutubeFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const shouldUseYouTube = useYouTube && !youtubeFailed && !!youtubeVideoId
  const shouldUseVideo = !shouldUseYouTube && useVideo && !videoFailed && (!!videoSrcMp4 || !!videoSrcWebm)
  const youtubeUrl = useMemo(() => {
    if (!youtubeVideoId) return ''
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      playsinline: '1',
      loop: '1',
      playlist: youtubeVideoId,
      controls: '0',
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      start: String(youtubeStartSeconds),
    })
    return `https://www.youtube.com/embed/${youtubeVideoId}?${params.toString()}`
  }, [youtubeVideoId, youtubeStartSeconds])

  useEffect(() => {
    if (!shouldUseYouTube) return
    const timer = setTimeout(() => {
      if (!youtubeLoaded) setYoutubeFailed(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [shouldUseYouTube, youtubeLoaded])

  return (
    <section ref={ref} className={`relative flex items-end overflow-hidden pb-24 md:pb-36 ${minHeight}`}>
      <motion.div className="absolute inset-0 h-[130%] -top-[15%]" style={{ y: imageY }}>
        {shouldUseYouTube ? (
          <iframe
            title="Hero video"
            src={youtubeUrl}
            className={`pointer-events-none h-full w-full object-cover ${imgClassName}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setYoutubeLoaded(true)}
          />
        ) : shouldUseVideo ? (
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
