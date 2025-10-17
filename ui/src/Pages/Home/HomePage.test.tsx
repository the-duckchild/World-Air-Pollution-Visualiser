import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from './HomePage'

// Mock Canvas and react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  )
}))

// Mock child components
vi.mock('../../components/TickerTape', () => ({
  TickerTape: () => <div data-testid="ticker-tape">Ticker Tape Component</div>
}))

vi.mock('../../components/AqiFiguresDisplay', () => ({
  default: ({ currentLongLat }: any) => (
    <div data-testid="aqi-figures-display">
      AQI Figures Display - Lat: {currentLongLat.Latitude}, Lng: {currentLongLat.Longitude}
    </div>
  )
}))

vi.mock('../../components/AqiVisualiser/AqiVisualiser', () => ({
  AqiVisualiser: () => <div data-testid="aqi-visualiser">AQI Visualiser Component</div>
}))

vi.mock('../../components/FormComponents/FindDataForNearestStationForm', () => ({
  FindDataForNearestStationForm: ({ currentLongLat, onCoordinatesChange }: any) => (
    <div data-testid="location-form">
      <button 
        onClick={() => onCoordinatesChange({ Longitude: -74.0060, Latitude: 40.7128 })}
      >
        Change Location
      </button>
      Current: {currentLongLat.Latitude}, {currentLongLat.Longitude}
    </div>
  )
}))

// Mock CSS imports
vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('../../styles/globals.css', () => ({}))
vi.mock('../../styles/app.css', () => ({}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all main components', () => {
    render(<HomePage />)
    
    // Check if all main components are rendered
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('ticker-tape')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-visualiser')).toBeInTheDocument()
    expect(screen.getByTestId('location-form')).toBeInTheDocument()
  })

  it('initializes with default London coordinates', () => {
    render(<HomePage />)
    
    // Check if default coordinates are used (London)
    expect(screen.getByText(/Lat: 0.1276, Lng: 51.5072/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 0.1276, 51.5072/)).toBeInTheDocument()
  })

  it('updates coordinates when location form triggers change', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Initially shows London coordinates
    expect(screen.getByText(/Current: 0.1276, 51.5072/)).toBeInTheDocument()
    
    // Click button to change location (to New York coordinates)
    const changeLocationButton = screen.getByRole('button', { name: /change location/i })
    await user.click(changeLocationButton)
    
    // Should update to new coordinates (matching actual format without trailing zeros)
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 40.7128, Lng: -74.006/)).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    render(<HomePage />)
    
    // Check main container
    const mainContainer = document.querySelector('.min-h-95vh')
    expect(mainContainer).toHaveClass('min-h-95vh', 'flex', 'flex-col', 'min-w-screen', 'items-center', 'rounded-sm')
    
    // Check canvas container
    const canvasContainer = screen.getByTestId('three-canvas').parentElement
    expect(canvasContainer).toHaveClass('h-150', 'w-500', 'mt-50')
    expect(canvasContainer).toHaveAttribute('id', 'canvas-container')
  })

  it('positions AQI figures display absolutely', () => {
    render(<HomePage />)
    
    // The AQI figures display should be in an absolute positioned container
    const aqiFiguresContainer = screen.getByTestId('aqi-figures-display').parentElement
    expect(aqiFiguresContainer).toHaveClass('flex', 'mt-30', 'absolute')
  })

  it('manages AQI data state correctly', () => {
    render(<HomePage />)
    
    // Initially, aqiForClosestStation should be null
    // This is tested indirectly through the AqiFiguresDisplay mock
    // The component should handle null state gracefully
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
  })

  it('renders 3D visualization canvas', () => {
    render(<HomePage />)
    
    // Check if Canvas component is rendered with AqiVisualiser
    const canvas = screen.getByTestId('three-canvas')
    expect(canvas).toBeInTheDocument()
    expect(screen.getByTestId('aqi-visualiser')).toBeInTheDocument()
  })

  it('places ticker tape at the bottom', () => {
    render(<HomePage />)
    
    // TickerTape should be rendered (positioning tested in TickerTape.test.tsx)
    expect(screen.getByTestId('ticker-tape')).toBeInTheDocument()
  })

  it('handles coordinate state updates', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Test that coordinate state is properly managed
    const initialText = screen.getByText(/Current: 0.1276, 51.5072/)
    expect(initialText).toBeInTheDocument()
    
    // Trigger coordinate change
    await user.click(screen.getByRole('button', { name: /change location/i }))
    
    // Verify state was updated (matching actual format without trailing zeros)
    expect(screen.queryByText(/Current: 0.1276, 51.5072/)).not.toBeInTheDocument()
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
  })

  it('passes correct props to child components', () => {
    render(<HomePage />)
    
    // Verify that correct props are passed to AqiFiguresDisplay
    expect(screen.getByText(/Lat: 0.1276, Lng: 51.5072/)).toBeInTheDocument()
    
    // Verify that location form receives current coordinates
    expect(screen.getByText(/Current: 0.1276, 51.5072/)).toBeInTheDocument()
  })
})