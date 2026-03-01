'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type StickyVisibilityOptions = {
  ctaKey: string
  registerSelector?: string
  idleMs?: number
}

export function useStickyCtaVisibility({
  ctaKey,
  registerSelector = '#register',
  idleMs = 8000,
}: StickyVisibilityOptions) {
  const storageKey = useMemo(() => `stickyCtaDismissed:${ctaKey}`, [ctaKey])
  const [visible, setVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
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
    if (blocked || dismissed) {
      setVisible(false)
    }
  }, [blocked, dismissed])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let idleTimer: number | null = null

    const onScroll = () => {
      setHasScrolled(true)
      if (!dismissed && !blocked) {
        setVisible(true)
      }
      if (idleTimer) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => setVisible(false), idleMs)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (idleTimer) window.clearTimeout(idleTimer)
    }
  }, [blocked, dismissed, idleMs])

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
    const onFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget as Node | null
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
    setVisible(false)
  }, [storageKey])

  return {
    visible: visible && hasScrolled && !dismissed && !blocked,
    dismiss,
  }
}
