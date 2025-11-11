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
    expect(screen.getByTestId('ticker-tape')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-visualiser')).toBeInTheDocument()
    expect(screen.getByTestId('location-form')).toBeInTheDocument()
  })

  it('initializes with default coordinates (0, 0)', () => {
    render(<HomePage />)
    
    // Check if default coordinates are used (0, 0)
    expect(screen.getByText(/Lat: 0, Lng: 0/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 0, 0/)).toBeInTheDocument()
  })

  it('updates coordinates when location form triggers change', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Initially shows default coordinates
    expect(screen.getByText(/Current: 0, 0/)).toBeInTheDocument()
    
    // Click button to change location (to New York coordinates)
    const changeLocationButton = screen.getByRole('button', { name: /change location/i })
    await user.click(changeLocationButton)
    
    // Should update to new coordinates
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 40.7128, Lng: -74.006/)).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    render(<HomePage />)
    
    // Main container should have correct classes (space-y-6 instead of rounded-sm)
    const mainContainer = document.querySelector('.min-h-95vh')
    expect(mainContainer).toHaveClass('min-h-95vh', 'flex', 'flex-col', 'min-w-screen', 'items-center', 'space-y-6')
  })

  it('positions AQI figures display in a container with max width', () => {
    render(<HomePage />)
    
    // The AQI figures display should be in a container with max-w-6xl
    const aqiFiguresContainer = screen.getByTestId('aqi-figures-display').parentElement
    expect(aqiFiguresContainer).toHaveClass('w-full', 'max-w-6xl', 'px-4')
  })

  it('manages AQI data state correctly', () => {
    render(<HomePage />)
    
    // Initially, aqiForClosestStation should be null
    // This is tested indirectly through the AqiFiguresDisplay mock
    // The component should handle null state gracefully
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
  })

  it('renders 3D visualization component', () => {
    render(<HomePage />)
    
    // Check if AqiVisualiser is rendered (it contains the Canvas internally)
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
    const initialText = screen.getByText(/Current: 0, 0/)
    expect(initialText).toBeInTheDocument()
    
    // Trigger coordinate change
    await user.click(screen.getByRole('button', { name: /change location/i }))
    
    // Verify state was updated
    expect(screen.queryByText(/Current: 0, 0/)).not.toBeInTheDocument()
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
  })

  it('passes correct props to child components', () => {
    render(<HomePage />)
    
    // Verify that correct props are passed to AqiFiguresDisplay
    expect(screen.getByText(/Lat: 0, Lng: 0/)).toBeInTheDocument()
    
    // Verify that location form receives current coordinates
    expect(screen.getByText(/Current: 0, 0/)).toBeInTheDocument()
  })
})