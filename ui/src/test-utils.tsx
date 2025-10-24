import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock motion components to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Custom render function that provides common test setup
export const renderWithSetup = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, {
    // Add any common providers here if needed
    ...options,
  })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { renderWithSetup as render }