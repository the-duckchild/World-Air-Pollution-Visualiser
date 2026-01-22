import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AqiVisualiser } from './AqiVisualiser'
import type { Iaqi } from '../../Api/ApiClient'

// Mock react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: { position: { set: vi.fn() } },
    gl: { domElement: document.createElement('canvas') }
  }))
}))

// Mock react-three/drei
vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: ({ children }: { children?: React.ReactNode }) => <div data-testid="camera">{children}</div>,
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Edges: ({ children }: { children?: React.ReactNode }) => <div data-testid="edges">{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <div data-testid="text">{children}</div>,
}))

// Mock child components
vi.mock('./ParticleSystems', () => ({
  ParticleSystem: ({ systemId, color, count }: any) => (
    <div data-testid={`particle-system-${systemId}`} data-color={color} data-count={count}>
      Particle System: {systemId}
    </div>
  )
}))

vi.mock('./Grass', () => ({
  default: () => <div data-testid="grass">Grass Component</div>
}))

vi.mock('./Sun', () => ({
  Sun: () => <div data-testid="sun">Sun Component</div>
}))

vi.mock('./Clouds', () => ({
  CloudPattern: () => <div data-testid="clouds">Cloud Pattern</div>
}))

const mockIaqi: Iaqi = {
  co: { v: 0.3 },
  co2: { v: 400 },
  no2: { v: 25 },
  pm10: { v: 35 },
  pm25: { v: 15 },
  so2: { v: 5 }
}

const mockEnabledSystems = {
  aqi: true,
  pm25: true,
  pm10: false,
  co: false,
  co2: false,
  no2: false,
  so2: false
}

const mockAllDisabledSystems = {
  aqi: false,
  pm25: false,
  pm10: false,
  co: false,
  co2: false,
  no2: false,
  so2: false
}

describe('AqiVisualiser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Helper function to advance time and wait for loading state to complete
   */
  const waitForLoadingComplete = async (rerender: () => void) => {
    await vi.advanceTimersByTimeAsync(1500)
    rerender()
  }

  it('renders the Canvas component', () => {
    render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  it('renders camera and controls', () => {
    render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    expect(screen.getByTestId('camera')).toBeInTheDocument()
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
  })

  it('renders environmental components', () => {
    render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    expect(screen.getByTestId('grass')).toBeInTheDocument()
    expect(screen.getByTestId('sun')).toBeInTheDocument()
    expect(screen.getByTestId('clouds')).toBeInTheDocument()
  })

  it('renders only enabled particle systems', () => {
    render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    // AQI and PM2.5 are enabled
    expect(screen.getByTestId('particle-system-aqi')).toBeInTheDocument()
    expect(screen.getByTestId('particle-system-pm25')).toBeInTheDocument()
    
    // PM10 is disabled
    expect(screen.queryByTestId('particle-system-pm10')).not.toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    const { container } = render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    // Component should render with canvas during loading
    expect(container).toBeInTheDocument()
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  it('accepts optional longitude and latitude props', () => {
    const { container } = render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={mockEnabledSystems}
        longitude={-0.1278}
        latitude={51.5074}
      />
    )
    
    // Component should render without errors
    expect(container).toBeInTheDocument()
  })

  it('handles empty enabled systems', () => {
    const allDisabled = {
      aqi: false,
      pm25: false,
      pm10: false,
      co: false,
      co2: false,
      no2: false,
      so2: false
    }
    
    render(
      <AqiVisualiser
        data={mockIaqi}
        overallAqi={65}
        enabledSystems={allDisabled}
      />
    )
    
    // Should still render the canvas and environmental components
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('grass')).toBeInTheDocument()
    
    // No particle systems should be rendered
    expect(screen.queryByTestId('particle-system-aqi')).not.toBeInTheDocument()
    expect(screen.queryByTestId('particle-system-pm25')).not.toBeInTheDocument()
  })

  it('renders with minimal data', () => {
    const minimalIaqi: Iaqi = {
      co: { v: 0 },
      co2: { v: 0 },
      no2: { v: 0 },
      pm10: { v: 0 },
      pm25: { v: 0 },
      so2: { v: 0 }
    }
    
    render(
      <AqiVisualiser
        data={minimalIaqi}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  it('handles overallAqi being undefined', () => {
    render(
      <AqiVisualiser
        data={mockIaqi}
        enabledSystems={mockEnabledSystems}
      />
    )
    
    // Should render without errors even when overallAqi is undefined
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  describe('Legend', () => {
    it('is not visible during loading state', () => {
      render(
        <AqiVisualiser
          data={mockIaqi}
          overallAqi={65}
          enabledSystems={mockEnabledSystems}
        />
      )
      
      // Legend should not be visible during initial loading
      expect(screen.queryByText('Active Pollutants')).not.toBeInTheDocument()
    })

    it('displays active pollutants correctly after loading', async () => {
      vi.useFakeTimers()
      
      const { rerender } = render(
        <AqiVisualiser
          data={mockIaqi}
          overallAqi={65}
          enabledSystems={mockEnabledSystems}
        />
      )
      
      // Wait for loading to complete
      await waitForLoadingComplete(() =>
        rerender(
          <AqiVisualiser
            data={mockIaqi}
            overallAqi={65}
            enabledSystems={mockEnabledSystems}
          />
        )
      )
      
      // Legend title should be visible
      expect(screen.getByText('Active Pollutants')).toBeInTheDocument()
      
      // Active pollutants should be displayed (pm25 and aqi are enabled)
      expect(screen.getByText('PM2.5')).toBeInTheDocument()
      expect(screen.getByText('AQI')).toBeInTheDocument()
      
      // Inactive pollutants should not be displayed
      expect(screen.queryByText('PM10')).not.toBeInTheDocument()
      expect(screen.queryByText('CO')).not.toBeInTheDocument()
      
      vi.useRealTimers()
    })

    it('displays "No Pollutants active" when no pollutants are enabled', async () => {
      vi.useFakeTimers()
      
      const { rerender } = render(
        <AqiVisualiser
          data={mockIaqi}
          overallAqi={65}
          enabledSystems={mockAllDisabledSystems}
        />
      )
      
      // Wait for loading to complete
      await waitForLoadingComplete(() =>
        rerender(
          <AqiVisualiser
            data={mockIaqi}
            overallAqi={65}
            enabledSystems={mockAllDisabledSystems}
          />
        )
      )
      
      // Legend should show the "no pollutants" message
      expect(screen.getByText('No Pollutants active')).toBeInTheDocument()
      
      vi.useRealTimers()
    })

    it('displays "No Pollutants active" when enabled systems have zero particle count', async () => {
      vi.useFakeTimers()
      
      const zeroDataIaqi: Iaqi = {
        co: { v: 0 },
        co2: { v: 0 },
        no2: { v: 0 },
        pm10: { v: 0 },
        pm25: { v: 0 },
        so2: { v: 0 }
      }
      
      const { rerender } = render(
        <AqiVisualiser
          data={zeroDataIaqi}
          overallAqi={0}
          enabledSystems={mockEnabledSystems}
        />
      )
      
      // Wait for loading to complete
      await waitForLoadingComplete(() =>
        rerender(
          <AqiVisualiser
            data={zeroDataIaqi}
            overallAqi={0}
            enabledSystems={mockEnabledSystems}
          />
        )
      )
      
      // Legend should show the "no pollutants" message even though some are enabled
      expect(screen.getByText('No Pollutants active')).toBeInTheDocument()
      
      vi.useRealTimers()
    })

    it('has proper accessibility attributes', async () => {
      vi.useFakeTimers()
      
      const { rerender } = render(
        <AqiVisualiser
          data={mockIaqi}
          overallAqi={65}
          enabledSystems={mockEnabledSystems}
        />
      )
      
      // Wait for loading to complete
      await waitForLoadingComplete(() =>
        rerender(
          <AqiVisualiser
            data={mockIaqi}
            overallAqi={65}
            enabledSystems={mockEnabledSystems}
          />
        )
      )
      
      // Legend list should have proper aria-label
      const legendList = screen.getByLabelText('Active pollutants legend')
      expect(legendList).toBeInTheDocument()
      
      vi.useRealTimers()
    })
  })
})
