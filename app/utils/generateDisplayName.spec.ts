import { describe, it, expect, vi, afterEach } from 'vitest'
import names from '~/data/names.json'
import { generateDisplayName } from './generateDisplayName'

afterEach(() => { vi.restoreAllMocks() })

describe('generateDisplayName', () => {
  it('returns a non-empty string', () => {
    expect(generateDisplayName()).toBeTypeOf('string')
    expect(generateDisplayName().length).toBeGreaterThan(0)
  })

  it('combines exactly one first name and one second name', () => {
    const result = generateDisplayName()
    const matchedFirst = names.first.find(f => result.startsWith(f))
    const matchedSecond = names.second.find(s => result.endsWith(s))

    expect(matchedFirst).toBeDefined()
    expect(matchedSecond).toBeDefined()
    expect(`${matchedFirst}${matchedSecond}`).toBe(result)
  })

  it('only uses names from the defined lists', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateDisplayName()
      const validFirst = names.first.some(f => result.startsWith(f))
      const validSecond = names.second.some(s => result.endsWith(s))
      expect(validFirst).toBe(true)
      expect(validSecond).toBe(true)
    }
  })

  it('produces different names across calls (non-deterministic)', () => {
    const results = new Set(Array.from({ length: 20 }, () => generateDisplayName()))
    expect(results.size).toBeGreaterThan(1)
  })

  it('uses the first name picked by Math.random', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0)
    const result = generateDisplayName()
    expect(result).toBe(`${names.first[0]}${names.second[0]}`)
  })

  it('uses the last entry in each list when Math.random approaches 1', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9999)
      .mockReturnValueOnce(0.9999)
    const result = generateDisplayName()
    expect(result).toBe(
      `${names.first[names.first.length - 1]}${names.second[names.second.length - 1]}`,
    )
  })

  it('covers the full range of first names via index selection', () => {
    const seen = new Set<string>()
    for (let i = 0; i < names.first.length; i++) {
      const ratio = i / names.first.length
      vi.spyOn(Math, 'random').mockReturnValueOnce(ratio).mockReturnValueOnce(0)
      seen.add(generateDisplayName().replace(names.second[0]!, ''))
    }
    expect(seen.size).toBe(names.first.length)
  })
})
