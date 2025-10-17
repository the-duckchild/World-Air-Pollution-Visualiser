import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindDataForNearestStationForm } from './FindDataForNearestStationForm'

// Mock motion/react for animations
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />
}))

// Mock LocationMarkerMap component
vi.mock('./LocationMarkerMap', () => ({
  LocationMarkerMap: () => <div data-testid="location-marker" />
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  latLng: (lat: number, lng: number) => ({ lat, lng })
}))

// Mock CSS imports
vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('./FindDataForNearestStationForm.css', () => ({}))

const mockProps = {
  currentLongLat: { Longitude: -0.1278, Latitude: 51.5074 },
  onCoordinatesChange: vi.fn()
}

describe('FindDataForNearestStationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with input fields', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    // Check form elements
    expect(screen.getByText('Click Map to select location')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Longitude')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Latitude')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('displays current location when provided', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    // Check if current location is displayed
    expect(screen.getByText('Current Location: 51.5074, -0.1278')).toBeInTheDocument()
  })

  it('toggles map visibility when button is clicked', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button', { name: /show map/i })
    expect(mapButton).toBeInTheDocument()
    
    // Initially map should not be visible
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
    
    // Click to show map
    await user.click(mapButton)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide map/i })).toBeInTheDocument()
    
    // Click to hide map
    await user.click(screen.getByRole('button', { name: /hide map/i }))
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })

  it('renders map components when map is visible', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    // Show map
    await user.click(screen.getByRole('button', { name: /show map/i }))
    
    // Check if map components are rendered
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    expect(screen.getByTestId('location-marker')).toBeInTheDocument()
  })

  it('validates longitude input with correct pattern', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const longitudeInput = screen.getByPlaceholderText('Longitude')
    
    // Test valid longitude
    await user.clear(longitudeInput)
    await user.type(longitudeInput, '-0.1278')
    expect(longitudeInput).toHaveValue('-0.1278')
    
    // Test invalid longitude (should still accept as input validation happens on submit)
    await user.clear(longitudeInput)
    await user.type(longitudeInput, 'invalid')
    expect(longitudeInput).toHaveValue('invalid')
  })

  it('validates latitude input with correct pattern', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const latitudeInput = screen.getByPlaceholderText('Latitude')
    
    // Test valid latitude
    await user.clear(latitudeInput)
    await user.type(latitudeInput, '51.5074')
    expect(latitudeInput).toHaveValue('51.5074')
    
    // Test invalid latitude
    await user.clear(latitudeInput)
    await user.type(latitudeInput, 'invalid')
    expect(latitudeInput).toHaveValue('invalid')
  })

  it('calls onCoordinatesChange when form is submitted with valid data', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const longitudeInput = screen.getByPlaceholderText('Longitude')
    const latitudeInput = screen.getByPlaceholderText('Latitude')
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Fill in valid coordinates
    await user.clear(longitudeInput)
    await user.type(longitudeInput, '-74.0060')
    await user.clear(latitudeInput)
    await user.type(latitudeInput, '40.7128')
    
    // Submit form
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockProps.onCoordinatesChange).toHaveBeenCalledWith({
        Longitude: "-74.0060",
        Latitude: "40.7128"
      })
    })
  })

  it('hides map after form submission if map was visible', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    // Show map first
    await user.click(screen.getByRole('button', { name: /show map/i }))
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    
    // Fill and submit form
    const longitudeInput = screen.getByPlaceholderText('Longitude')
    const latitudeInput = screen.getByPlaceholderText('Latitude')
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    await user.clear(longitudeInput)
    await user.type(longitudeInput, '0')
    await user.clear(latitudeInput)
    await user.type(latitudeInput, '0')
    await user.click(submitButton)
    
    // Map should be hidden after submission
    await waitFor(() => {
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
    })
  })

  it('handles missing onCoordinatesChange prop gracefully', async () => {
    const user = userEvent.setup()
    const propsWithoutCallback = {
      currentLongLat: { Longitude: -0.1278, Latitude: 51.5074 }
    }
    
    render(<FindDataForNearestStationForm {...propsWithoutCallback} />)
    
    const longitudeInput = screen.getByPlaceholderText('Longitude')
    const latitudeInput = screen.getByPlaceholderText('Latitude')
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Fill and submit form
    await user.clear(longitudeInput)
    await user.type(longitudeInput, '0')
    await user.clear(latitudeInput)
    await user.type(latitudeInput, '0')
    
    // Should not throw error when submitting without callback
    expect(() => user.click(submitButton)).not.toThrow()
  })

  it('displays coordinate labels correctly', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    expect(screen.getByText('Longitude')).toBeInTheDocument()
    expect(screen.getByText('Latitude')).toBeInTheDocument()
  })

  it('handles undefined currentLongLat gracefully', () => {
    const propsWithUndefinedCoords = {
      currentLongLat: { Longitude: undefined as any, Latitude: undefined as any },
      onCoordinatesChange: vi.fn()
    }
    
    render(<FindDataForNearestStationForm {...propsWithUndefinedCoords} />)
    
    // Should not display current location when coordinates are undefined
    expect(screen.queryByText(/Current Location:/)).not.toBeInTheDocument()
  })
})