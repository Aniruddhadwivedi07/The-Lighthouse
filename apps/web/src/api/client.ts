import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiErrorResponse, AppError } from '@/types/api'

/**
 * Resolves the API base URL from Vite environment variables (VITE_API_BASE_URL),
 * falling back to the Vite local dev proxy prefix '/api'.
 */
export function getApiBaseUrl(): string {
  // Check import.meta.env safely
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
    : undefined

  return envUrl?.trim() || '/api'
}

/**
 * Extracts and normalises an error from an Axios failure or unknown rejection into an AppError.
 * Respects the backend structured error envelope: { error: { code, message, details } }.
 */
export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse | { detail?: string }>
    const responseData = axiosError.response?.data
    const status = axiosError.response?.status

    // Check for structured backend error envelope: { error: { code, message, details } }
    if (responseData && typeof responseData === 'object' && 'error' in responseData && responseData.error) {
      return {
        message: responseData.error.message || 'An API error occurred.',
        code: responseData.error.code,
        status,
        details: responseData.error.details ?? undefined,
        raw: error,
      }
    }

    // Check for standard FastAPI detail string: { detail: "..." }
    if (responseData && typeof responseData === 'object' && 'detail' in responseData && typeof responseData.detail === 'string') {
      return {
        message: responseData.detail,
        status,
        raw: error,
      }
    }

    // Generic Axios HTTP error
    return {
      message: axiosError.message || `Request failed with status ${status || 'unknown'}.`,
      status,
      code: axiosError.code,
      raw: error,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      raw: error,
    }
  }

  return {
    message: typeof error === 'string' ? error : 'An unexpected error occurred.',
    raw: error,
  }
}

/**
 * Factory for creating typed API client instances.
 */
export function createApiClient(baseUrl = getApiBaseUrl()): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  return instance
}

/**
 * Shared singleton instance of the typed API client.
 */
export const api = createApiClient()

/**
 * Typed wrapper methods providing direct error unwrapping and consistent promises.
 */
export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(url, config)
      return response.data
    } catch (err) {
      throw parseApiError(err)
    }
  },

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(url, data, config)
      return response.data
    } catch (err) {
      throw parseApiError(err)
    }
  },

  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(url, data, config)
      return response.data
    } catch (err) {
      throw parseApiError(err)
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(url, config)
      return response.data
    } catch (err) {
      throw parseApiError(err)
    }
  },
}
