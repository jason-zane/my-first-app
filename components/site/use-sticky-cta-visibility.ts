'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type StickyVisibilityOptions = {
  ctaKey: string
  registerSelector?: string
}

export function useStickyCtaVisibility({
  ctaKey,
  registerSelector = '#register',
}: StickyVisibilityOptions) {
  const storageKey = useMemo(() => `stickyCtaDismissed:${ctaKey}`, [ctaKey])
  const [pastThreshold, setPastThreshold] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [inView, setInView] = useState(false)
  const [focusInForm, setFocusInForm] = useState(false)

  const blocked = inView || focusInForm

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(storageKey)
    if (stored === '1') setDismissed(true)
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateThreshold = () => {
      setPastThreshold(window.scrollY > window.innerHeight * 0.85)
    }

    updateThreshold()
    window.addEventListener('scroll', updateThreshold, { passive: true })
    window.addEventListener('resize', updateThreshold)

    return () => {
      window.removeEventListener('scroll', updateThreshold)
      window.removeEventListener('resize', updateThreshold)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const target = document.querySelector(registerSelector)
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        setInView(isIntersecting)
      },
      { threshold: 0.2 }
    )

    observer.observe(target)

    const onFocusIn = () => setFocusInForm(true)
    const onFocusOut = (event: Event) => {
      const nextTarget =
        event instanceof FocusEvent ? (event.relatedTarget as Node | null) : null
      if (!nextTarget || !target.contains(nextTarget)) {
        setFocusInForm(false)
      }
    }

    target.addEventListener('focusin', onFocusIn)
    target.addEventListener('focusout', onFocusOut)

    return () => {
      observer.disconnect()
      target.removeEventListener('focusin', onFocusIn)
      target.removeEventListener('focusout', onFocusOut)
    }
  }, [registerSelector])

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(storageKey, '1')
    }
    setDismissed(true)
  }, [storageKey])

  return {
    visible: pastThreshold && !dismissed && !blocked,
    dismiss,
  }
}
