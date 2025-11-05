"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">We'd love to hear from you</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Phone, title: "Phone", content: "+91 6378553485", link: "tel:+916378553485" },
              { icon: Mail, title: "Email", content: "anoopag136@gmail.com", link: "anoopag136@gmail.com" },
              { icon: MapPin, title: "Address", content: "Premium Plaza, Luxury Lane, Mumbai, India", link: "#" },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <a
                  key={idx}
                  href={item.link}
                  className="bg-secondary rounded-lg p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="text-primary" size={24} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.content}</p>
                </a>
              )
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-secondary rounded-lg p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <textarea
                placeholder="Your Message"
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Map placeholder */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Visit Our Store</h2>
            <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Google Map Integration Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
