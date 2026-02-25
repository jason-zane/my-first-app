import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#2C4A3E] py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <p className="mb-3 font-serif text-2xl font-bold text-[#FAF8F4]">Miles Between</p>
            <p className="text-sm leading-relaxed text-[#7A9E8E]">
              Running retreats for people who love the journey.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
              Explore
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { href: '/retreats', label: 'Retreats' },
                { href: '/experience', label: 'The Experience' },
                { href: '/about', label: 'About' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#A8C4B8] transition-colors hover:text-[#FAF8F4]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
              Get in touch
            </p>
            <Link
              href="mailto:hello@milesbetween.com.au"
              className="text-sm text-[#A8C4B8] transition-colors hover:text-[#FAF8F4]"
            >
              hello@milesbetween.com.au
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-[#FAF8F4]/10 pt-8 text-center">
          <p className="text-xs text-[#7A9E8E]">
            © {new Date().getFullYear()} Miles Between. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
