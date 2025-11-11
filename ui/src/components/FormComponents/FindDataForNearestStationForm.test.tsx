import { render, screen } from '@testing-library/react'
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
  onCoordinatesChange: vi.fn(),
  mapVisible: false,
  onToggleMap: vi.fn()
}

describe('FindDataForNearestStationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form component', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Show Map" button when map is not visible', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button')
    expect(mapButton).toHaveTextContent(/show map/i)
  })

  it('shows "Hide Map" button when map is visible', () => {
    const propsWithVisibleMap = { ...mockProps, mapVisible: true }
    render(<FindDataForNearestStationForm {...propsWithVisibleMap} />)
    
    const mapButton = screen.getByRole('button')
    expect(mapButton).toHaveTextContent(/hide map/i)
  })

  it('calls onToggleMap when button is clicked', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button')
    await user.click(mapButton)
    
    expect(mockProps.onToggleMap).toHaveBeenCalledTimes(1)
  })

  it('applies correct button styling when map is hidden', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button')
    expect(mapButton).toHaveClass('bg-blue-600')
  })

  it('applies correct button styling when map is visible', () => {
    const propsWithVisibleMap = { ...mockProps, mapVisible: true }
    render(<FindDataForNearestStationForm {...propsWithVisibleMap} />)
    
    const mapButton = screen.getByRole('button')
    expect(mapButton).toHaveClass('bg-red-600')
  })

  it('renders instructional text on desktop', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    expect(screen.getByText(/click on the map to select location/i)).toBeInTheDocument()
  })

  it('has correct form structure', () => {
    const { container } = render(<FindDataForNearestStationForm {...mockProps} />)
    
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('button is of type button, not submit', () => {
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button')
    expect(mapButton).toHaveAttribute('type', 'button')
  })

  it('calls onToggleMap multiple times correctly', async () => {
    const user = userEvent.setup()
    render(<FindDataForNearestStationForm {...mockProps} />)
    
    const mapButton = screen.getByRole('button')
    
    await user.click(mapButton)
    await user.click(mapButton)
    await user.click(mapButton)
    
    expect(mockProps.onToggleMap).toHaveBeenCalledTimes(3)
  })
})