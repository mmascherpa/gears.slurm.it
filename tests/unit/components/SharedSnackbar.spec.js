import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SharedSnackbar from '@/components/SharedSnackbar.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('SharedSnackbar.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(SharedSnackbar, {
      props: {
        modelValue: true,
        text: 'Test message',
        ...props,
      },
      global: {
        plugins: [vuetify],
      },
    })
  }

  describe('Basic Rendering', () => {
    it('should render the component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render Vuetify snackbar', () => {
      const wrapper = createWrapper()
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.exists()).toBe(true)
    })

    it('should display text message', () => {
      const wrapper = createWrapper({
        text: 'Success! File encrypted.'
      })
      expect(wrapper.props('text')).toBe('Success! File encrypted.')
    })

    it('should render when modelValue is true', () => {
      const wrapper = createWrapper({
        modelValue: true
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(true)
    })

    it('should not render when modelValue is false', () => {
      const wrapper = createWrapper({
        modelValue: false
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(false)
    })
  })

  describe('Color Variants', () => {
    it('should use default success color', () => {
      const wrapper = createWrapper()
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('success')
    })

    it('should apply error color', () => {
      const wrapper = createWrapper({
        color: 'error'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('error')
    })

    it('should apply warning color', () => {
      const wrapper = createWrapper({
        color: 'warning'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('warning')
    })

    it('should apply info color', () => {
      const wrapper = createWrapper({
        color: 'info'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('info')
    })

    it('should apply success color', () => {
      const wrapper = createWrapper({
        color: 'success'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('success')
    })
  })

  describe('Timeout', () => {
    it('should use default timeout of 3000ms', () => {
      const wrapper = createWrapper()
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(3000)
    })

    it('should apply custom timeout', () => {
      const wrapper = createWrapper({
        timeout: 5000
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(5000)
    })

    it('should handle short timeout', () => {
      const wrapper = createWrapper({
        timeout: 1000
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(1000)
    })

    it('should handle long timeout', () => {
      const wrapper = createWrapper({
        timeout: 10000
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(10000)
    })

    it('should handle -1 timeout (no auto-hide)', () => {
      const wrapper = createWrapper({
        timeout: -1
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(-1)
    })
  })

  describe('Location', () => {
    it('should use default top location', () => {
      const wrapper = createWrapper()
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('top')
    })

    it('should apply bottom location', () => {
      const wrapper = createWrapper({
        location: 'bottom'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('bottom')
    })

    it('should apply left location', () => {
      const wrapper = createWrapper({
        location: 'left'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('left')
    })

    it('should apply right location', () => {
      const wrapper = createWrapper({
        location: 'right'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('right')
    })

    it('should apply center location', () => {
      const wrapper = createWrapper({
        location: 'center'
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('center')
    })
  })

  describe('Text Content', () => {
    it('should display short message', () => {
      const wrapper = createWrapper({
        text: 'Done!'
      })
      expect(wrapper.props('text')).toBe('Done!')
    })

    it('should display long message', () => {
      const longMessage = 'This is a very long message that provides detailed feedback about what just happened in the application.'
      const wrapper = createWrapper({
        text: longMessage
      })
      expect(wrapper.props('text')).toBe(longMessage)
    })

    it('should display success message', () => {
      const wrapper = createWrapper({
        text: 'File successfully encrypted!',
        color: 'success'
      })
      expect(wrapper.props('text')).toBe('File successfully encrypted!')
    })

    it('should display error message', () => {
      const wrapper = createWrapper({
        text: 'Failed to decrypt file. Wrong password.',
        color: 'error'
      })
      expect(wrapper.props('text')).toBe('Failed to decrypt file. Wrong password.')
    })

    it('should display warning message', () => {
      const wrapper = createWrapper({
        text: 'Large file size may take a while to process.',
        color: 'warning'
      })
      expect(wrapper.props('text')).toBe('Large file size may take a while to process.')
    })

    it('should display info message', () => {
      const wrapper = createWrapper({
        text: 'Processing your file...',
        color: 'info'
      })
      expect(wrapper.props('text')).toBe('Processing your file...')
    })

    it('should handle special characters in text', () => {
      const wrapper = createWrapper({
        text: 'File "test.txt" encrypted with key <12345>'
      })
      expect(wrapper.props('text')).toBe('File "test.txt" encrypted with key <12345>')
    })

    it('should handle unicode characters in text', () => {
      const wrapper = createWrapper({
        text: 'Success! 🎉 File encrypted 🔒'
      })
      expect(wrapper.props('text')).toBe('Success! 🎉 File encrypted 🔒')
    })
  })

  describe('Event Emissions', () => {
    it('should emit update:modelValue when snackbar is closed', async () => {
      const wrapper = createWrapper({
        modelValue: true
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })

      await snackbar.vm.$emit('update:modelValue', false)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
    })

    it('should emit update:modelValue when snackbar is opened', async () => {
      const wrapper = createWrapper({
        modelValue: false
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })

      await snackbar.vm.$emit('update:modelValue', true)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true)
    })
  })

  describe('Component Props Validation', () => {
    it('should accept all required props', () => {
      const wrapper = createWrapper({
        modelValue: true,
        text: 'Test message',
        color: 'error',
        timeout: 4000,
        location: 'bottom'
      })

      expect(wrapper.props('modelValue')).toBe(true)
      expect(wrapper.props('text')).toBe('Test message')
      expect(wrapper.props('color')).toBe('error')
      expect(wrapper.props('timeout')).toBe(4000)
      expect(wrapper.props('location')).toBe('bottom')
    })

    it('should accept minimal required props', () => {
      const wrapper = mount(SharedSnackbar, {
        props: {
          modelValue: true,
          text: 'Message'
        },
        global: {
          plugins: [vuetify],
        },
      })

      expect(wrapper.props('modelValue')).toBe(true)
      expect(wrapper.props('text')).toBe('Message')
      expect(wrapper.props('color')).toBe('success')
      expect(wrapper.props('timeout')).toBe(3000)
      expect(wrapper.props('location')).toBe('top')
    })
  })

  describe('Different Use Cases', () => {
    it('should display successful encryption notification', () => {
      const wrapper = createWrapper({
        text: 'File successfully encrypted!',
        color: 'success',
        timeout: 3000
      })

      expect(wrapper.props('text')).toBe('File successfully encrypted!')
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('success')
    })

    it('should display decryption error notification', () => {
      const wrapper = createWrapper({
        text: 'Failed to decrypt. Wrong password.',
        color: 'error',
        timeout: 5000
      })

      expect(wrapper.props('text')).toBe('Failed to decrypt. Wrong password.')
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('error')
    })

    it('should display copy to clipboard success', () => {
      const wrapper = createWrapper({
        text: 'Copied to clipboard!',
        color: 'success',
        timeout: 2000
      })

      expect(wrapper.props('text')).toBe('Copied to clipboard!')
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(2000)
    })

    it('should display file size warning', () => {
      const wrapper = createWrapper({
        text: 'File is large (60MB). Processing may take some time.',
        color: 'warning',
        location: 'bottom'
      })

      expect(wrapper.props('text')).toBe('File is large (60MB). Processing may take some time.')
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('warning')
      expect(snackbar.props('location')).toBe('bottom')
    })

    it('should display processing info', () => {
      const wrapper = createWrapper({
        text: 'Encrypting file... Please wait.',
        color: 'info',
        timeout: -1
      })

      expect(wrapper.props('text')).toBe('Encrypting file... Please wait.')
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('info')
      expect(snackbar.props('timeout')).toBe(-1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', () => {
      const wrapper = createWrapper({
        text: ''
      })
      expect(wrapper.props('text')).toBe('')
    })

    it('should handle very long text', () => {
      const veryLongText = 'A'.repeat(500)
      const wrapper = createWrapper({
        text: veryLongText
      })
      expect(wrapper.props('text')).toBe(veryLongText)
    })

    it('should handle text with line breaks', () => {
      const wrapper = createWrapper({
        text: 'Line 1\nLine 2\nLine 3'
      })
      expect(wrapper.props('text')).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should handle zero timeout', () => {
      const wrapper = createWrapper({
        timeout: 0
      })
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('timeout')).toBe(0)
    })
  })

  describe('Reactivity', () => {
    it('should update text when prop changes', async () => {
      const wrapper = createWrapper({
        text: 'Original message'
      })
      expect(wrapper.props('text')).toBe('Original message')

      await wrapper.setProps({ text: 'Updated message' })
      expect(wrapper.props('text')).toBe('Updated message')
    })

    it('should update color when prop changes', async () => {
      const wrapper = createWrapper({
        color: 'success'
      })
      let snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('success')

      await wrapper.setProps({ color: 'error' })
      snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('color')).toBe('error')
    })

    it('should update modelValue when prop changes', async () => {
      const wrapper = createWrapper({
        modelValue: false
      })
      let snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(false)

      await wrapper.setProps({ modelValue: true })
      snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(true)
    })
  })
})
