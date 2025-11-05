"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Check } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-foreground mb-4">About Aurum Luxe</h1>
            <p className="text-lg text-muted-foreground">Crafting timeless elegance since 1995</p>
          </div>

          {/* Brand Story */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-foreground mb-4 leading-relaxed">
                Founded in 1995, Aurum Luxe has been a beacon of luxury and craftsmanship. What started as a small
                family business has grown into a trusted name in premium jewellery.
              </p>
              <p className="text-foreground mb-4 leading-relaxed">
                Every piece in our collection is meticulously crafted by master artisans with over 20 years of
                experience. We believe in using only the finest materials and ethical sourcing.
              </p>
              <p className="text-foreground leading-relaxed">
                Our commitment to excellence and timeless design has made Aurum Luxe the choice of discerning customers
                across India.
              </p>
            </div>
            <div className="bg-secondary rounded-lg h-96" />
          </div>

          {/* Values */}
          <div className="bg-secondary rounded-lg p-8 mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Craftsmanship", desc: "Meticulous attention to detail in every creation" },
                { title: "Quality", desc: "Only premium materials and ethical sourcing" },
                { title: "Innovation", desc: "Blending tradition with contemporary designs" },
                { title: "Trust", desc: "Building lasting relationships with our customers" },
              ].map((value, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
                      <Check size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { number: "29+", label: "Years of Excellence" },
              { number: "50k+", label: "Happy Customers" },
              { number: "1000+", label: "Unique Designs" },
              { number: "10", label: "Premium Collections" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="font-display text-4xl font-bold text-primary mb-2">{stat.number}</p>
                <p className="text-foreground font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
