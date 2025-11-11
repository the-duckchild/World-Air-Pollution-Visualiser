import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AqiFiguresDisplay from './AqiFiguresDisplay'
import type { AirQualityDataSetDto } from '../Api/ApiClient'
import * as ApiClient from '../Api/ApiClient'
import userEvent from '@testing-library/user-event'

// Mock the API client
vi.mock('../Api/ApiClient', () => ({
  getAqiFiguresByLatLon: vi.fn(),
}))

// Mock CSS import
vi.mock('./AqiFiguresDisplay.css', () => ({}))

// Mock timeUtils
vi.mock('../utils/timeUtils', () => ({
  getCurrentTimeForLocation: vi.fn().mockResolvedValue('10:00 AM')
}))

// Mock UI components
vi.mock('./ui components/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>
}))

vi.mock('./ui components/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, id }: any) => (
    <button
      data-testid={`switch-${id}`}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      aria-checked={checked}
    >
      {checked ? 'ON' : 'OFF'}
    </button>
  )
}))

vi.mock('./ui components/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>
}))

// Mock ParticleConfigs
vi.mock('./AqiVisualiser/ParticleConfigs', () => ({
  PARTICLE_CONFIGS: [
    { key: 'aqi', label: 'AQI', shortLabel: 'AQI', color: '#3b82f6' },
    { key: 'pm25', label: 'PM2.5', shortLabel: 'PM2.5', color: '#ef4444' },
    { key: 'pm10', label: 'PM10', shortLabel: 'PM10', color: '#f59e0b' },
  ]
}))

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
  onAqiChange: vi.fn(),
  enabledSystems: {
    aqi: true,
    pm25: true,
    pm10: false
  },
  onToggleSystem: vi.fn()
}

describe('AqiFiguresDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with title', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    expect(screen.getByText('AQI Data')).toBeInTheDocument()
  })

  it('displays location name when available', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // Location name may appear multiple times (in different sections of the component)
    const locationElements = screen.getAllByText(/London/)
    expect(locationElements.length).toBeGreaterThan(0)
  })

  it('displays "No location selected" when coordinates are 0,0', () => {
    const propsWithZeroCoords = {
      ...mockProps,
      currentLongLat: { Longitude: 0, Latitude: 0 }
    }
    
    render(<AqiFiguresDisplay {...propsWithZeroCoords} />)
    
    expect(screen.getByText(/No location selected/i)).toBeInTheDocument()
    expect(screen.getByText(/Choose location with the map/i)).toBeInTheDocument()
  })

  it('renders particle system labels', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // Labels appear multiple times due to responsive design (desktop and mobile versions)
    expect(screen.getAllByText('AQI').length).toBeGreaterThan(0)
    expect(screen.getAllByText('PM2.5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('PM10').length).toBeGreaterThan(0)
  })

  it('displays AQI value correctly', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    expect(screen.getByText('65')).toBeInTheDocument()
  })

  it('displays PM values correctly', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    expect(screen.getByText('15')).toBeInTheDocument() // PM2.5
    expect(screen.getByText('35')).toBeInTheDocument() // PM10
  })

  it('renders switches for each particle system', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    expect(screen.getByTestId('switch-aqi')).toBeInTheDocument()
    expect(screen.getByTestId('switch-pm25')).toBeInTheDocument()
    expect(screen.getByTestId('switch-pm10')).toBeInTheDocument()
  })

  it('calls onToggleSystem when switch is clicked', async () => {
    const user = userEvent.setup()
    render(<AqiFiguresDisplay {...mockProps} />)
    
    const aqiSwitch = screen.getByTestId('switch-aqi')
    await user.click(aqiSwitch)
    
    expect(mockProps.onToggleSystem).toHaveBeenCalledWith('aqi')
  })

  it('displays traffic light indicator with quality level', () => {
    render(<AqiFiguresDisplay {...mockProps} />)
    
    // AQI of 65 should show "Moderate"
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  it('shows "Good" for AQI values <= 50', () => {
    const propsWithLowAqi = {
      ...mockProps,
      aqiForClosestStation: {
        ...mockAqiData,
        data: {
          ...mockAqiData.data!,
          aqi: 45,
          iaqi: {
            co: { v: 0.3 },
            co2: { v: 400 },
            no2: { v: 25 },
            pm10: { v: 25 },
            pm25: { v: 20 },
            so2: { v: 5 }
          }
        }
      }
    }
    
    render(<AqiFiguresDisplay {...propsWithLowAqi} />)
    
    // "Good" appears multiple times (for AQI, PM2.5, PM10 if they're all <= 50)
    const goodLabels = screen.getAllByText('Good')
    expect(goodLabels.length).toBeGreaterThan(0)
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

  it('does not call API when coordinates are 0,0', () => {
    const mockGetAqiFigures = vi.mocked(ApiClient.getAqiFiguresByLatLon)
    const propsWithZeroCoords = {
      ...mockProps,
      currentLongLat: { Longitude: 0, Latitude: 0 }
    }
    
    render(<AqiFiguresDisplay {...propsWithZeroCoords} />)
    
    expect(mockGetAqiFigures).not.toHaveBeenCalled()
  })

  it('handles null AQI data gracefully', () => {
    const propsWithNullData = {
      ...mockProps,
      aqiForClosestStation: null
    }
    
    render(<AqiFiguresDisplay {...propsWithNullData} />)
    
    // Should show "Loading..." for location (appears multiple times in the component)
    const loadingElements = screen.getAllByText(/Loading.../)
    expect(loadingElements.length).toBeGreaterThan(0)
  })
})