const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
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

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

