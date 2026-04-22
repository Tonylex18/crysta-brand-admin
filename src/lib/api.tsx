import axios from 'axios';

// API base URL - will be configured based on environment
const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api/';
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors with token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/auth';

            try {
                const refreshResponse = await authAPI.refreshToken();
                localStorage.setItem('authToken', refreshResponse.accessToken);

                originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('authToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Type definitions
export type Admin = {
    id: string;
    email: string;
    name?: string;
    created_at: string;
};


export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id?: { id?: string; _id?: string; name?: string; slug?: string } | string | null;
    created_at: string;
};

export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    category_id: string | null;
    rating?: number;
    rating_count?: number;
    image_url: string | null;
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
    featured: boolean;
    created_at: string;
};

export type FlashSale = {
    id: string;
    title: string;
    subtitle?: string;
    discountPercentage: number;
    startsAt: string;
    endsAt: string;
    isEnabled: boolean;
    ctaLabel?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type Order = {
    id: string;
    user_id: string;
    status: string;
    total: number;
    shipping_address: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    created_at: string;
};

export type ShippingSettings = {
    id: string;
    buffer_percentage: number | null;
    default_fee: number | null;
    minimum_fee: number | null;
};

export type ShippingRate = {
    id: string;
    state: string;
    base_fee: number;
    is_active: boolean;
    last_updated?: string;
};

export type LocationState = {
    id: string;
    name: string;
    capital?: string;
};

export type LocationCity = {
    id: string;
    name: string;
    state_id: string;
};

// Auth API
export const authAPI = {
    signUp: async (name: string, email: string, password: string) => {
        const response = await api.post('admin/admin-signup', { name, email, password });
        const data = response.data;
        return {
            admin: data.user,
            token: data.accessToken,
        };
    },

    signIn: async (email: string, password: string) => {
        const response = await api.post('admin/admin-login', { email, password });
        const data = response.data;
        return {
            admin: data.user,
            token: data.accessToken,
        };
    },

    getProfile: async () => {
        const response = await api.get('admin/profile');
        return response.data;
    },

    signOut: async () => {
        const response = await api.post('admin/admin-signout');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('admin/refresh-token');
        return response.data;
    },
};

// Email verification API (user routes)
export const verificationAPI = {
    verifyEmail: async (email: string, otp: string | number) => {
        const response = await api.post('admin/verify-admin-mail', { email, otp });
        return response.data;
    },
    resendOtp: async (email: string) => {
        const response = await api.post('admin/request-new-otp', { email });
        return response.data;
    },
};

// Locations API
export const locationsAPI = {
    getStates: async (): Promise<{ states: LocationState[] }> => {
        const response = await api.get('locations/states');
        return response.data;
    },
    getCitiesByStateId: async (stateId: string): Promise<{ cities: LocationCity[] }> => {
        const response = await api.get(`locations/states/${stateId}/cities`);
        return response.data;
    },
    getCitiesByStateName: async (state: string): Promise<{ cities: LocationCity[] }> => {
        const response = await api.get('locations/cities', { params: { state } });
        return response.data;
    },
};

// Customer records
export const customerAPI = {
    getAllCustomer: async () => {
        const response = await api.get("user/get-all-users")
        return response.data;
    }
}

// Products API
export const productsAPI = {
    addProduct: async (productData: FormData) => {
        const response = await api.post('products/add-product', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateProduct: async (id: string, productData: FormData) => {
        const response = await api.put(`products/update-product/${id}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete(`products/delete-product/${id}`);
        return response.data;
    },

    activateProduct: async (id: string) => {
        const response = await api.patch(`products/activate-product/${id}`);
        return response.data;
    },

    deactivateProduct: async (id: string) => {
        const response = await api.patch(`products/deactivate-product/${id}`);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('products/get-products');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`products/get-single-product/${id}`);
        return response.data;
    },

    getByCategory: async (categoryId: string) => {
        const response = await api.get(`products/category/${categoryId}`);
        return response.data;
    },
};

export const flashSalesAPI = {
    getAll: async () => {
        const response = await api.get('flash-sales');
        return response.data;
    },
    getActive: async () => {
        const response = await api.get('flash-sales/active');
        return response.data;
    },
    create: async (payload: {
        title: string;
        subtitle?: string;
        discountPercentage: number;
        startsAt: string;
        endsAt: string;
        ctaLabel?: string;
        isEnabled: boolean;
    }) => {
        const response = await api.post('flash-sales', payload);
        return response.data;
    },
    update: async (id: string, payload: {
        title: string;
        subtitle?: string;
        discountPercentage: number;
        startsAt: string;
        endsAt: string;
        ctaLabel?: string;
        isEnabled: boolean;
    }) => {
        const response = await api.put(`flash-sales/${id}`, payload);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`flash-sales/${id}`);
        return response.data;
    },
};


// Categories API
export const categoriesAPI = {
    addCategory: async (categoryData: FormData) => {
        const response = await api.post('categories/create-category', categoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAll: async (params?: Record<string, any>) => {
      const response = await api.get('categories/get-all-categories', { params });
      return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await api.delete(`categories/delete-category/${id}`);
        return response.data;
    },

    updateCategory: async (id: string, categoryData: FormData) => {
        const response = await api.put(`categories/update-category/${id}`, categoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    activateCategory: async (id: string) => {
        const response = await api.put(`categories/activate-category/${id}`);
        return response.data;
    },

    deactivateCategory: async (id: string) => {
        const response = await api.put(`categories/deactivate-category/${id}`);
        return response.data;
    }
  };

// Subcategories API
export const subcategoriesAPI = {
    addSubcategory: async (subcategoryData: FormData) => {
        const response = await api.post('subcategories/create-subcategory', subcategoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getAll: async (params?: Record<string, any>) => {
        const response = await api.get('subcategories/get-all-subcategories', { params });
        return response.data;
    },
    deleteSubcategory: async (id: string) => {
        const response = await api.delete(`subcategories/delete-subcategory/${id}`);
        return response.data;
    },
};

//   orders API
export const ordersAPI = {
    getAllOrders: async () => {
        const response = await api.get('orders/get-all-orders');
        return response.data;
    },

    getOrderById: async (id: string) => {
        const response = await api.get(`orders/get-order-byId/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: string) => {
        const response = await api.put(`orders/update-order-status/${id}`, { status });
        return response.data;
    },
    
    updatePaymentStatus: async (id: string, paymentStatus: string) => {
        const response = await api.put(`orders/update-payment-status/${id}`, { paymentStatus });
        return response.data;
    },
    cancelOrder: async (id: string) => {
        const response = await api.post(`orders/${id}/cancel`);
        return response.data;
    },
}

// Shipping Pricing API
export const shippingAPI = {
    getSettings: async () => {
        const response = await api.get('shipping/settings');
        return response.data;
    },
    updateSettings: async (payload: { buffer_percentage: number; default_fee: number; minimum_fee: number; }) => {
        const response = await api.put('shipping/settings', payload);
        return response.data;
    },
    getRates: async () => {
        const response = await api.get('shipping/rates');
        return response.data;
    },
    upsertRate: async (payload: { state: string; base_fee: number; is_active?: boolean; }) => {
        const response = await api.post('shipping/rates', payload);
        return response.data;
    },
    deleteRate: async (id: string) => {
        const response = await api.delete(`shipping/rates/${id}`);
        return response.data;
    },
    preview: async (payload: { base_fee: number; }) => {
        const response = await api.post('shipping/preview', payload);
        return response.data;
    },
};


export function resolveImageUrl(path?: string | null): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = API_BASE_URL.replace(/\/+$/, '');
    const origin = base.replace(/\/api$/, '');
    return `${origin}/${String(path).replace(/^\/+/, '')}`;
}
