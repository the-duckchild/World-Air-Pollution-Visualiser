import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TickerTape } from './TickerTape'

describe('TickerTape', () => {
  it('renders the ticker tape component', () => {
    render(<TickerTape />)
    
    // Check if the ticker tape container exists
    const tickerContainer = document.querySelector('.w-full.bg-muted.border-t')
    expect(tickerContainer).toBeInTheDocument()
  })

  it('displays city data with AQI values', () => {
    render(<TickerTape />)
    
    // Check for specific cities from mock data (data is duplicated so use getAllByText)
    expect(screen.getAllByText('New York, USA')).toHaveLength(2)
    expect(screen.getAllByText('London, UK')).toHaveLength(2)
    expect(screen.getAllByText('Tokyo, Japan')).toHaveLength(2)
    expect(screen.getAllByText('Delhi, India')).toHaveLength(2)
  })

  it('displays AQI values with correct format', () => {
    render(<TickerTape />)
    
    // Check for AQI value format (data is duplicated)
    expect(screen.getAllByText('AQI 65')).toHaveLength(2)
    expect(screen.getAllByText('AQI 42')).toHaveLength(2)
    expect(screen.getAllByText('AQI 156')).toHaveLength(2)
  })

  it('displays pollutant types', () => {
    render(<TickerTape />)
    
    // Check for pollutant types (multiple instances due to duplication)
    expect(screen.getAllByText('PM2.5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('NO2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('O3').length).toBeGreaterThan(0)
  })

  it('applies correct CSS classes for different AQI levels', () => {
    render(<TickerTape />)
    
    // Test good AQI (≤50) - should have green color (get first instance)
    const goodAqiElements = screen.getAllByText('AQI 28')
    expect(goodAqiElements[0]).toHaveClass('text-green-600')
    expect(goodAqiElements[0]).toHaveClass('bg-green-100')
    
    // Test moderate AQI (51-100) - should have yellow color
    const moderateAqiElements = screen.getAllByText('AQI 65')
    expect(moderateAqiElements[0]).toHaveClass('text-yellow-600')
    expect(moderateAqiElements[0]).toHaveClass('bg-yellow-100')
    
    // Test unhealthy AQI (151-200) - should have red color
    const unhealthyAqiElements = screen.getAllByText('AQI 156')
    expect(unhealthyAqiElements[0]).toHaveClass('text-red-600')
    expect(unhealthyAqiElements[0]).toHaveClass('bg-red-100')
  })

  it('duplicates data for continuous scrolling effect', () => {
    render(<TickerTape />)
    
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
    expect(mainContainer).toHaveClass('w-full', 'bg-muted', 'border-t', 'overflow-hidden', 'py-2', 'fixed', 'bottom-0')
  })
})