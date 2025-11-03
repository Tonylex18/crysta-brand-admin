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

// Auth API
export const authAPI = {
    signUp: async (name: string, email: string, password: string) => {
        const response = await api.post('admin/sign-up', { name, email, password });
        const data = response.data;
        return {
            admin: data.user,
            token: data.accessToken,
        };
    },

    signIn: async (email: string, password: string) => {
        const response = await api.post('admin/login', { email, password });
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
        const response = await api.post('auth/signout');
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
        const response = await api.post('admin/verify-user-mail', { email, otp });
        return response.data;
    },
    resendOtp: async (email: string) => {
        const response = await api.post('admin/request-new-otp', { email });
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