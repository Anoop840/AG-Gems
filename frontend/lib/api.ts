const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  walletAddress?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ExchangeRateResponse {
  success: boolean;
  inrToEthRate: number; // e.g., 0.0000035064
  ethPriceInInr: number; // e.g., 285195.6884
  message?: string;
}
// --- NEW WISHLIST INTERFACES ---
export interface WishlistResponse {
  success: boolean;
  wishlist: Product[]; // Assuming the product structure is the same as existing 'Product'
  message?: string;
}
export interface LoginData {
  email: string;
  password: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Set token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove token from localStorage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
// --- NEW WISHLIST API ---
export const wishlistAPI = {
  getWishlist: async (): Promise<WishlistResponse> => {
    return apiRequest<WishlistResponse>('/wishlist');
  },

  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    return apiRequest<WishlistResponse>(`/wishlist/add/${productId}`, {
      method: 'POST',
    });
  },

  removeFromWishlist: async (productId: string): Promise<WishlistResponse> => {
    return apiRequest<WishlistResponse>(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  },
};
// API request helper for JSON data
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  // 1. Initialize as a new Headers object, passing in any existing headers.
  //    This constructor correctly handles all parts of the HeadersInit type.
  const headers = new Headers(options.headers);

  // 2. Set the Content-Type if it's not already set.
  //    Using .set() avoids duplicates.
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 3. Use the .set() method to safely add the Authorization header.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If response is not JSON, create a generic error
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

// --- NEW HELPER FOR FILE UPLOADS ---
export const fileUploadRequest = async <T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);

  // NOTE: When sending FormData, the browser automatically sets the
  // 'Content-Type' header with the boundary, so we explicitly OMIT it here.

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Create a new options object without the 'Content-Type' header if it exists,
  // to ensure the browser sets the correct multipart/form-data header.
  const uploadOptions: RequestInit = {
    ...options,
    method: 'POST', // File uploads are typically POST
    body: formData,
    headers: headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, uploadOptions);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`File upload request failed with status ${response.status}`);
  }

  if (!response.ok) {
    const errorMessage = data.message || data.error || `File upload failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};
// ------------------------------------

// Auth API functions
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    return apiRequest<{ success: boolean; user: User }>('/auth/me');
  },

  logout: (): void => {
    removeToken();
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },
};

// Cart interfaces
export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images?: Array<{
      url: string;
      alt?: string;
      isPrimary?: boolean;
    }>;
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message?: string;
}

export interface OrderItem {
  product: string; // Just the ID
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentDetails: {
    transactionId?: string;
    paidAt?: string;
    currency?: string;
    amountPaid?: number;
  },
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  message?: string;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

// Cart API functions
export const cartAPI = {
  getCart: async (): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart');
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Order API functions
export const orderAPI = {
  createOrder: async (orderData: {
    items: { product: string; quantity: number }[];
    shippingAddress: Partial<ShippingAddress>;
    paymentMethod: string;
  }): Promise<OrderResponse> => {
    return apiRequest<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrder: async (id: string): Promise<OrderResponse> => {
    return apiRequest<OrderResponse>(`/orders/${id}`);
  },

  // <<< NEW FUNCTION >>>
  getMyOrders: async (): Promise<OrdersResponse> => {
    return apiRequest<OrdersResponse>('/orders/my-orders');
  }
};

// Payment API types
export interface RazorpayOrderResponse {
  success: boolean;
  orderId: string; // This is the Razorpay order ID
  amount: number;
  currency: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

// Payment API functions
export const paymentAPI = {
  createRazorpayOrder: async (amount: number, orderId: string): Promise<RazorpayOrderResponse> => {
    return apiRequest<RazorpayOrderResponse>('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  },

  // 🛠️ NEW FUNCTION: Fetch real-time ETH to INR rate
  getEthExchangeRate: async (): Promise<ExchangeRateResponse> => {
    return apiRequest<ExchangeRateResponse>('/payment/exchange-rate');
  },
  
  // 🛠️ FIX: Moved verifyCryptoPayment outside of createRazorpayOrder
  verifyCryptoPayment: async (data: {
    orderId: string;
    txHash: string;
    amountPaid: string;
    currency: string;
  }): Promise<VerifyPaymentResponse> => {
    return apiRequest<VerifyPaymentResponse>('/payment/verify-crypto', { // NEW ENDPOINT
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyPayment: async (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    orderId: string;
  }): Promise<VerifyPaymentResponse> => {
    return apiRequest<VerifyPaymentResponse>('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Product interfaces
export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: {
    _id: string;
    name: string;
    slug?: string;
  };
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  material?: string;
  metal?: {
    type?: string;
    purity?: string;
    weight?: number;
  };
  weight?: number;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

// Image upload types
interface UploadImageResponse {
  success: boolean;
  url: string;
  publicId: string;
}

// Product API functions
export const productAPI = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    sort?: string;
    search?: string;
    includeInactive?: boolean;
  }): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return apiRequest<ProductsResponse>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct: async (id: string): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>(`/products/${id}`);
  },

  getFeaturedProducts: async (): Promise<ProductsResponse> => {
    return apiRequest<ProductsResponse>('/products/featured/list');
  },

  // Admin functions
  createProduct: async (productData: Partial<Product>): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Category interfaces
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order?: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

// Category API functions
export const categoryAPI = {
  getCategories: async (): Promise<CategoriesResponse> => {
    return apiRequest<CategoriesResponse>('/categories');
  },
};

// --- NEW UPLOAD API ---
export const uploadAPI = {
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    // 'image' must match the key expected by the backend's multer upload.single('image')
    formData.append('image', file);
    
    return fileUploadRequest<UploadImageResponse>('/upload/image', formData);
  }
}
// --------------------
// --- NEW USER API ---
export const usersAPI = {
  linkWallet: async (walletAddress: string): Promise<{ success: boolean; message: string; user: User }> => {
    return apiRequest<{ success: boolean; message: string; user: User }>('/users/link-wallet', {
        method: 'PUT',
        body: JSON.stringify({ walletAddress }),
    });
  },

  unlinkWallet: async (): Promise<{ success: boolean; message: string; user: User }> => {
    return apiRequest<{ success: boolean; message: string; user: User }>('/users/unlink-wallet', {
        method: 'PUT',
    });
  }
}
// --------------------