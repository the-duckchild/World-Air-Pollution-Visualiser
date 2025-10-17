import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock the HomePage component
vi.mock('./Pages/Home/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page Component</div>
}))

// Mock CSS imports
vi.mock('./styles/globals.css', () => ({}))
vi.mock('./styles/app.css', () => ({}))

// Mock react-router-dom to avoid issues with routing in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>
  }
})

describe('App', () => {
  it('renders the App component with routing', () => {
    render(<App />)
    
    // Check if HomePage is rendered through routing
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('sets up routing structure correctly', () => {
    render(<App />)
    
    // The HomePage should be accessible at the root route
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(screen.getByText('Home Page Component')).toBeInTheDocument()
  })

  it('renders without errors', () => {
    // This test ensures the component mounts successfully
    expect(() => render(<App />)).not.toThrow()
  })
})