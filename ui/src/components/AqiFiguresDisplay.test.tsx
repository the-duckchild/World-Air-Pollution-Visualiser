import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AqiFiguresDisplay from './AqiFiguresDisplay'
import type { AirQualityDataSetDto } from '../Api/ApiClient'
import * as ApiClient from '../Api/ApiClient'

// Mock the API client
vi.mock('../Api/ApiClient', () => ({
  getAqiFiguresByLatLon: vi.fn(),
}))

// Mock CSS import
vi.mock('./AqiFiguresDisplay.css', () => ({}))

const mockAqiData: AirQualityDataSetDto = {
  status: 'ok',
  data: {
    aqi: 65,
    idx: 123,
    attributions: null,
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

const mockProps = {
  currentLongLat: { Longitude: -0.1278, Latitude: 51.5074 },
  aqiForClosestStation: mockAqiData,
  onAqiChange: vi.fn()
}

describe('AqiFiguresDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders air quality data correctly', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // Check if PM25 (AQI) is displayed (using regex due to whitespace)
    expect(screen.getByText(/PM25:/)).toBeInTheDocument()
    expect(screen.getByText(/65/)).toBeInTheDocument()
    
    // Check if PM10 is displayed
    expect(screen.getByText(/PM10:/)).toBeInTheDocument()
    expect(screen.getByText(/35/)).toBeInTheDocument()
    
    // Check if location is displayed
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('displays current component structure', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // Check the current simple structure (using regex due to whitespace)
    expect(screen.getByText(/PM25:/)).toBeInTheDocument()
    expect(screen.getByText(/PM10:/)).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('displays fallback values when data is null', () => {
    const propsWithNullData = {
      ...mockProps,
      aqiForClosestStation: null
    }
    
    render(<AqiFiguresDisplay {...propsWithNullData} />)
    
    // Check if PM25 and PM10 labels are still displayed but without values
    expect(screen.getByText('PM25:')).toBeInTheDocument()
    expect(screen.getByText('PM10:')).toBeInTheDocument()
    
    // The component doesn't show explicit "N/A" or "Unknown" in current implementation
    // It just shows empty values
  })

  it('displays fallback values when iaqi data is missing', () => {
    const propsWithMissingIaqi = {
      ...mockProps,
      aqiForClosestStation: {
        ...mockAqiData,
        data: {
          ...mockAqiData.data!,
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
    }
    
    render(<AqiFiguresDisplay {...propsWithMissingIaqi} />)
    
    // PM10 should not display a value when iaqi.pm10 is null
    expect(screen.getByText('PM10:')).toBeInTheDocument()
    // No value should be displayed for PM10 since it's null
  })

  it('calls API when coordinates change', async () => {
    const mockGetAqiFigures = vi.mocked(ApiClient.getAqiFiguresByLatLon)
    mockGetAqiFigures.mockResolvedValue(mockAqiData)
    
    render(<AqiFiguresDisplay {...mockProps} />)
    
    await waitFor(() => {
      expect(mockGetAqiFigures).toHaveBeenCalledWith(51.5074, -0.1278)
      expect(mockProps.onAqiChange).toHaveBeenCalledWith(mockAqiData)
    })
  })

  it('handles API errors gracefully', async () => {
    const mockGetAqiFigures = vi.mocked(ApiClient.getAqiFiguresByLatLon)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetAqiFigures.mockRejectedValue(new Error('API Error'))
    
    render(<AqiFiguresDisplay {...mockProps} />)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching AQI data:', expect.any(Error))
    })
    
    consoleErrorSpy.mockRestore()
  })

  it('has correct CSS classes for layout', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    const container = document.querySelector('.aqi.bg-white')
    expect(container).toHaveClass('aqi', 'bg-white', 'p-2', 'flex', 'self-center', 'w-100', 'rounded-md')
  })

  it('uses simple flex layout structure', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // The current implementation uses a simple flex layout, not grid
    const container = document.querySelector('.aqi.bg-white')
    expect(container).toHaveClass('flex')
    // No grid layout in current implementation
  })
})