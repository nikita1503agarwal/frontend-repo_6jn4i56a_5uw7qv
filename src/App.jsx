import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, Search, Filter, ChevronRight, CheckCircle2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useJSONLD(structured) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structured)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [structured])
}

function Navbar({ onOpenCart }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-surface/80 bg-surface/90 border-b border-white/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="h-16 grid grid-cols-12 items-center gap-4">
          <div className="col-span-6 md:col-span-3 flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cta" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5 text-white"/> : <Menu className="w-5 h-5 text-white"/>}
            </button>
            <div className="font-mono text-cta font-semibold tracking-tight">AI Webshop</div>
          </div>
          <nav className="col-span-6 hidden md:flex items-center gap-6 text-sm text-white/80">
            <a className="hover:text-white transition" href="#shop">Shop</a>
            <a className="hover:text-white transition" href="#services">Services</a>
            <a className="hover:text-white transition" href="#about">About</a>
            <a className="hover:text-white transition" href="#blog">Blog</a>
            <a className="hover:text-white transition" href="#contact">Contact</a>
          </nav>
          <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3">
            <button onClick={onOpenCart} className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-cta">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-white/5">
              <div className="py-3 grid gap-2 text-white/80">
                {[
                  ['#shop','Shop'],['#services','Services'],['#about','About'],['#blog','Blog'],['#contact','Contact']
                ].map(([href,label]) => (
                  <a key={href} className="px-2 py-2 rounded hover:bg-white/5" href={href} onClick={() => setOpen(false)}>{label}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-bg to-surface" aria-label="Hero">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 md:col-span-6">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Build and buy AI products with confidence
          </motion.h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            A premium, technical-first shop for AI agents, dashboards, and integrations. Crafted with a minimalist fintech aesthetic.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#shop" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cta text-black font-medium hover:brightness-110 transition focus:outline-none focus:ring-2 focus:ring-cta/60">
              Explore Products <ChevronRight className="w-4 h-4"/>
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-cta/60">
              Talk to sales
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-white/70">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-cta"/> Secure checkout</div>
            <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-cta"/> Major payments</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 h-[360px] md:h-[460px] relative rounded-xl bg-white/5 overflow-hidden">
          <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-bg/40 via-transparent to-cta/5" />
        </div>
      </div>
    </section>
  )
}

function useFetch(url, options) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(url, options)
      .then(r => r.json())
      .then(d => mounted && setData(d))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [url])
  return { data, loading, error }
}

function Shop({ onAddToCart }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [pending, setPending] = useState(false)
  const categories = useFetch(`${API_BASE}/api/categories`)
  const [products, setProducts] = useState([])

  useEffect(() => {
    const body = { q: q || undefined, category: category || undefined, limit: 24 }
    setPending(true)
    fetch(`${API_BASE}/api/products/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setPending(false))
  }, [q, category])

  return (
    <section id="shop" className="bg-bg py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Shop</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-[340px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2 rounded-md bg-surface text-white placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cta" />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <select value={category} onChange={e=>setCategory(e.target.value)} className="appearance-none pl-9 pr-8 py-2 rounded-md bg-surface text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cta">
                <option value="">All categories</option>
                {(categories.data?.categories||[]).map((c)=> (
                  <option key={c._id} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-6">
          {pending && (
            <div className="col-span-12 flex items-center gap-3 text-white/70"><Loader2 className="w-5 h-5 animate-spin"/> Loading products...</div>
          )}
          {!pending && products.length === 0 && (
            <div className="col-span-12 text-white/60">No products found.</div>
          )}
          {products.map((p)=> (
            <article key={p._id} className="col-span-12 sm:col-span-6 lg:col-span-4 bg-surface rounded-xl border border-white/5 overflow-hidden hover:border-cta/40 transition">
              <div className="aspect-video bg-gradient-to-tr from-white/5 to-cta/10"/>
              <div className="p-4">
                <h3 className="text-white font-medium line-clamp-1">{p.title}</h3>
                <p className="mt-1 text-white/60 text-sm line-clamp-2 min-h-[40px]">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-white font-semibold">${Number(p.price).toFixed(2)}</div>
                  <button onClick={()=>onAddToCart({ id: p._id, title: p.title, price: p.price })} className="px-3 py-1.5 rounded-md bg-cta text-black font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cta/60">
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services() {
  const items = [
    { title: 'Agent Integrations', desc: 'Custom AI agent workflows that plug into your stack.' },
    { title: 'Dashboards', desc: 'Operational dashboards for LLM metrics and performance.' },
    { title: 'Fintech-grade Security', desc: 'Compliance-first architecture and reviews.' },
  ]
  return (
    <section id="services" className="bg-surface py-16 border-t border-white/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Services</h2>
        <div className="mt-8 grid grid-cols-12 gap-6">
          {items.map((it)=> (
            <div key={it.title} className="col-span-12 md:col-span-4 bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="text-white font-medium">{it.title}</h3>
              <p className="text-white/70 mt-2 text-sm">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="bg-bg py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">About</h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            We build AI-native commerce experiences with precision and clarity. Our work replaces vague metaphors with concrete system diagrams, agent architectures, and operational dashboards.
          </p>
          <ul className="mt-4 space-y-2 text-white/70">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta"/> WCAG AA accessible</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta"/> Performance-optimized</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta"/> SEO ready</li>
          </ul>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <div className="text-sm font-mono text-white/70">System Diagram</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-white/60">Client</div>
              <div className="text-white font-medium">Web</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-white/60">Agents</div>
              <div className="text-white font-medium">Orchestrator</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-white/60">Data</div>
              <div className="text-white font-medium">MongoDB</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const { data } = useFetch(`${API_BASE}/api/testimonials`)
  const items = data?.testimonials || []
  return (
    <section className="bg-surface py-16 border-t border-white/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Testimonials</h2>
        <div className="mt-8 grid grid-cols-12 gap-6">
          {items.map((t) => (
            <figure key={t._id} className="col-span-12 md:col-span-6 lg:col-span-4 bg-white/5 p-5 rounded-xl border border-white/10">
              <blockquote className="text-white/80">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-sm text-white/60">— {t.author} {t.company ? `· ${t.company}` : ''}</figcaption>
            </figure>
          ))}
          {items.length === 0 && (
            <div className="col-span-12 text-white/60">Add testimonials via database to showcase proof.</div>
          )}
        </div>
      </div>
    </section>
  )}

function Portfolio() {
  const { data } = useFetch(`${API_BASE}/api/portfolio`)
  const items = data?.items || []
  return (
    <section className="bg-bg py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Portfolio</h2>
        <div className="mt-8 grid grid-cols-12 gap-6">
          {items.map((p)=> (
            <a key={p._id} href={p.url} target="_blank" rel="noreferrer" className="col-span-12 md:col-span-6 lg:col-span-4 group bg-surface p-5 rounded-xl border border-white/5 hover:border-cta/40 transition">
              <div className="text-white font-medium group-hover:text-cta transition">{p.title}</div>
              <div className="text-white/60 text-sm mt-1 line-clamp-2">{p.description}</div>
              <div className="mt-2 text-xs text-white/50">{p.metrics}</div>
            </a>
          ))}
          {items.length === 0 && (
            <div className="col-span-12 text-white/60">Add portfolio items in the database to populate this section.</div>
          )}
        </div>
      </div>
    </section>
  )}

function Blog() {
  const { data } = useFetch(`${API_BASE}/api/blog`)
  const posts = data?.posts || []
  return (
    <section id="blog" className="bg-surface py-16 border-t border-white/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">News</h2>
        <div className="mt-8 grid grid-cols-12 gap-6">
          {posts.map((p)=> (
            <article key={p._id} className="col-span-12 md:col-span-6 lg:col-span-4 bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-white font-medium">{p.title}</h3>
              <p className="text-white/70 text-sm mt-1 line-clamp-3">{p.content}</p>
              <a href={p.url || '#'} className="text-cta text-sm inline-flex items-center gap-1 mt-2">Read <ChevronRight className="w-4 h-4"/></a>
            </article>
          ))}
          {posts.length === 0 && (
            <div className="col-span-12 text-white/60">No posts yet.</div>
          )}
        </div>
      </div>
    </section>
  )}

function Contact() {
  return (
    <section id="contact" className="bg-bg py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Contact</h2>
          <p className="mt-3 text-white/70">Have a project in mind? Let’s build it.</p>
          <div className="mt-6 text-sm text-white/60">
            <div>Email: hello@example.com</div>
            <div>Twitter: @aishop</div>
          </div>
        </div>
        <form className="bg-surface rounded-xl p-6 border border-white/5">
          <label className="block text-sm text-white/70">Name
            <input className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cta" placeholder="Your name"/>
          </label>
          <label className="block text-sm text-white/70 mt-4">Email
            <input type="email" className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cta" placeholder="you@company.com"/>
          </label>
          <label className="block text-sm text-white/70 mt-4">Message
            <textarea className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cta" rows="4" placeholder="Tell us about your needs"/>
          </label>
          <button type="button" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cta text-black font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cta/60">Send</button>
        </form>
      </div>
    </section>
  )
}

function CartDrawer({ open, onClose, items, onUpdateQty, onCheckout, loading }) {
  const total = items.reduce((s, it) => s + it.price * it.qty, 0)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 24 }} className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-surface border-l border-white/10 z-50">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="text-white font-medium">Your Cart</h3>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cta" aria-label="Close cart"><X className="w-5 h-5 text-white"/></button>
            </div>
            <div className="p-4 space-y-3 overflow-auto h-[calc(100%-160px)]">
              {items.length === 0 && <div className="text-white/60">Your cart is empty.</div>}
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between bg-white/5 p-3 rounded-md">
                  <div>
                    <div className="text-white">{it.title}</div>
                    <div className="text-white/60 text-sm">${it.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>onUpdateQty(it.id, Math.max(1, it.qty-1))} className="px-2 py-1 rounded bg-white/10 text-white">-</button>
                    <div className="text-white w-6 text-center">{it.qty}</div>
                    <button onClick={()=>onUpdateQty(it.id, it.qty+1)} className="px-2 py-1 rounded bg-white/10 text-white">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between text-white"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <button disabled={items.length===0 || loading} onClick={onCheckout} className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cta text-black font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cta/60 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CreditCard className="w-4 h-4"/>}
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  // JSON-LD structured data
  useJSONLD({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'AI Webshop',
    url: window.location.origin,
    sameAs: ['https://twitter.com/aishop'],
  })

  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [checkingOut, setCheckingOut] = useState(false)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function addToCart(p) {
    setCart((prev) => {
      const ex = prev.find(x => x.id === p.id)
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { id: p.id, title: p.title, price: p.price, qty: 1 }]
    })
    setCartOpen(true)
  }

  function updateQty(id, qty) {
    setCart((prev)=> prev.map(x => x.id === id ? { ...x, qty } : x))
  }

  async function handleCheckout() {
    try {
      setCheckingOut(true)
      const payload = { email: null, items: cart.map(c => ({ product_id: c.id, title: c.title, unit_price: c.price, quantity: c.qty })) }
      const res = await fetch(`${API_BASE}/api/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      // Simulate immediate success for demo
      setTimeout(()=>{
        setCheckingOut(false)
        setCart([])
        alert(`Order confirmed. Amount: $${(data.amount||0).toFixed(2)}`)
        setCartOpen(false)
      }, 900)
    } catch (e) {
      setCheckingOut(false)
      alert('Checkout failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      <a href="#shop" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-cta text-black px-3 py-1 rounded">Skip to content</a>
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <Hero />
      <Shop onAddToCart={addToCart} />
      <Services />
      <About />
      <Portfolio />
      <Blog />
      <Contact />
      <footer className="bg-surface border-t border-white/10 py-8 text-center text-white/60">© {new Date().getFullYear()} AI Webshop</footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onUpdateQty={updateQty} onCheckout={handleCheckout} loading={checkingOut} />
    </div>
  )
}
