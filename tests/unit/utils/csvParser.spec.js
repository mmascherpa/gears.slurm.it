import { describe, it, expect, vi } from 'vitest'
import { capitalize, convertToTableData, parseCSV } from '@/utils/csvParser'

describe('csvParser', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a word', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('world')).toBe('World')
    })

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A')
    })

    it('should handle already capitalized words', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    it('should return empty string for invalid input', () => {
      expect(capitalize('')).toBe('')
      expect(capitalize(null)).toBe('')
      expect(capitalize(undefined)).toBe('')
    })

    it('should return empty string for non-string input', () => {
      expect(capitalize(123)).toBe('')
      expect(capitalize({})).toBe('')
      expect(capitalize([])).toBe('')
    })
  })

  describe('convertToTableData', () => {
    it('should convert headers and rows to Vuetify table format', () => {
      const headers = ['name', 'age', 'city']
      const rows = [
        ['Alice', '25', 'NYC'],
        ['Bob', '30', 'LA']
      ]

      const result = convertToTableData(headers, rows)

      expect(result.headers).toEqual([
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' },
        { title: 'City', key: 'city' }
      ])

      expect(result.data).toEqual([
        { name: 'Alice', age: '25', city: 'NYC' },
        { name: 'Bob', age: '30', city: 'LA' }
      ])
    })

    it('should handle empty rows array', () => {
      const headers = ['name', 'age']
      const rows = []

      const result = convertToTableData(headers, rows)

      expect(result.headers).toEqual([
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' }
      ])
      expect(result.data).toEqual([])
    })

    it('should handle rows with fewer columns than headers', () => {
      const headers = ['name', 'age', 'city']
      const rows = [['Alice', '25']] // Missing 'city' column

      const result = convertToTableData(headers, rows)

      expect(result.data[0]).toEqual({
        name: 'Alice',
        age: '25',
        city: undefined
      })
    })

    it('should handle rows with more columns than headers', () => {
      const headers = ['name', 'age']
      const rows = [['Alice', '25', 'NYC']] // Extra 'NYC' value

      const result = convertToTableData(headers, rows)

      expect(result.data[0]).toEqual({
        name: 'Alice',
        age: '25'
      })
    })

    it('should handle special characters in headers', () => {
      const headers = ['first-name', 'email@domain']
      const rows = [['Alice', 'alice@example.com']]

      const result = convertToTableData(headers, rows)

      expect(result.headers[0].key).toBe('first-name')
      expect(result.headers[1].key).toBe('email@domain')
    })
  })

  describe('parseCSV', () => {
    it('should parse basic CSV text', () => {
      const csv = 'name,age,city\nAlice,25,NYC\nBob,30,LA'
      const result = parseCSV(csv)

      expect(result.headers).toEqual([
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' },
        { title: 'City', key: 'city' }
      ])

      expect(result.data).toEqual([
        { name: 'Alice', age: '25', city: 'NYC' },
        { name: 'Bob', age: '30', city: 'LA' }
      ])
    })

    it('should handle CSV with Windows line endings (\\r\\n)', () => {
      const csv = 'name,age\r\nAlice,25\r\nBob,30'
      const result = parseCSV(csv)

      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({ name: 'Alice', age: '25' })
    })

    it('should handle CSV with Mac line endings (\\r)', () => {
      const csv = 'name,age\rAlice,25\rBob,30'
      const result = parseCSV(csv)

      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({ name: 'Alice', age: '25' })
    })

    it('should handle Uint8Array input', () => {
      const csvText = 'name,age\nAlice,25'
      const uint8Array = new TextEncoder().encode(csvText)
      const result = parseCSV(uint8Array)

      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toEqual({ name: 'Alice', age: '25' })
    })

    it('should handle empty lines in CSV', () => {
      const csv = 'name,age\n\nAlice,25\n\nBob,30\n\n'
      const result = parseCSV(csv)

      expect(result.data).toHaveLength(2) // Empty lines should be filtered out
    })

    it('should handle CSV with only headers', () => {
      const csv = 'name,age,city'
      const result = parseCSV(csv)

      expect(result.headers).toHaveLength(3)
      expect(result.data).toHaveLength(0)
    })

    it('should handle empty CSV input', () => {
      const result = parseCSV('')

      expect(result.headers).toEqual([])
      expect(result.data).toEqual([])
    })

    it('should handle whitespace-only CSV', () => {
      const csv = '   \n   \n   '
      const result = parseCSV(csv)

      expect(result.headers).toEqual([])
      expect(result.data).toEqual([])
    })

    it('should handle invalid input types', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn')

      expect(parseCSV(null).headers).toEqual([])
      expect(parseCSV(undefined).headers).toEqual([])
      expect(parseCSV(123).headers).toEqual([])

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should handle CSV with commas in values (basic case)', () => {
      // Note: This is a limitation - the current parser doesn't handle quoted fields
      const csv = 'name,description\nAlice,Simple description\nBob,Another one'
      const result = parseCSV(csv)

      expect(result.data).toHaveLength(2)
    })

    it('should handle Unicode characters in CSV', () => {
      const csv = 'name,emoji\nAlice,😀\nBob,🎉'
      const result = parseCSV(csv)

      expect(result.data[0]).toEqual({ name: 'Alice', emoji: '😀' })
      expect(result.data[1]).toEqual({ name: 'Bob', emoji: '🎉' })
    })

    it('should handle CSV with numeric-only values', () => {
      const csv = '1,2,3\n4,5,6'
      const result = parseCSV(csv)

      expect(result.headers).toEqual([
        { title: '1', key: '1' },
        { title: '2', key: '2' },
        { title: '3', key: '3' }
      ])
      expect(result.data[0]).toEqual({ '1': '4', '2': '5', '3': '6' })
    })

    it('should handle very long CSV files', () => {
      const headers = 'col1,col2,col3'
      const rows = Array(1000).fill('val1,val2,val3').join('\n')
      const csv = `${headers}\n${rows}`

      const result = parseCSV(csv)

      expect(result.data).toHaveLength(1000)
      expect(result.data[0]).toEqual({ col1: 'val1', col2: 'val2', col3: 'val3' })
    })
  })
})
