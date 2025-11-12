export function matchPattern(file: string, pattern: string): boolean {
  if (!file || !pattern) return false

  const regexStr = pattern
    .trim()
    .replace(/\*\*/g, '###DOUBLESTAR###')
    .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replace(/###DOUBLESTAR###/g, '.*')

  const regex = new RegExp(`^${regexStr}$`)
  return regex.test(file)
}
