import axios from 'axios';

// Always use relative /api path — Vite proxy forwards to localhost:5000
// This works on localhost AND on mobile via Cloudflare tunnel (port 5173)
const api = axios.create({
    baseURL: '/api',
});

export const IMAGE_BASE_URL = "http://localhost:5173";

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${IMAGE_BASE_URL}${imagePath}`;
};

api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
