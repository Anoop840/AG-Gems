"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useState } from "react"

interface ProductCardProps {
  id: string
  image: string
  title: string
  price: number
  category: string
}

export default function ProductCard({ id, image, title, price, category }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <Link href={`/product/${id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-secondary mb-4 aspect-square">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorited(!isFavorited)
            }}
            className="absolute top-3 right-3 p-2 bg-background/90 rounded-full hover:bg-background transition-colors"
          >
            <Heart size={18} className={isFavorited ? "fill-primary text-primary" : "text-foreground"} />
          </button>
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{category}</p>
        <p className="text-primary font-semibold">₹{price.toLocaleString()}</p>
      </div>
    </Link>
  )
}
