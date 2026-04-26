import { describe, it, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import names from '~/data/names.json'
import { useDisplayName } from './useDisplayName'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDisplayName', () => {
  it('initialises with a generated display name', () => {
    const { displayName } = useDisplayName()
    expect(displayName.value).toBeTypeOf('string')
    expect(displayName.value.length).toBeGreaterThan(0)
  })

  it('initial name is built from the name lists', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { displayName } = useDisplayName()
    expect(displayName.value).toBe(`${names.first[0]}${names.second[0]}`)
  })

  it('regenerate() produces a new name', () => {
    const { displayName, regenerate } = useDisplayName()
    const before = displayName.value

    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    regenerate()

    expect(displayName.value).not.toBe(before)
  })

  it('regenerate() updates the reactive ref in place', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.9999)
      .mockReturnValueOnce(0.9999)

    const { displayName, regenerate } = useDisplayName()
    expect(displayName.value).toBe(`${names.first[0]}${names.second[0]}`)

    regenerate()

    expect(displayName.value).toBe(
      `${names.first[names.first.length - 1]}${names.second[names.second.length - 1]}`,
    )
  })

  it('each useDisplayName() call creates an independent ref', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const a = useDisplayName()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const b = useDisplayName()

    expect(a.displayName.value).not.toBe(b.displayName.value)
  })

  it('regenerate() can be called multiple times and always returns a valid name', () => {
    const { displayName, regenerate } = useDisplayName()
    for (let i = 0; i < 10; i++) {
      regenerate()
      const validFirst = names.first.some(f => displayName.value.startsWith(f))
      const validSecond = names.second.some(s => displayName.value.endsWith(s))
      expect(validFirst).toBe(true)
      expect(validSecond).toBe(true)
    }
  })
})
