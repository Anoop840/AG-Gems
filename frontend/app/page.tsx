"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const FEATURED_PRODUCTS = [
  { id: "1", image: "/gold-necklace.png", title: "Elegance Necklace", price: 45000, category: "Necklaces" },
  { id: "2", image: "/sparkling-diamond-ring.png", title: "Timeless Ring", price: 65000, category: "Rings" },
  { id: "3", image: "/pearl-earrings.png", title: "Pearl Earrings", price: 28000, category: "Earrings" },
  { id: "4", image: "/gold-bracelet.png", title: "Royal Bracelet", price: 52000, category: "Bracelets" },
]

const TESTIMONIALS = [
  { name: "Priya Singh", text: "The craftsmanship is exceptional. Every piece is truly a work of art." },
  { name: "Rajesh Kumar", text: "Authentic luxury at its finest. I purchased this for my wife and she loves it." },
  { name: "Anjali Patel", text: "Best jewellery experience. The customer service was impeccable." },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_PRODUCTS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_PRODUCTS.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_PRODUCTS.length) % FEATURED_PRODUCTS.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Timeless Elegance Awaits
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our exquisite collection of luxury jewellery crafted with precision and passion
          </p>
          <Link
            href="/shop"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Featured Collections</h2>

          <div className="relative">
            <div className="relative h-96 sm:h-96 rounded-lg overflow-hidden bg-secondary mb-6">
              <Image
                src={FEATURED_PRODUCTS[currentSlide].image || "/placeholder.svg"}
                alt={FEATURED_PRODUCTS[currentSlide].title}
                fill
                className="object-cover"
              />

              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors z-10"
              >
                <ChevronLeft size={24} className="text-foreground" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors z-10"
              >
                <ChevronRight size={24} className="text-foreground" />
              </button>

              {/* Product Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-6">
                <h3 className="font-display text-2xl font-bold text-background mb-1">
                  {FEATURED_PRODUCTS[currentSlide].title}
                </h3>
                <p className="text-background/90 mb-3">₹{FEATURED_PRODUCTS[currentSlide].price.toLocaleString()}</p>
                <Link
                  href={`/product/${FEATURED_PRODUCTS[currentSlide].id}`}
                  className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2">
              {FEATURED_PRODUCTS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Necklaces", "Rings", "Earrings", "Bracelets"].map((category) => (
              <Link key={category} href={`/shop?category=${category.toLowerCase()}`} className="group">
                <div className="bg-background rounded-lg p-8 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{category}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Explore Collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Customer Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-secondary rounded-lg p-6 border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
                <p className="font-semibold text-foreground">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">Exclusive Offers Await</h2>
          <p className="text-primary-foreground/90 mb-6">
            Subscribe to our newsletter for special discounts and new collection launches
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground text-foreground placeholder:text-foreground/60 focus:outline-none"
            />
            <button className="bg-background text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
