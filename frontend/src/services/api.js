import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token às requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- AUTENTICAÇÃO ----------
export const authAPI = {
  login: (email, password) => api.post("/user/login", { email, password }),
  register: (userData) => api.post("/user/registrar", userData),
  getProfile: () => api.get("/user/me"),
  update: (email, novaSenha) => api.put("/user/alterar-senha", { email, novaSenha }),
  delete: (user, password) => api.delete("/user/excluir", { 
    data: { user, password } 
  }),
};

// ---------- TRANSAÇÕES ----------
export const transactionsAPI = {
  getAll: () => api.get("/transactions"),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post("/transactions", transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get("/transactions/summary"), // útil pra dashboard
};

// ---------- CATEGORIAS ----------
export const categoriesAPI = {
  getAll: () => api.get("/categories/tabela"),
};

export default api;