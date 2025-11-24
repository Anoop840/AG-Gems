"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { productAPI, Product, categoryAPI, Category, uploadAPI } from "@/lib/api" // ADD uploadAPI
import { useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, Loader2, X, UploadCloud } from "lucide-react" // ADD UploadCloud
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State for image file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Holds the actual file object
  const [isUploading, setIsUploading] = useState(false) // Tracks image upload status

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    category: '',
    material: '',
    stock: '',
    weight: '',
    // imageUrl is now managed separately, but kept for editing view
    imageUrl: '', 
    isFeatured: false,
    isActive: true,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchProducts()
    fetchCategories()
  }, [isAuthenticated, user, router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Get all products including inactive ones for admin
      const response = await productAPI.getProducts({ limit: 1000, includeInactive: true })
      if (response.success) {
        setProducts(response.products)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load products',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories()
      if (response.success) {
        setCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleOpenDialog = (product?: Product) => {
    // Reset file state on opening dialog
    setSelectedFile(null)
    setIsUploading(false)

    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        category: product.category?._id || '',
        material: product.material || '',
        stock: product.stock.toString(),
        weight: product.weight?.toString() || '',
        imageUrl: product.images?.[0]?.url || '', // Set existing URL for display
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        compareAtPrice: '',
        category: '',
        material: '',
        stock: '',
        weight: '',
        imageUrl: '',
        isFeatured: false,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  // Handles file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      // Clear the static placeholder URL when a new file is selected
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
    } else {
      setSelectedFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Combined submission flag
    setIsSubmitting(true)
    setIsUploading(true)
    let finalImageUrl = formData.imageUrl; // Start with existing/placeholder URL

    try {
      // 1. Handle Image Upload if a new file is selected
      if (selectedFile) {
        toast({
          title: 'Uploading Image...',
          description: `Uploading ${selectedFile.name} to Cloudinary.`,
        });

        const uploadResponse = await uploadAPI.uploadImage(selectedFile)
        finalImageUrl = uploadResponse.url // Use the new Cloudinary URL
        
        toast({
          title: 'Image Uploaded',
          description: 'Image upload complete. Saving product details.',
        });
      } else if (!finalImageUrl) {
         // If no new file and no existing image URL (only for new products)
         throw new Error('Please upload an image or provide an image URL.');
      }
      
      setIsUploading(false)
      
      // 2. Prepare Product Payload
      const productPayload: any = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        // Update images array with the final URL
        images: finalImageUrl ? [{
          url: finalImageUrl,
          alt: formData.name,
          isPrimary: true
        }] : []
      }

      // Optional fields
      if (formData.compareAtPrice) {
        productPayload.compareAtPrice = Number(formData.compareAtPrice)
      }
      if (formData.material) {
        productPayload.material = formData.material
      }
      if (formData.weight) {
        productPayload.weight = Number(formData.weight)
      }


      // 3. Create or Update Product
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, productPayload)
        toast({
          title: 'Success',
          description: 'Product updated successfully!',
        })
      } else {
        await productAPI.createProduct(productPayload)
        toast({
          title: 'Success',
          description: 'Product created successfully!',
        })
      }

      setIsDialogOpen(false)
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await productAPI.deleteProduct(productId)
      toast({
        title: 'Success',
        description: 'Product deleted successfully!',
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // --- Image Preview / Upload Component ---
  const renderImageInput = () => {
    const currentImageUrl = selectedFile ? URL.createObjectURL(selectedFile) : formData.imageUrl;
    const isImageVisible = !!currentImageUrl;
    const isDisabled = isSubmitting || isUploading;

    return (
      <div className="space-y-2">
        <Label htmlFor="imageUpload">Product Image *</Label>
        <div className="flex flex-col gap-4">
          
          {/* Image Preview */}
          <div className="w-full h-48 bg-background border border-dashed border-border rounded-lg flex items-center justify-center relative">
            {isImageVisible ? (
              <>
                <Image 
                  src={currentImageUrl} 
                  alt="Product Preview" 
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-lg p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    target.style.objectFit = 'contain';
                  }}
                />
                {/* Clear Button for Image */}
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="absolute top-2 right-2 z-10 size-6"
                  onClick={() => {
                    setSelectedFile(null);
                    setFormData((prev) => ({ ...prev, imageUrl: '' }));
                    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <UploadCloud className="w-8 h-8 mb-2" />
                <p className="text-sm">Upload or paste URL below</p>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-primary font-medium">Uploading...</span>
              </div>
            )}
          </div>
          
          {/* File Input */}
          <Input 
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isDisabled}
            className="w-full"
          />
          
          <div className="relative text-center">
            <span className="text-muted-foreground text-xs bg-secondary px-2 relative z-10">OR</span>
            <hr className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
          </div>
          
          {/* Direct URL Input (Fallback) */}
          <Input
            id="imageUrl"
            value={!selectedFile ? formData.imageUrl : ''} // Only show URL if no file is selected
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="Paste public image URL here"
            disabled={isDisabled || !!selectedFile} // Disable if a file is selected
          />
        </div>
        
        <p className="text-xs text-muted-foreground">Recommended size: 600x600. Max 5MB file size.</p>
      </div>
    );
  };
  // ------------------------------------

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"> {/* Increased max-width */}
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload Component */}
                    {renderImageInput()} 
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          required
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Input
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          min="0"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare At Price (₹)</Label>
                        <Input
                          id="compareAtPrice"
                          type="number"
                          value={formData.compareAtPrice}
                          onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                          min="0"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                          min="0"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Select
                          value={formData.material}
                          onValueChange={(value) => setFormData({ ...formData, material: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="diamond">Diamond</SelectItem>
                            <SelectItem value="gemstone">Gemstone</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (grams)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          min="0"
                          step="0.1"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-4 h-4"
                          disabled={isSubmitting}
                        />
                        <span>Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4"
                          disabled={isSubmitting}
                        />
                        <span>Active</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || isUploading || (!selectedFile && !formData.imageUrl)}
                      >
                        {isSubmitting || isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? 'Uploading Image...' : 'Saving Product...'}
                          </>
                        ) : (
                          editingProduct ? 'Update Product' : 'Create Product'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-secondary rounded-lg p-6">
              <h2 className="font-display text-2xl font-bold mb-6 text-foreground">Products Management</h2>
              
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No products found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold text-foreground">Image</th>
                        <th className="text-left p-4 font-semibold text-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-foreground">Category</th>
                        <th className="text-left p-4 font-semibold text-foreground">Price</th>
                        <th className="text-left p-4 font-semibold text-foreground">Stock</th>
                        <th className="text-left p-4 font-semibold text-foreground">Status</th>
                        <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const imageUrl = product.images?.[0]?.url || '/placeholder.svg'
                        return (
                          <tr key={product._id} className="border-b border-border hover:bg-background/50">
                            <td className="p-4">
                              <div className="w-16 h-16 relative rounded overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-medium text-foreground">{product.name}</td>
                            <td className="p-4 text-muted-foreground">{product.category?.name || 'N/A'}</td>
                            <td className="p-4 text-foreground">₹{product.price.toLocaleString()}</td>
                            <td className="p-4 text-foreground">{product.stock}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenDialog(product)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(product._id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}