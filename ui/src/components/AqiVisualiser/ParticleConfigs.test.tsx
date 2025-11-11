import { describe, it, expect } from 'vitest'
import { PARTICLE_CONFIGS } from './ParticleConfigs'

describe('ParticleConfigs', () => {
  it('exports an array of particle configurations', () => {
    expect(Array.isArray(PARTICLE_CONFIGS)).toBe(true)
    expect(PARTICLE_CONFIGS.length).toBeGreaterThan(0)
  })

  it('includes all expected pollutant types', () => {
    const keys = PARTICLE_CONFIGS.map(config => config.key)
    
    expect(keys).toContain('aqi')
    expect(keys).toContain('pm10')
    expect(keys).toContain('pm25')
    expect(keys).toContain('co')
    expect(keys).toContain('co2')
    expect(keys).toContain('no2')
    expect(keys).toContain('so2')
  })

  it('has exactly 7 particle configurations', () => {
    expect(PARTICLE_CONFIGS).toHaveLength(7)
  })

  it('each configuration has required properties', () => {
    PARTICLE_CONFIGS.forEach(config => {
      expect(config).toHaveProperty('key')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('shortLabel')
      expect(config).toHaveProperty('color')
      
      // Check types
      expect(typeof config.key).toBe('string')
      expect(typeof config.label).toBe('string')
      expect(typeof config.shortLabel).toBe('string')
      expect(typeof config.color).toBe('string')
    })
  })

  it('has valid hex color codes', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/
    
    PARTICLE_CONFIGS.forEach(config => {
      expect(config.color).toMatch(hexColorRegex)
    })
  })

  it('has unique keys', () => {
    const keys = PARTICLE_CONFIGS.map(config => config.key)
    const uniqueKeys = new Set(keys)
    
    expect(uniqueKeys.size).toBe(keys.length)
  })

  it('has descriptive labels', () => {
    PARTICLE_CONFIGS.forEach(config => {
      expect(config.label.length).toBeGreaterThan(2)
      expect(config.shortLabel.length).toBeGreaterThan(0)
      expect(config.shortLabel.length).toBeLessThanOrEqual(config.label.length)
    })
  })

  it('AQI configuration has correct properties', () => {
    const aqiConfig = PARTICLE_CONFIGS.find(config => config.key === 'aqi')
    
    expect(aqiConfig).toBeDefined()
    expect(aqiConfig?.label).toBe('Air Quality Index')
    expect(aqiConfig?.shortLabel).toBe('AQI')
    expect(aqiConfig?.color).toBe('#e62314')
  })

  it('PM2.5 configuration has correct properties', () => {
    const pm25Config = PARTICLE_CONFIGS.find(config => config.key === 'pm25')
    
    expect(pm25Config).toBeDefined()
    expect(pm25Config?.label).toBe('PM2.5 Particles')
    expect(pm25Config?.shortLabel).toBe('PM2.5')
    expect(pm25Config?.color).toBe('#73d707')
  })

  it('PM10 configuration has correct properties', () => {
    const pm10Config = PARTICLE_CONFIGS.find(config => config.key === 'pm10')
    
    expect(pm10Config).toBeDefined()
    expect(pm10Config?.label).toBe('PM10 Particles')
    expect(pm10Config?.shortLabel).toBe('PM10')
    expect(pm10Config?.color).toBe('#72bad5')
  })

  it('provides configurations in a consistent format', () => {
    // Check that all configs follow the same structure
    const firstConfig = PARTICLE_CONFIGS[0]
    const expectedKeys = Object.keys(firstConfig).sort()
    
    PARTICLE_CONFIGS.forEach(config => {
      const configKeys = Object.keys(config).sort()
      expect(configKeys).toEqual(expectedKeys)
    })
  })
})
