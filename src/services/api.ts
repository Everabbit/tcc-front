import axios, { AxiosInstance } from 'axios';

const AUTH_TOKEN_KEY = 'auth_token';

const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.0.111:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setHttpToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
}

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (storedToken) {
  setHttpToken(storedToken);
}

export default api;
