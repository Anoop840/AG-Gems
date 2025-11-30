import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-background font-display font-bold">A</span>
              </div>
              <span className="font-display text-lg font-semibold">AG GEMS</span>
            </div>
            <p className="text-background/80 text-sm">Crafting timeless elegance in every piece</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop?category=necklaces"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  Necklaces
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=rings"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  Rings
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=earrings"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  Earrings
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=bracelets"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  Bracelets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-background/80 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-background/80 hover:text-background transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Newsletter</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-background/20 text-background placeholder:text-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">© 2025 Aurum Luxe. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-background/80 hover:text-background transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-background/80 hover:text-background transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-background/80 hover:text-background transition-colors">
              <Twitter size={20} />
            </a>
            <a href="anoopag136@gmail.com" className="text-background/80 hover:text-background transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
