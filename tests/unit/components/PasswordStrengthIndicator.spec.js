import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('PasswordStrengthIndicator.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(PasswordStrengthIndicator, {
      props: {
        password: '',
        ...props,
      },
      global: {
        plugins: [vuetify],
      },
    })
  }

  describe('Basic Rendering', () => {
    it('should not render when password is empty', () => {
      const wrapper = createWrapper({ password: '' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(false)
    })

    it('should render when password is provided', () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    })

    it('should render progress bar', () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.findComponent({ name: 'VProgressLinear' }).exists()).toBe(true)
    })

    it('should render strength label chip', () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.findComponent({ name: 'VChip' }).exists()).toBe(true)
    })
  })

  describe('Password Strength Levels', () => {
    it('should show "Weak" for short password', () => {
      const wrapper = createWrapper({ password: 'abc' })
      expect(wrapper.html()).toContain('Weak')
    })

    it('should show "Weak" for simple password', () => {
      const wrapper = createWrapper({ password: 'password' })
      expect(wrapper.html()).toContain('Weak')
    })

    it('should show "Weak" for password without special chars', () => {
      const wrapper = createWrapper({ password: 'Password123' })
      expect(wrapper.html()).toContain('Weak')
    })

    it('should show "Very Strong" for password with all requirements met', () => {
      const wrapper = createWrapper({ password: 'Password123!' })
      expect(wrapper.html()).toContain('Very Strong')
    })

    it('should show "Strong" for long password missing one requirement', () => {
      const wrapper = createWrapper({ password: 'LongPassword2024' })
      expect(wrapper.html()).toContain('Strong')
    })

    it('should show "Very Strong" for excellent password', () => {
      const wrapper = createWrapper({ password: 'MyP@ssw0rd!2024' })
      expect(wrapper.html()).toContain('Very Strong')
    })
  })

  describe('Progress Bar', () => {
    it('should show low percentage for weak password', () => {
      const wrapper = createWrapper({ password: 'abc' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('modelValue')).toBeLessThan(50)
    })

    it('should show low percentage for password without special chars', () => {
      const wrapper = createWrapper({ password: 'Password123' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('modelValue')).toBeLessThan(50)
    })

    it('should show 100% for password with all requirements met', () => {
      const wrapper = createWrapper({ password: 'Password123!' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('modelValue')).toBe(100)
    })

    it('should show high percentage for strong password', () => {
      const wrapper = createWrapper({ password: 'Password123!@#' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('modelValue')).toBeGreaterThan(65)
    })

    it('should show 100% for very strong password', () => {
      const wrapper = createWrapper({ password: 'MyP@ssw0rd!2024' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('modelValue')).toBe(100)
    })
  })

  describe('Color Coding', () => {
    it('should use error color for weak password', () => {
      const wrapper = createWrapper({ password: 'abc' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('color')).toBe('error')
    })

    it('should use success color for password with all requirements', () => {
      const wrapper = createWrapper({ password: 'Password123!' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('color')).toBe('success')
    })

    it('should use success color for strong password', () => {
      const wrapper = createWrapper({ password: 'Password123!@#' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('color')).toBe('success')
    })

    it('should use success color for very strong password', () => {
      const wrapper = createWrapper({ password: 'MyP@ssw0rd!2024' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.props('color')).toBe('success')
    })
  })

  describe('Requirements Checklist', () => {
    it('should show requirements by default', () => {
      const wrapper = createWrapper({ password: 'test' })
      expect(wrapper.html()).toContain('Password Requirements:')
    })

    it('should not show requirements when showRequirements is false', () => {
      const wrapper = createWrapper({
        password: 'test',
        showRequirements: false
      })
      expect(wrapper.html()).not.toContain('Password Requirements:')
    })

    it('should show minimum length requirement', () => {
      const wrapper = createWrapper({ password: 'test' })
      expect(wrapper.html()).toContain('At least 12 characters')
    })

    it('should show uppercase and lowercase requirement', () => {
      const wrapper = createWrapper({ password: 'test' })
      expect(wrapper.html()).toContain('Uppercase and lowercase letters')
    })

    it('should show requirement items in list', () => {
      const wrapper = createWrapper({ password: 'test' })
      const listItems = wrapper.findAllComponents({ name: 'VListItem' })
      // Should have at least 3 requirement items
      expect(listItems.length).toBeGreaterThanOrEqual(3)
    })

    it('should mark length requirement as met when satisfied', () => {
      const wrapper = createWrapper({ password: 'a'.repeat(12) })
      const icons = wrapper.findAllComponents({ name: 'VIcon' })
      // Should have at least one success icon for met requirement
      const successIcons = icons.filter(icon => icon.props('color') === 'success')
      expect(successIcons.length).toBeGreaterThan(0)
    })

    it('should mark all requirements as met for very strong password', () => {
      const wrapper = createWrapper({ password: 'MyP@ssw0rd!2024' })
      const icons = wrapper.findAllComponents({ name: 'VIcon' })
      // All 4 requirements should be met (success color)
      const successIcons = icons.filter(icon => icon.props('color') === 'success')
      expect(successIcons.length).toBe(4)
    })
  })

  describe('Score Display', () => {
    it('should not show score by default', () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.html()).not.toContain('Score:')
    })

    it('should show score when showScore is true', () => {
      const wrapper = createWrapper({
        password: 'test123',
        showScore: true
      })
      expect(wrapper.html()).toContain('Score:')
    })

    it('should display score out of 100', () => {
      const wrapper = createWrapper({
        password: 'test123',
        showScore: true
      })
      expect(wrapper.html()).toMatch(/Score:\s*\d+\/100/)
    })
  })

  describe('Feedback Messages', () => {
    it('should show feedback by default for weak passwords', () => {
      const wrapper = createWrapper({ password: 'abc' })
      const alert = wrapper.findComponent({ name: 'VAlert' })
      // Feedback should exist for weak password
      expect(alert.exists()).toBe(true)
    })

    it('should not show feedback when showFeedback is false', () => {
      const wrapper = createWrapper({
        password: 'abc',
        showFeedback: false
      })
      const alert = wrapper.findComponent({ name: 'VAlert' })
      expect(alert.exists()).toBe(false)
    })

    it('should show helpful suggestions in feedback', () => {
      const wrapper = createWrapper({ password: 'abc' })
      // Should contain some feedback text
      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(100) // Feedback adds content
    })
  })

  describe('Strength Change Event', () => {
    it('should emit strength-changed event on mount', async () => {
      const wrapper = createWrapper({ password: 'test123' })
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('strength-changed')).toBeTruthy()
    })

    it('should emit strength object with correct properties', async () => {
      const wrapper = createWrapper({ password: 'test123' })
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('strength-changed')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toHaveProperty('level')
      expect(emitted[0][0]).toHaveProperty('score')
      expect(emitted[0][0]).toHaveProperty('color')
      expect(emitted[0][0]).toHaveProperty('label')
    })

    it('should emit new strength when password changes', async () => {
      const wrapper = createWrapper({ password: 'weak' })
      await wrapper.vm.$nextTick()

      const initialEmitCount = wrapper.emitted('strength-changed').length

      await wrapper.setProps({ password: 'StrongP@ssw0rd!' })
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('strength-changed').length).toBeGreaterThan(initialEmitCount)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single character password', () => {
      const wrapper = createWrapper({ password: 'a' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
      expect(wrapper.html()).toContain('Weak')
    })

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(100) + 'b1!'
      const wrapper = createWrapper({ password: longPassword })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    })

    it('should handle password with only numbers', () => {
      const wrapper = createWrapper({ password: '123456789012' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    })

    it('should handle password with only special characters', () => {
      const wrapper = createWrapper({ password: '!@#$%^&*()_+' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    })

    it('should handle password with unicode characters', () => {
      const wrapper = createWrapper({ password: 'P@ssw0rd™️🔒' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    })

    it('should update when password is cleared', async () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)

      await wrapper.setProps({ password: '' })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.password-strength-indicator').exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have tabindex="-1" on container', () => {
      const wrapper = createWrapper({ password: 'test' })
      const container = wrapper.find('.password-strength-indicator')
      expect(container.attributes('tabindex')).toBe('-1')
    })

    it('should have tabindex="-1" on progress bar', () => {
      const wrapper = createWrapper({ password: 'test' })
      const progressBar = wrapper.findComponent({ name: 'VProgressLinear' })
      expect(progressBar.attributes('tabindex')).toBe('-1')
    })

    it('should use color-coded visual feedback', () => {
      const wrapper = createWrapper({ password: 'weak' })
      const chip = wrapper.findComponent({ name: 'VChip' })
      // Should have a color prop
      expect(chip.props('color')).toBeTruthy()
    })

    it('should use icons for requirement status', () => {
      const wrapper = createWrapper({ password: 'test' })
      const icons = wrapper.findAllComponents({ name: 'VIcon' })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Component Props Validation', () => {
    it('should accept password as string', () => {
      const wrapper = createWrapper({ password: 'test123' })
      expect(wrapper.props('password')).toBe('test123')
    })

    it('should accept showRequirements as boolean', () => {
      const wrapper = createWrapper({
        password: 'test',
        showRequirements: false
      })
      expect(wrapper.props('showRequirements')).toBe(false)
    })

    it('should accept showFeedback as boolean', () => {
      const wrapper = createWrapper({
        password: 'test',
        showFeedback: false
      })
      expect(wrapper.props('showFeedback')).toBe(false)
    })

    it('should accept showScore as boolean', () => {
      const wrapper = createWrapper({
        password: 'test',
        showScore: true
      })
      expect(wrapper.props('showScore')).toBe(true)
    })
  })
})
