import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from './HomePage'

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

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

  it('shows location permission dialog on mount when geolocation is available', () => {
    render(<HomePage />)
    
    // Should show the location dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Choose Your Location/i)).toBeInTheDocument()
    expect(screen.getByText(/Can we use your current location/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Use my location/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /No, use default/i })).toBeInTheDocument()
  })

  it('uses London coordinates when user declines location access', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Click "No, use default" button
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Should show London coordinates (51.5074, -0.1278)
    expect(screen.getByText(/Current: 51.5074, -0.1278/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 51.5074, Lng: -0.1278/)).toBeInTheDocument()
  })

  it('requests location when user allows access', async () => {
    const user = userEvent.setup()
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    }
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition as GeolocationPosition)
    })
    
    render(<HomePage />)
    
    // Click "Use my location" button
    const allowButton = screen.getByRole('button', { name: /Use my location/i })
    await user.click(allowButton)
    
    // Should show user's actual coordinates
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 40.7128, Lng: -74.006/)).toBeInTheDocument()
  })

  it('renders all main components after dismissing dialog', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Check if all main components are rendered
    expect(screen.getByTestId('ticker-tape')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
    expect(screen.getByTestId('aqi-visualiser')).toBeInTheDocument()
    expect(screen.getByTestId('location-form')).toBeInTheDocument()
  })

  it('initializes with London coordinates when user declines', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Check if London coordinates are used (51.5074, -0.1278)
    expect(screen.getByText(/Lat: 51.5074, Lng: -0.1278/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 51.5074, -0.1278/)).toBeInTheDocument()
  })

  it('updates coordinates when location form triggers change', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Initially shows London coordinates
    expect(screen.getByText(/Current: 51.5074, -0.1278/)).toBeInTheDocument()
    
    // Click button to change location (to New York coordinates)
    const changeLocationButton = screen.getByRole('button', { name: /change location/i })
    await user.click(changeLocationButton)
    
    // Should update to new coordinates
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 40.7128, Lng: -74.006/)).toBeInTheDocument()
  })

  it('has correct layout structure', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Main container should have correct classes - updated to match current implementation
    const mainContainer = document.querySelector('.flex-1')
    expect(mainContainer).toHaveClass('flex-1', 'flex', 'flex-col', 'min-w-screen', 'items-center', 'space-y-6')
  })

  it('positions AQI figures display in a container with max width', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // The AQI figures display should be in a container with max-w-6xl
    const aqiFiguresContainer = screen.getByTestId('aqi-figures-display').parentElement
    expect(aqiFiguresContainer).toHaveClass('w-full', 'max-w-6xl', 'px-4')
  })

  it('manages AQI data state correctly', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Initially, aqiForClosestStation should be null
    // This is tested indirectly through the AqiFiguresDisplay mock
    // The component should handle null state gracefully
    expect(screen.getByTestId('aqi-figures-display')).toBeInTheDocument()
  })

  it('renders 3D visualization component', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Check if AqiVisualiser is rendered (it contains the Canvas internally)
    expect(screen.getByTestId('aqi-visualiser')).toBeInTheDocument()
  })

  it('places ticker tape at the bottom', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // TickerTape should be rendered (positioning tested in TickerTape.test.tsx)
    expect(screen.getByTestId('ticker-tape')).toBeInTheDocument()
  })

  it('handles coordinate state updates', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Test that coordinate state is properly managed
    const initialText = screen.getByText(/Current: 51.5074, -0.1278/)
    expect(initialText).toBeInTheDocument()
    
    // Trigger coordinate change
    await user.click(screen.getByRole('button', { name: /change location/i }))
    
    // Verify state was updated
    expect(screen.queryByText(/Current: 51.5074, -0.1278/)).not.toBeInTheDocument()
    expect(screen.getByText(/Current: 40.7128, -74.006/)).toBeInTheDocument()
  })

  it('passes correct props to child components', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    // Dismiss the dialog first
    const declineButton = screen.getByRole('button', { name: /No, use default/i })
    await user.click(declineButton)
    
    // Verify that correct props are passed to AqiFiguresDisplay (London coordinates)
    expect(screen.getByText(/Lat: 51.5074, Lng: -0.1278/)).toBeInTheDocument()
    
    // Verify that location form receives current coordinates
    expect(screen.getByText(/Current: 51.5074, -0.1278/)).toBeInTheDocument()
  })

  it('uses London coordinates when geolocation is not supported', () => {
    // Temporarily remove geolocation support
    const originalGeolocation = global.navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    })

    render(<HomePage />)
    
    // Should not show dialog when geolocation is not supported
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    
    // Should use London coordinates
    expect(screen.getByText(/Current: 51.5074, -0.1278/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 51.5074, Lng: -0.1278/)).toBeInTheDocument()

    // Restore geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
    })
  })
})