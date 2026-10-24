import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseApiError, getApiBaseUrl, createApiClient } from './client'
import type { AxiosError, AxiosResponse } from 'axios'

describe('API Client & Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves the fallback base URL when VITE_API_BASE_URL is unset', () => {
    expect(getApiBaseUrl()).toBe('/api')
  })

  it('creates an axios instance with default config', () => {
    const client = createApiClient('/custom-api')
    expect(client.defaults.baseURL).toBe('/custom-api')
    expect(client.defaults.timeout).toBe(15_000)
    expect(client.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('parses structured backend error envelope correctly', () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Request failed with status code 422',
      response: {
        status: 422,
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters.',
            details: [
              {
                location: 'body.team_size',
                message: 'Field required',
                error_type: 'missing',
              },
            ],
          },
        },
      } as AxiosResponse,
    } as unknown as AxiosError

    const appError = parseApiError(mockAxiosError)
    expect(appError.message).toBe('Invalid request parameters.')
    expect(appError.code).toBe('VALIDATION_ERROR')
    expect(appError.status).toBe(422)
    expect(appError.details).toHaveLength(1)
    expect(appError.details?.[0].location).toBe('body.team_size')
  })

  it('parses FastAPI detail string error fallback', () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Request failed with status code 404',
      response: {
        status: 404,
        data: {
          detail: 'Item not found',
        },
      } as AxiosResponse,
    } as unknown as AxiosError

    const appError = parseApiError(mockAxiosError)
    expect(appError.message).toBe('Item not found')
    expect(appError.status).toBe(404)
  })

  it('handles standard Error instances', () => {
    const standardError = new Error('Network timeout')
    const appError = parseApiError(standardError)
    expect(appError.message).toBe('Network timeout')
  })

  it('handles unknown rejections', () => {
    const appError = parseApiError('Plain string error')
    expect(appError.message).toBe('Plain string error')
  })
})
