import axios from 'axios';

/* ------------------------------------------------
   Axios instance – sends JWT token on every request
   and proxies to the Flask backend.
   ------------------------------------------------ */

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

/* Attach token to every request */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/* Auto-logout on 401 */
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

/* API Methods */
api.getStocks = () => api.get('/stocks');
api.addStock = (data) => api.post('/stocks', data);
api.sellStock = (data) => api.post('/stocks/sell', data);
api.updateStock = (id, data) => api.put(`/stocks/${id}`, data);
api.deleteStock = (id) => api.delete(`/stocks/${id}`);

api.getMarketStocks = () => api.get('/market');
api.getMarketData = () => api.get('/market-data');
api.getStockPrice = (ticker) => api.get(`/price/${ticker}`);
api.getStockDetails = (symbol) => api.get(`/stock/${symbol}`);
api.getStockHistory = (symbol, period = '1mo') => api.get(`/stock-history/${symbol}?period=${period}`);

api.login = (data) => api.post('/login', data);
api.register = (data) => api.post('/register', data);
api.verifyOtp = (data) => api.post('/verify-otp', data);
api.resendOtp = (data) => api.post('/resend-otp', data);

// Opportunities
api.getOpportunities = () => api.get('/opportunities');
api.markOpportunityRead = (id) => api.put(`/opportunities/${id}/read`);
api.getOpportunitiesCount = () => api.get('/opportunities/latest');
api.scanOpportunities = () => api.post('/opportunities/scan');

export default api;
