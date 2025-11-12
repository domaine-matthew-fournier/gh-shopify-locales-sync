/**
 * Unit tests for src/wait.ts
 */
import { matchPattern } from '../src/uitils'

describe('Match Pattern', () => {
  it('should return true when pattern matches the string exactly', () => {
    expect(matchPattern('src/file.ts', 'src/file.ts')).toBe(true)
  })

  it('should return true when pattern contains wildcard and matches', () => {
    expect(matchPattern('src/file.ts', 'src/*.ts')).toBe(true)
  })

  it('should return false when pattern does not match the string', () => {
    expect(matchPattern('src/file.ts', 'dist/*.ts')).toBe(false)
  })

  it('should return true for pattern with wildcard at the start', () => {
    expect(matchPattern('file.ts', '*.ts')).toBe(true)
  })

  it('should return false for pattern with different extension', () => {
    expect(matchPattern('file.js', '*.ts')).toBe(false)
  })

  it('should return true for pattern with wildcard in the middle', () => {
    expect(matchPattern('src/utils/file.ts', 'src/*/file.ts')).toBe(true)
  })

  it('should return false for empty pattern', () => {
    expect(matchPattern('src/file.ts', '')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(matchPattern('', 'src/*.ts')).toBe(false)
  })

  it('should return true for theme/** pattern matching', () => {
    expect(matchPattern('theme/assets/style.css', 'theme/**')).toBe(true)
  })

  it('should return false for theme/** pattern not matching', () => {
    expect(matchPattern('src/assets/style.css', 'theme/**')).toBe(false)
  })
})
