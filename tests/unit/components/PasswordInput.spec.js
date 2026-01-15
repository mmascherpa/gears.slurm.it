import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordInput from '@/components/PasswordInput.vue'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('PasswordInput.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(PasswordInput, {
      props: {
        password: '',
        passwordConfirm: '',
        ...props,
      },
      global: {
        plugins: [vuetify],
        components: {
          PasswordStrengthIndicator,
        },
      },
    })
  }

  describe('Basic Rendering', () => {
    it('should render password input field', () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input[type="password"]')
      expect(passwordField.exists()).toBe(true)
    })

    it('should render with default label "Password"', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('Password')
    })

    it('should render with custom password label', () => {
      const wrapper = createWrapper({
        passwordLabel: 'Enter Secret Key',
      })
      expect(wrapper.html()).toContain('Enter Secret Key')
    })

    it('should render with default lock icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('mdi-lock')
    })

    it('should render with custom password icon', () => {
      const wrapper = createWrapper({
        passwordIcon: 'mdi-key',
      })
      expect(wrapper.html()).toContain('mdi-key')
    })

    it('should not render confirmation field by default', () => {
      const wrapper = createWrapper()
      const confirmFields = wrapper.findAll('input')
      expect(confirmFields.length).toBe(1)
    })

    it('should render confirmation field when requireConfirmation is true', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBe(2)
      expect(wrapper.html()).toContain('Confirm Password')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should show password as hidden by default', () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('type')).toBe('password')
    })

    it('should toggle password visibility when eye icon is clicked', async () => {
      const wrapper = createWrapper()

      // Initially hidden
      let passwordField = wrapper.find('input')
      expect(passwordField.attributes('type')).toBe('password')
      expect(wrapper.html()).toContain('mdi-eye')

      // Toggle visibility via component method
      wrapper.vm.showPassword = true
      await wrapper.vm.$nextTick()

      // Should now be visible
      passwordField = wrapper.find('input')
      expect(passwordField.attributes('type')).toBe('text')
      expect(wrapper.html()).toContain('mdi-eye-off')
    })

    it('should toggle confirmation password visibility independently', async () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })

      const inputs = wrapper.findAll('input')

      // Initially both hidden
      expect(inputs[0].attributes('type')).toBe('password')
      expect(inputs[1].attributes('type')).toBe('password')

      // Toggle first password
      wrapper.vm.showPassword = true
      await wrapper.vm.$nextTick()

      // Only first password should be visible
      let updatedInputs = wrapper.findAll('input')
      expect(updatedInputs[0].attributes('type')).toBe('text')
      expect(updatedInputs[1].attributes('type')).toBe('password')

      // Toggle second password
      wrapper.vm.showPasswordConfirm = true
      await wrapper.vm.$nextTick()

      // Both should be visible
      const finalInputs = wrapper.findAll('input')
      expect(finalInputs[0].attributes('type')).toBe('text')
      expect(finalInputs[1].attributes('type')).toBe('text')
    })
  })

  describe('Password Input Handling', () => {
    it('should emit update:password when password is typed', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')

      await passwordField.setValue('test123')

      expect(wrapper.emitted('update:password')).toBeTruthy()
      expect(wrapper.emitted('update:password')[0]).toEqual(['test123'])
    })

    it('should emit update:password-confirm when confirmation is typed', async () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      const inputs = wrapper.findAll('input')
      const confirmField = inputs[1]

      await confirmField.setValue('test123')

      expect(wrapper.emitted('update:password-confirm')).toBeTruthy()
      expect(wrapper.emitted('update:password-confirm')[0]).toEqual(['test123'])
    })

    it('should have maxlength of 1024 characters', () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('maxlength')).toBe('1024')
    })
  })

  describe('Validation State', () => {
    it('should emit is-valid as false when password is empty', async () => {
      const wrapper = createWrapper({ password: 'test' })
      const passwordField = wrapper.find('input')

      // Type something first, then clear it
      await passwordField.setValue('')

      expect(wrapper.emitted('is-valid')).toBeTruthy()
      const lastEmit = wrapper.emitted('is-valid')[wrapper.emitted('is-valid').length - 1]
      expect(lastEmit).toEqual([false])
    })

    it('should emit is-valid as true when password is not empty', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')

      await passwordField.setValue('password123')

      expect(wrapper.emitted('is-valid')).toBeTruthy()
      expect(wrapper.emitted('is-valid')[0]).toEqual([true])
    })

    it('should emit is-valid as false when passwords do not match', async () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'password123',
      })
      const inputs = wrapper.findAll('input')

      await inputs[1].setValue('different')

      expect(wrapper.emitted('is-valid')).toBeTruthy()
      const lastEmit = wrapper.emitted('is-valid')[wrapper.emitted('is-valid').length - 1]
      expect(lastEmit).toEqual([false])
    })

    it('should emit is-valid as true when passwords match', async () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'password123',
      })
      const inputs = wrapper.findAll('input')

      await inputs[1].setValue('password123')

      expect(wrapper.emitted('is-valid')).toBeTruthy()
      const lastEmit = wrapper.emitted('is-valid')[wrapper.emitted('is-valid').length - 1]
      expect(lastEmit).toEqual([true])
    })

    it('should not show error on confirmation field when empty', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'test',
        passwordConfirm: '',
      })

      expect(wrapper.vm.showConfirmError).toBe(false)
    })

    it('should show error on confirmation field when mismatch', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'password123',
        passwordConfirm: 'different',
      })

      expect(wrapper.vm.showConfirmError).toBe(true)
    })

    it('should show success state when passwords match', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'password123',
        passwordConfirm: 'password123',
      })

      expect(wrapper.vm.isPasswordConfirmed).toBe(true)
    })
  })

  describe('Password Strength Indicator', () => {
    it('should render PasswordStrengthIndicator by default', () => {
      const wrapper = createWrapper()
      const strengthIndicator = wrapper.findComponent(PasswordStrengthIndicator)
      expect(strengthIndicator.exists()).toBe(true)
    })

    it('should not render PasswordStrengthIndicator when showStrength is false', () => {
      const wrapper = createWrapper({
        showStrength: false,
      })
      const strengthIndicator = wrapper.findComponent(PasswordStrengthIndicator)
      expect(strengthIndicator.exists()).toBe(false)
    })

    it('should pass password prop to PasswordStrengthIndicator', () => {
      const wrapper = createWrapper({
        password: 'test123',
      })
      const strengthIndicator = wrapper.findComponent(PasswordStrengthIndicator)
      expect(strengthIndicator.props('password')).toBe('test123')
    })

    it('should pass showRequirements prop to PasswordStrengthIndicator based on focus state', async () => {
      const wrapper = createWrapper({
        showRequirements: true,
        password: 'test', // Need password for indicator to render
      })
      const strengthIndicator = wrapper.findComponent(PasswordStrengthIndicator)

      // Initially false because password field is not focused (showRequirementsComputed)
      expect(strengthIndicator.props('showRequirements')).toBe(false)

      // Simulate focus on password field container
      wrapper.vm.handlePasswordFocus()
      await wrapper.vm.$nextTick()

      // Should now be true because field is focused and showRequirements prop is true
      expect(strengthIndicator.props('showRequirements')).toBe(true)
    })

    it('should pass showFeedback prop to PasswordStrengthIndicator', () => {
      const wrapper = createWrapper({
        showFeedback: true,
      })
      const strengthIndicator = wrapper.findComponent(PasswordStrengthIndicator)
      expect(strengthIndicator.props('showFeedback')).toBe(true)
    })
  })

  describe('Autocomplete Attribute', () => {
    it('should use "new-password" autocomplete by default', () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('autocomplete')).toBe('new-password')
    })

    it('should accept "current-password" autocomplete', () => {
      const wrapper = createWrapper({
        autocomplete: 'current-password',
      })
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('autocomplete')).toBe('current-password')
    })

    it('should apply autocomplete to both password and confirmation fields', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        autocomplete: 'new-password',
      })
      const inputs = wrapper.findAll('input')
      expect(inputs[0].attributes('autocomplete')).toBe('new-password')
      expect(inputs[1].attributes('autocomplete')).toBe('new-password')
    })
  })

  describe('Placeholder Text', () => {
    it('should render default password placeholder', () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('placeholder')).toBe('Enter encryption password')
    })

    it('should render custom password placeholder', () => {
      const wrapper = createWrapper({
        passwordPlaceholder: 'Type your secret key',
      })
      const passwordField = wrapper.find('input')
      expect(passwordField.attributes('placeholder')).toBe('Type your secret key')
    })

    it('should render default confirmation placeholder', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      const inputs = wrapper.findAll('input')
      expect(inputs[1].attributes('placeholder')).toBe('Confirm encryption password')
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only passwords as invalid', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')

      await passwordField.setValue('   ')

      const lastEmit = wrapper.emitted('is-valid')[wrapper.emitted('is-valid').length - 1]
      expect(lastEmit).toEqual([false])
    })

    it('should trim password for validation but preserve actual value', async () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      const inputs = wrapper.findAll('input')

      await inputs[0].setValue(' test ')
      await inputs[1].setValue(' test ')

      // Should emit the actual value with spaces
      expect(wrapper.emitted('update:password')[0]).toEqual([' test '])
      expect(wrapper.emitted('update:password-confirm')[0]).toEqual([' test '])
    })

    it('should handle rapid password changes', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')

      await passwordField.setValue('a')
      await passwordField.setValue('ab')
      await passwordField.setValue('abc')
      await passwordField.setValue('abcd')

      // Should have emitted 4 update events
      expect(wrapper.emitted('update:password').length).toBe(4)
      expect(wrapper.emitted('is-valid').length).toBe(4)
    })

    it('should handle very long passwords (up to maxlength)', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('input')
      const longPassword = 'a'.repeat(1024)

      await passwordField.setValue(longPassword)

      expect(wrapper.emitted('update:password')[0]).toEqual([longPassword])
    })

    it('should validate confirmation matches with leading/trailing spaces', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
        password: 'test',
        passwordConfirm: ' test ',
      })

      // Should not match because confirmation has spaces
      expect(wrapper.vm.isPasswordConfirmed).toBe(false)
      expect(wrapper.vm.showConfirmError).toBe(true)
    })
  })

  describe('Responsive Layout', () => {
    it('should render single input when no confirmation required', () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBe(1)
    })

    it('should render two inputs when confirmation required', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBe(2)
    })
  })

  describe('Accessibility', () => {
    it('should have tabindex="-1" on strength indicator container', () => {
      const wrapper = createWrapper()
      const strengthContainer = wrapper.find('[tabindex="-1"]')
      expect(strengthContainer.exists()).toBe(true)
    })

    it('should render prepend-inner icons for visual affordance', () => {
      const wrapper = createWrapper({
        requireConfirmation: true,
      })
      expect(wrapper.html()).toContain('mdi-lock')
      expect(wrapper.html()).toContain('mdi-lock-check')
    })
  })
})
