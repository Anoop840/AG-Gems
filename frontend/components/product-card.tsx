"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useState,useEffect } from "react"
import { wishlistAPI } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  id: string
  image: string
  title: string
  price: number
  category: string
  initialIsFavorited?: boolean
}

function ProductCard({ id, image, title, price, category, initialIsFavorited = false }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent navigating to product page

    try {
      if (isFavorited) {
        await wishlistAPI.removeFromWishlist(id)
        toast({ title: "Removed from Wishlist", description: `${title} removed successfully.` })
      } else {
        await wishlistAPI.addToWishlist(id)
        toast({ title: "Added to Wishlist", description: `${title} added successfully.` })
      }
      
      // Toggle state on success
      setIsFavorited(prev => !prev)

      // Optional: Dispatch a global event if other components (like navbar icon) need to know
      window.dispatchEvent(new CustomEvent('wishlistUpdated')) 

    } catch (error: any) {
      if (error.message.includes('Not authorized')) {
         toast({ title: 'Sign In Required', description: 'Please log in to manage your wishlist.', variant: 'destructive' })
      } else {
         toast({ title: 'Error', description: error.message || 'Failed to update wishlist.', variant: 'destructive' })
      }
    }
  }
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
            onClick={handleToggleFavorite}
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

export default ProductCard