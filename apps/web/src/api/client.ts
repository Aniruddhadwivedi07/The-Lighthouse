import axios from 'axios'

/**
 * Shared Axios instance. During development the Vite proxy rewrites /api/* to
 * the FastAPI backend. In production the baseURL should point to the deployed
 * API host via an environment variable.
 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercept responses and normalise error messages.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error.response?.data?.detail ??
      error.message ??
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  },
)
