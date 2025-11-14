import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TickerTape } from './TickerTape'
import * as ApiClient from '../Api/ApiClient'
import type { AirQualityDataSetDto } from '../Api/ApiClient'

// Mock the API client
vi.mock('../Api/ApiClient', () => ({
  getAqiFiguresByUIDs: vi.fn(),
}))

const createMockData = (aqi: number, name: string, geo: [number, number], dominentpol: string): AirQualityDataSetDto => ({
  status: 'ok',
  data: {
    aqi,
    idx: Math.floor(Math.random() * 10000),
    attributions: null,
    city: { geo, name, url: 'https://example.com', location: name },
    dominentpol,
    iaqi: { 
      pm25: { v: aqi }, 
      pm10: { v: aqi - 10 }, 
      no2: { v: Math.floor(aqi * 0.5) }, 
      co: { v: Math.floor(aqi * 0.1) },
      co2: null,
      so2: null
    },
    time: { saveChanges: null, iso: '2024-01-01T12:00:00Z', tz: '+00:00', v: 1704110400 },
  }
})

const mockTickerDataRecord: Record<string, AirQualityDataSetDto> = {
  '3307': createMockData(65, 'New York', [40.7128, -74.0060], 'pm25'),
  '5724': createMockData(42, 'London', [51.5074, -0.1278], 'pm25'),
  '2302': createMockData(28, 'Tokyo', [35.6762, 139.6503], 'pm25'),
  '1451': createMockData(115, 'Beijing', [39.9042, 116.4074], 'pm25'),
  '5722': createMockData(38, 'Paris', [48.8566, 2.3522], 'no2'),
  '12417': createMockData(22, 'Sydney', [-33.8688, 151.2093], 'o3'),
  '404': createMockData(98, 'Mexico City', [19.4326, -99.1332], 'pm25'),
  '359': createMockData(75, 'São Paulo', [-23.5505, -46.6333], 'pm25'),
  '12829': createMockData(45, 'Cape Town', [-33.9249, 18.4241], 'pm10'),
  '12454': createMockData(142, 'Mumbai', [19.0760, 72.8777], 'pm25'),
  'A399061': createMockData(55, 'Los Angeles', [34.0522, -118.2437], 'pm25'),
  'A546313': createMockData(88, 'Lagos', [6.5244, 3.3792], 'pm25'),
  '10486': createMockData(167, 'Moscow', [55.7558, 37.6173], 'pm25'),
}

describe('TickerTape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the API to return our test data
    vi.mocked(ApiClient.getAqiFiguresByUIDs).mockResolvedValue(mockTickerDataRecord)
  })
  it('renders the ticker tape component', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Check if the ticker tape container exists
    const tickerContainer = document.querySelector('.w-full.bg-muted.border-t')
    expect(tickerContainer).toBeInTheDocument()
  })

  it('displays city data with AQI values', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Check for specific cities from mock data (data is duplicated so use getAllByText)
    expect(screen.getAllByText('New York, USA')).toHaveLength(2)
    expect(screen.getAllByText('London, UK')).toHaveLength(2)
    expect(screen.getAllByText('Tokyo, Japan')).toHaveLength(2)
    expect(screen.getAllByText('Mumbai, India')).toHaveLength(2)
  })

  it('displays AQI values with correct format', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Check for AQI value format (data is duplicated, so we get 2 instances)
    // Mumbai has AQI 142, so it appears twice in the duplicated data
    expect(screen.getAllByText('AQI 65')).toHaveLength(2)
    expect(screen.getAllByText('AQI 42')).toHaveLength(2)
    expect(screen.getAllByText('AQI 142')).toHaveLength(2)
  })

  it('displays pollutant types', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Check for pollutant types (multiple instances due to duplication)
    expect(screen.getAllByText('PM2.5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('NO2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('O3').length).toBeGreaterThan(0)
  })

  it('applies correct CSS classes for different AQI levels', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Test good AQI (≤50) - should have green color (get first instance)
    const goodAqiElements = screen.getAllByText('AQI 28')
    expect(goodAqiElements[0]).toHaveClass('text-green-600')
    expect(goodAqiElements[0]).toHaveClass('bg-green-100')
    
    // Test moderate AQI (51-100) - should have yellow color
    const moderateAqiElements = screen.getAllByText('AQI 65')
    expect(moderateAqiElements[0]).toHaveClass('text-yellow-600')
    expect(moderateAqiElements[0]).toHaveClass('bg-yellow-100')
    
    // Test unhealthy AQI (151-200) - should have red color
    const unhealthyAqiElements = screen.getAllByText('AQI 167')
    expect(unhealthyAqiElements[0]).toHaveClass('text-red-600')
    expect(unhealthyAqiElements[0]).toHaveClass('bg-red-100')
  })

  it('duplicates data for continuous scrolling effect', async () => {
    render(<TickerTape />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading air quality data...')).not.toBeInTheDocument()
    })
    
    // Since data is duplicated, each city should appear twice
    const newYorkElements = screen.getAllByText('New York, USA')
    expect(newYorkElements).toHaveLength(2)
    
    const londonElements = screen.getAllByText('London, UK')
    expect(londonElements).toHaveLength(2)
  })

  it('has proper layout structure', () => {
    render(<TickerTape />)
    
    // Check if the main container has correct classes
    const mainContainer = document.querySelector('.w-full.bg-muted.border-t')
    expect(mainContainer).toHaveClass('w-full', 'bg-muted', 'border-t', 'overflow-hidden', 'fixed', 'bottom-0')
  })
})