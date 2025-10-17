import "@testing-library/jest-dom/vitest"
import { afterEach, vi, beforeAll} from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock global objects that might not be available in test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

beforeAll(() => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();
  
  // Mock fetch if not already available
  if (!global.fetch) {
    global.fetch = vi.fn();
  }
});

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
})