import { describe, it, expect } from 'vitest'
import {
  formatWiFi,
  formatVCard,
  formatEmail,
  formatSMS,
  formatPhone,
  formatPlainText,
  getFormatter
} from '@/utils/qrDataFormatters'

describe('qrDataFormatters', () => {
  describe('formatWiFi', () => {
    it('should format basic WiFi with WPA security', () => {
      const result = formatWiFi({
        ssid: 'MyNetwork',
        password: 'mypassword123',
        security: 'WPA'
      })

      expect(result).toBe('WIFI:T:WPA;S:MyNetwork;P:mypassword123;;')
    })

    it('should format WiFi with WEP security', () => {
      const result = formatWiFi({
        ssid: 'OldNetwork',
        password: 'wepkey',
        security: 'WEP'
      })

      expect(result).toBe('WIFI:T:WEP;S:OldNetwork;P:wepkey;;')
    })

    it('should format WiFi with no password (open network)', () => {
      const result = formatWiFi({
        ssid: 'OpenNetwork',
        password: '',
        security: 'nopass'
      })

      expect(result).toBe('WIFI:T:nopass;S:OpenNetwork;;')
    })

    it('should format hidden WiFi network', () => {
      const result = formatWiFi({
        ssid: 'HiddenNetwork',
        password: 'secret',
        security: 'WPA',
        hidden: true
      })

      expect(result).toBe('WIFI:T:WPA;S:HiddenNetwork;P:secret;H:true;;')
    })

    it('should default to WPA security', () => {
      const result = formatWiFi({
        ssid: 'DefaultNetwork',
        password: 'pass123'
      })

      expect(result).toContain('T:WPA')
    })

    it('should escape special characters in SSID', () => {
      const result = formatWiFi({
        ssid: 'My;Network:Name',
        password: 'pass123',
        security: 'WPA'
      })

      expect(result).toContain('S:My\\;Network\\:Name')
    })

    it('should escape special characters in password', () => {
      const result = formatWiFi({
        ssid: 'Network',
        password: 'pass;word:test',
        security: 'WPA'
      })

      expect(result).toContain('P:pass\\;word\\:test')
    })

    it('should escape backslashes', () => {
      const result = formatWiFi({
        ssid: 'Net\\work',
        password: 'pass\\word',
        security: 'WPA'
      })

      expect(result).toContain('S:Net\\\\work')
      expect(result).toContain('P:pass\\\\word')
    })

    it('should escape double quotes', () => {
      const result = formatWiFi({
        ssid: 'My"Network"',
        password: 'pass"word',
        security: 'WPA'
      })

      expect(result).toContain('S:My\\"Network\\"')
    })

    it('should escape commas', () => {
      const result = formatWiFi({
        ssid: 'Net,work',
        password: 'pass,word',
        security: 'WPA'
      })

      expect(result).toContain('S:Net\\,work')
    })

    it('should throw error when SSID is missing', () => {
      expect(() => formatWiFi({ password: 'test', security: 'WPA' }))
        .toThrow('SSID is required for WiFi QR codes')
    })

    it('should throw error when SSID is empty', () => {
      expect(() => formatWiFi({ ssid: '', password: 'test', security: 'WPA' }))
        .toThrow('SSID is required for WiFi QR codes')
    })

    it('should not include password for nopass security', () => {
      const result = formatWiFi({
        ssid: 'OpenNetwork',
        password: 'ignored',
        security: 'nopass'
      })

      expect(result).not.toContain('P:')
    })

    it('should not include hidden flag when false', () => {
      const result = formatWiFi({
        ssid: 'Network',
        password: 'pass',
        security: 'WPA',
        hidden: false
      })

      expect(result).not.toContain('H:')
    })
  })

  describe('formatVCard', () => {
    it('should format basic vCard with name', () => {
      const result = formatVCard({ name: 'John Doe' })

      expect(result).toContain('BEGIN:VCARD')
      expect(result).toContain('VERSION:3.0')
      expect(result).toContain('FN:John Doe')
      expect(result).toContain('END:VCARD')
    })

    it('should format vCard with all fields', () => {
      const result = formatVCard({
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        organization: 'ACME Inc',
        url: 'https://example.com'
      })

      expect(result).toContain('FN:John Doe')
      expect(result).toContain('TEL:+1234567890')
      expect(result).toContain('EMAIL:john@example.com')
      expect(result).toContain('ORG:ACME Inc')
      expect(result).toContain('URL:https://example.com')
    })

    it('should format vCard with only phone', () => {
      const result = formatVCard({ phone: '+1234567890' })

      expect(result).toContain('TEL:+1234567890')
      expect(result).not.toContain('FN:')
    })

    it('should format vCard with only email', () => {
      const result = formatVCard({ email: 'test@example.com' })

      expect(result).toContain('EMAIL:test@example.com')
      expect(result).not.toContain('FN:')
    })

    it('should throw error when no contact info provided', () => {
      expect(() => formatVCard({}))
        .toThrow('At least one field (name, phone, or email) is required for vCard')
    })

    it('should throw error when only organization provided', () => {
      expect(() => formatVCard({ organization: 'ACME' }))
        .toThrow('At least one field (name, phone, or email) is required for vCard')
    })

    it('should throw error when only URL provided', () => {
      expect(() => formatVCard({ url: 'https://example.com' }))
        .toThrow('At least one field (name, phone, or email) is required for vCard')
    })

    it('should use newline characters for vCard format', () => {
      const result = formatVCard({ name: 'Test' })

      expect(result.split('\n').length).toBeGreaterThan(1)
    })

    it('should not include empty optional fields', () => {
      const result = formatVCard({
        name: 'John',
        phone: '',
        email: '',
        organization: '',
        url: ''
      })

      expect(result).not.toContain('TEL:')
      expect(result).not.toContain('EMAIL:')
      expect(result).not.toContain('ORG:')
      expect(result).not.toContain('URL:')
    })
  })

  describe('formatEmail', () => {
    it('should format basic email', () => {
      const result = formatEmail({ to: 'test@example.com' })

      expect(result).toBe('mailto:test@example.com')
    })

    it('should format email with subject', () => {
      const result = formatEmail({
        to: 'test@example.com',
        subject: 'Hello World'
      })

      expect(result).toBe('mailto:test@example.com?subject=Hello%20World')
    })

    it('should format email with body', () => {
      const result = formatEmail({
        to: 'test@example.com',
        body: 'This is the message'
      })

      expect(result).toBe('mailto:test@example.com?body=This%20is%20the%20message')
    })

    it('should format email with subject and body', () => {
      const result = formatEmail({
        to: 'test@example.com',
        subject: 'Hello',
        body: 'Message here'
      })

      expect(result).toBe('mailto:test@example.com?subject=Hello&body=Message%20here')
    })

    it('should URL encode special characters in subject', () => {
      const result = formatEmail({
        to: 'test@example.com',
        subject: 'Hello & Goodbye'
      })

      expect(result).toContain('subject=Hello%20%26%20Goodbye')
    })

    it('should URL encode special characters in body', () => {
      const result = formatEmail({
        to: 'test@example.com',
        body: 'Line1\nLine2'
      })

      expect(result).toContain('body=Line1%0ALine2')
    })

    it('should throw error when recipient is missing', () => {
      expect(() => formatEmail({ subject: 'Hello' }))
        .toThrow('Recipient email address is required')
    })

    it('should throw error when recipient is empty', () => {
      expect(() => formatEmail({ to: '', subject: 'Hello' }))
        .toThrow('Recipient email address is required')
    })

    it('should handle empty subject and body', () => {
      const result = formatEmail({
        to: 'test@example.com',
        subject: '',
        body: ''
      })

      expect(result).toBe('mailto:test@example.com')
    })
  })

  describe('formatSMS', () => {
    it('should format basic SMS', () => {
      const result = formatSMS({ phone: '+1234567890' })

      expect(result).toBe('sms:+1234567890')
    })

    it('should format SMS with message', () => {
      const result = formatSMS({
        phone: '+1234567890',
        message: 'Hello there!'
      })

      expect(result).toBe('sms:+1234567890?body=Hello%20there!')
    })

    it('should URL encode message', () => {
      const result = formatSMS({
        phone: '+1234567890',
        message: 'Hello & Goodbye'
      })

      expect(result).toContain('body=Hello%20%26%20Goodbye')
    })

    it('should throw error when phone is missing', () => {
      expect(() => formatSMS({ message: 'Hello' }))
        .toThrow('Phone number is required for SMS')
    })

    it('should throw error when phone is empty', () => {
      expect(() => formatSMS({ phone: '', message: 'Hello' }))
        .toThrow('Phone number is required for SMS')
    })

    it('should handle empty message', () => {
      const result = formatSMS({
        phone: '+1234567890',
        message: ''
      })

      expect(result).toBe('sms:+1234567890')
    })
  })

  describe('formatPhone', () => {
    it('should format phone number', () => {
      const result = formatPhone('+1234567890')

      expect(result).toBe('tel:+1234567890')
    })

    it('should handle phone with dashes', () => {
      const result = formatPhone('123-456-7890')

      expect(result).toBe('tel:123-456-7890')
    })

    it('should handle phone with spaces', () => {
      const result = formatPhone('123 456 7890')

      expect(result).toBe('tel:123 456 7890')
    })

    it('should throw error when phone is missing', () => {
      expect(() => formatPhone(null))
        .toThrow('Phone number is required')
    })

    it('should throw error when phone is empty', () => {
      expect(() => formatPhone(''))
        .toThrow('Phone number is required')
    })

    it('should throw error when phone is undefined', () => {
      expect(() => formatPhone(undefined))
        .toThrow('Phone number is required')
    })
  })

  describe('formatPlainText', () => {
    it('should return trimmed text', () => {
      const result = formatPlainText('  Hello World  ')

      expect(result).toBe('Hello World')
    })

    it('should handle text without whitespace', () => {
      const result = formatPlainText('NoWhitespace')

      expect(result).toBe('NoWhitespace')
    })

    it('should throw error for empty text', () => {
      expect(() => formatPlainText(''))
        .toThrow('Text cannot be empty')
    })

    it('should throw error for whitespace-only text', () => {
      expect(() => formatPlainText('   '))
        .toThrow('Text cannot be empty')
    })

    it('should throw error for null text', () => {
      expect(() => formatPlainText(null))
        .toThrow('Text cannot be empty')
    })

    it('should throw error for undefined text', () => {
      expect(() => formatPlainText(undefined))
        .toThrow('Text cannot be empty')
    })

    it('should handle URLs', () => {
      const result = formatPlainText('https://example.com/path?query=value')

      expect(result).toBe('https://example.com/path?query=value')
    })

    it('should handle multiline text', () => {
      const result = formatPlainText('  Line1\nLine2  ')

      expect(result).toBe('Line1\nLine2')
    })
  })

  describe('getFormatter', () => {
    it('should return text formatter for text type', () => {
      const formatter = getFormatter('text')
      expect(formatter).toBe(formatPlainText)
    })

    it('should return WiFi formatter for wifi type', () => {
      const formatter = getFormatter('wifi')
      expect(formatter).toBe(formatWiFi)
    })

    it('should return vCard formatter for vcard type', () => {
      const formatter = getFormatter('vcard')
      expect(formatter).toBe(formatVCard)
    })

    it('should return email formatter for email type', () => {
      const formatter = getFormatter('email')
      expect(formatter).toBe(formatEmail)
    })

    it('should return SMS formatter for sms type', () => {
      const formatter = getFormatter('sms')
      expect(formatter).toBe(formatSMS)
    })

    it('should return phone formatter for phone type', () => {
      const formatter = getFormatter('phone')
      expect(formatter).toBe(formatPhone)
    })

    it('should return text formatter for unknown type', () => {
      const formatter = getFormatter('unknown')
      expect(formatter).toBe(formatPlainText)
    })

    it('should return text formatter for undefined type', () => {
      const formatter = getFormatter(undefined)
      expect(formatter).toBe(formatPlainText)
    })

    it('should return text formatter for null type', () => {
      const formatter = getFormatter(null)
      expect(formatter).toBe(formatPlainText)
    })
  })

  describe('integration tests', () => {
    it('should generate valid WiFi QR data', () => {
      const wifi = formatWiFi({
        ssid: 'Coffee Shop WiFi',
        password: 'guest2024',
        security: 'WPA',
        hidden: false
      })

      expect(wifi).toMatch(/^WIFI:/)
      expect(wifi).toMatch(/;;$/)
    })

    it('should generate valid vCard format', () => {
      const vcard = formatVCard({
        name: 'Jane Smith',
        phone: '+1-555-123-4567',
        email: 'jane@company.com',
        organization: 'Company LLC',
        url: 'https://company.com'
      })

      const lines = vcard.split('\n')
      expect(lines[0]).toBe('BEGIN:VCARD')
      expect(lines[1]).toBe('VERSION:3.0')
      expect(lines[lines.length - 1]).toBe('END:VCARD')
    })

    it('should handle complex email with all fields', () => {
      const email = formatEmail({
        to: 'support@company.com',
        subject: 'Question about Product #123',
        body: 'Hi,\n\nI have a question about...\n\nBest regards'
      })

      expect(email).toMatch(/^mailto:/)
      expect(email).toContain('support@company.com')
      expect(email).toContain('subject=')
      expect(email).toContain('body=')
    })
  })
})
