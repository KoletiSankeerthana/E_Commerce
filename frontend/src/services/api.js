import axios from 'axios';

const api = axios.create({
    baseURL: "https://ecommerce-vwsy.onrender.com/api"
});

export const IMAGE_BASE_URL = "https://ecommerce-vwsy.onrender.com";

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
