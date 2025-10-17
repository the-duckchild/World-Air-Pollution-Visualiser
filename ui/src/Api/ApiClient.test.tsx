import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAqiFiguresByLatLon } from './ApiClient'
import type { AirQualityDataSetDto } from './ApiClient'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockAqiResponse: AirQualityDataSetDto = {
  status: 'ok',
  data: {
    aqi: 65,
    idx: 123,
    attributions: [
      {
        url: 'https://example.com',
        name: 'Test Station',
        station: 'Test Station Name'
      }
    ],
    city: {
      geo: [51.5074, -0.1278],
      name: 'London',
      url: 'https://london.example.com',
      location: 'London, UK'
    },
    dominentpol: 'pm25',
    iaqi: {
      co: { v: 0.3 },
      co2: { v: 400 },
      no2: { v: 25 },
      pm10: { v: 35 },
      pm25: { v: 15 },
      so2: { v: 5 }
    },
    time: {
      saveChanges: null,
      tz: '+00:00',
      v: 1634567890,
      iso: '2021-10-18T10:00:00Z'
    }
  }
}

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAqiFiguresByLatLon', () => {
    it('makes correct API call with lat/lon parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      const result = await getAqiFiguresByLatLon(51.5074, -0.1278)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5090/air-quality-data-by-latlon/51.5074/-0.1278'
      )
      expect(result).toEqual(mockAqiResponse)
    })

    it('handles positive coordinates correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      await getAqiFiguresByLatLon(40.7128, 74.0060)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5090/air-quality-data-by-latlon/40.7128/74.006'
      )
    })

    it('handles negative coordinates correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      await getAqiFiguresByLatLon(-33.8688, -151.2093)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5090/air-quality-data-by-latlon/-33.8688/-151.2093'
      )
    })

    it('handles zero coordinates correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      await getAqiFiguresByLatLon(0, 0)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5090/air-quality-data-by-latlon/0/0'
      )
    })

    it('returns parsed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      const result = await getAqiFiguresByLatLon(51.5074, -0.1278)

      expect(result).toEqual(mockAqiResponse)
      expect(result.status).toBe('ok')
      expect(result.data?.aqi).toBe(65)
      expect(result.data?.city?.name).toBe('London')
    })

    it('handles API error responses', async () => {
      const errorResponse = {
        status: 'error',
        data: null
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => errorResponse
      })

      const result = await getAqiFiguresByLatLon(51.5074, -0.1278)

      expect(result).toEqual(errorResponse)
      expect(result.status).toBe('error')
      expect(result.data).toBe(null)
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(getAqiFiguresByLatLon(51.5074, -0.1278))
        .rejects
        .toThrow('Network error')
    })

    it('handles fetch response errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON parse error') }
      })

      await expect(getAqiFiguresByLatLon(51.5074, -0.1278))
        .rejects
        .toThrow('JSON parse error')
    })

    it('handles decimal precision in coordinates', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      await getAqiFiguresByLatLon(51.50741234, -0.12785678)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5090/air-quality-data-by-latlon/51.50741234/-0.12785678'
      )
    })

    it('validates response structure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockAqiResponse
      })

      const result = await getAqiFiguresByLatLon(51.5074, -0.1278)

      // Validate top-level structure
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('data')

      // Validate data structure
      expect(result.data).toHaveProperty('aqi')
      expect(result.data).toHaveProperty('iaqi')
      expect(result.data).toHaveProperty('city')
      expect(result.data).toHaveProperty('time')

      // Validate IAQI structure
      expect(result.data?.iaqi).toHaveProperty('co')
      expect(result.data?.iaqi).toHaveProperty('co2')
      expect(result.data?.iaqi).toHaveProperty('no2')
      expect(result.data?.iaqi).toHaveProperty('pm10')
      expect(result.data?.iaqi).toHaveProperty('pm25')
      expect(result.data?.iaqi).toHaveProperty('so2')

      // Validate pollutant value structure
      expect(result.data?.iaqi?.co).toHaveProperty('v')
      expect(typeof result.data?.iaqi?.co?.v).toBe('number')
    })

    it('handles missing IAQI data gracefully', async () => {
      const responseWithoutIaqi = {
        ...mockAqiResponse,
        data: {
          ...mockAqiResponse.data!,
          iaqi: {
            co: null,
            co2: null,
            no2: null,
            pm10: null,
            pm25: null,
            so2: null
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => responseWithoutIaqi
      })

      const result = await getAqiFiguresByLatLon(51.5074, -0.1278)

      expect(result.data?.iaqi?.co).toBeNull()
      expect(result.data?.iaqi?.pm25).toBeNull()
    })
  })
})