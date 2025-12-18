"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, Menu, X, User, LogOut, Settings, Shield, Wallet, Loader2 } from "lucide-react" // Added Wallet icon
import { useAuth } from "@/context/AuthContext"
import { useWallet } from "@/context/WalletConnect" // IMPORT NEW HOOK
import { cartAPI, wishlistAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { user, isAuthenticated, logout, loading } = useAuth()
  const { isConnected, shortenedAccount, connectWallet, isMetaMaskInstalled, isLoading: isWalletLoading } = useWallet() // USE WALLET HOOK

  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchCartCount()
      fetchWishlistCount()
    } else {
      setCartCount(0)
      setWishlistCount(0)
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount()
    }
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchWishlistCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [isAuthenticated, loading])

  const fetchWishlistCount = async () => {
    try {
      const response = await wishlistAPI.getWishlist()
      if (response.success && response.wishlist) {
        setWishlistCount(response.wishlist.length)
      }
    } catch (error) {
      // Silently fail - wishlist might not be accessible
      setWishlistCount(0)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.getCart()
      if (response.success && response.cart) {
        const totalItems = response.cart.items.reduce((sum, item) => sum + item.quantity, 0)
        setCartCount(totalItems)
      }
    } catch (error) {
      // Silently fail - cart might not be accessible
      setCartCount(0)
    }
  }

  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  
  // --- Wallet Connect Button Component ---
  const renderWalletButton = () => {
    if (!isMetaMaskInstalled) {
      return (
        <Button variant="outline" size="sm" onClick={() => window.open('https://metamask.io/download/', '_blank')}>
          Install MetaMask
        </Button>
      );
    }
    
    if (isWalletLoading) {
      return (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (isConnected) {
      return (
        <Button variant="secondary" size="sm" asChild>
          <Link href="/profile">
            <Wallet className="mr-2 h-4 w-4" />
            {shortenedAccount}
          </Link>
        </Button>
      );
    }

    return (
      <Button variant="outline" size="sm" onClick={connectWallet}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }
  // ------------------------------------

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">A</span>
            </div>
            <span className="hidden sm:inline font-display text-xl font-semibold text-foreground">AG GEMS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
              Home
            </Link>
            <Link href="/shop" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
              Shop
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
              Contact
            </Link>
          </div>

          {/* Icons and Auth */}
          <div className="flex items-center gap-4">
            {renderWalletButton()} {/* ADD WALLET BUTTON */}
            
            <Link href="/wishlist" className="relative text-foreground hover:text-primary transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
            </Link>
            {isAuthenticated ? (
              <Link href="/cart" className="relative text-foreground hover:text-primary transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link href="/login" className="relative text-foreground hover:text-primary transition-colors">
                <ShoppingCart size={20} />
              </Link>
            )}

            {!loading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Avatar>
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline text-sm font-medium">
                          {user.firstName}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              Home
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              Contact
            </Link>
            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-destructive hover:bg-secondary rounded-lg transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}