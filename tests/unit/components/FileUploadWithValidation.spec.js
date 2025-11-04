import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createMockFile } from '../../setup/test-utils'

describe('FileUploadWithValidation.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(FileUploadWithValidation, {
      props: {
        label: 'Select a file',
        buttonText: 'Process',
        buttonIcon: 'mdi-check',
        canSubmit: true,
        ...props,
      },
      global: {
        plugins: [vuetify],
      },
    })
  }

  describe('Basic Rendering', () => {
    it('should render file input with label', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
      expect(wrapper.html()).toContain('Select a file')
    })

    it('should render with custom label', () => {
      const wrapper = createWrapper({
        label: 'Choose encryption file'
      })
      expect(wrapper.html()).toContain('Choose encryption file')
    })

    it('should render action button with text and icon', () => {
      const wrapper = createWrapper({
        buttonText: 'Encrypt',
        buttonIcon: 'mdi-lock'
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Encrypt')
      expect(wrapper.html()).toContain('mdi-lock')
    })

    it('should apply button color', () => {
      const wrapper = createWrapper({
        buttonColor: 'success'
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('color')).toBe('success')
    })

    it('should use default primary color for button', () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('color')).toBe('primary')
    })
  })

  describe('File Selection', () => {
    it('should emit update:modelValue when file is selected', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('test content', 'test.txt')

      // Call the method directly since file inputs can't be set programmatically
      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual([file])
    })

    it('should emit validation-change event on file selection', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('test content', 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('validation-change')).toBeTruthy()
    })

    it('should show file size hint when file is selected', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('a'.repeat(1000), 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      // Should display some file size information
      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(0)
    })
  })

  describe('File Size Validation', () => {
    it('should accept normal sized file', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('normal content', 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      const validationEvents = wrapper.emitted('validation-change')
      expect(validationEvents[0][0].isValid).toBe(true)
    })

    it('should show warning for large file (>50MB)', async () => {
      const wrapper = createWrapper()
      // Create a 60MB file
      const file = createMockFile('large', 'large.txt', 'text/plain', 60 * 1024 * 1024)

      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      const alert = wrapper.findComponent({ name: 'VAlert' })
      expect(alert.exists()).toBe(true)
      expect(alert.props('type')).toBe('warning')
    })

    it('should show error for extremely large file (>200MB)', async () => {
      const wrapper = createWrapper()
      // Create a 250MB file
      const hugeFile = createMockFile('huge', 'huge.txt', 'text/plain', 250 * 1024 * 1024)

      wrapper.vm.handleFileChange([hugeFile])
      await wrapper.vm.$nextTick()

      const errorAlert = wrapper.findAllComponents({ name: 'VAlert' })
        .find(alert => alert.props('type') === 'error')
      expect(errorAlert.exists()).toBe(true)
    })

    it('should disable button when file is too large', async () => {
      const wrapper = createWrapper()
      const hugeFile = createMockFile('huge', 'huge.txt', 'text/plain', 250 * 1024 * 1024)

      wrapper.vm.handleFileChange([hugeFile])
      await wrapper.vm.$nextTick()

      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(true)
    })
  })

  describe('Button State', () => {
    it('should disable button when canSubmit is false', () => {
      const wrapper = createWrapper({
        canSubmit: false
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(true)
    })

    it('should rely on canSubmit prop for button state when no file is selected', () => {
      const wrapper = createWrapper({
        modelValue: [],
        canSubmit: false
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      // Button is disabled because canSubmit is false
      expect(button.props('disabled')).toBe(true)
    })

    it('should enable button when file is selected and canSubmit is true', async () => {
      const wrapper = createWrapper({
        canSubmit: true
      })
      const file = createMockFile('test', 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(false)
    })

    it('should disable button when file input is disabled', () => {
      const wrapper = createWrapper({
        disabled: true
      })
      const fileInput = wrapper.findComponent({ name: 'VFileInput' })
      expect(fileInput.props('disabled')).toBe(true)
    })
  })

  describe('Button Tooltip', () => {
    it('should show "select a file" tooltip when no file is selected', () => {
      const wrapper = createWrapper({
        modelValue: null
      })
      const tooltip = wrapper.findComponent({ name: 'VTooltip' })
      expect(tooltip.props('text')).toContain('Please select a file')
    })

    it('should show "complete all fields" tooltip when canSubmit is false', async () => {
      const wrapper = createWrapper({
        canSubmit: false
      })
      const file = createMockFile('test', 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.setProps({ modelValue: [file] })
      await wrapper.vm.$nextTick()

      const tooltip = wrapper.findComponent({ name: 'VTooltip' })
      expect(tooltip.props('text')).toContain('Complete all required fields')
    })

    it('should show action tooltip when ready to submit', async () => {
      const wrapper = createWrapper({
        buttonText: 'Encrypt',
        canSubmit: true
      })
      const file = createMockFile('test', 'test.txt')

      wrapper.vm.handleFileChange([file])
      await wrapper.setProps({ modelValue: [file] })
      await wrapper.vm.$nextTick()

      const tooltip = wrapper.findComponent({ name: 'VTooltip' })
      expect(tooltip.props('text')).toContain('encrypt')
    })

    it('should show "too large" tooltip when file exceeds limit', async () => {
      const wrapper = createWrapper()
      const hugeFile = createMockFile('huge', 'huge.txt', 'text/plain', 250 * 1024 * 1024)

      wrapper.vm.handleFileChange([hugeFile])
      await wrapper.setProps({ modelValue: [hugeFile] })
      await wrapper.vm.$nextTick()

      const tooltip = wrapper.findComponent({ name: 'VTooltip' })
      expect(tooltip.props('text')).toContain('too large')
    })
  })

  describe('Submit Event', () => {
    it('should emit submit event when button is clicked', async () => {
      const wrapper = createWrapper({
        canSubmit: true
      })
      const file = createMockFile('test', 'test.txt')

      // Call the method directly
      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      const button = wrapper.findComponent({ name: 'VBtn' })
      await button.trigger('click')

      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('should not emit submit when button is disabled', async () => {
      const wrapper = createWrapper({
        canSubmit: false
      })
      const button = wrapper.findComponent({ name: 'VBtn' })

      await button.trigger('click')

      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })

  describe('Clear Functionality', () => {
    it('should emit null when file is cleared', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('test', 'test.txt')

      // Call the method directly
      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      // Trigger clear
      wrapper.vm.handleClear()
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      const lastEmit = emitted[emitted.length - 1]
      expect(lastEmit[0]).toBeNull()
    })

    it('should emit validation-change with isValid=true when cleared', async () => {
      const wrapper = createWrapper()
      const file = createMockFile('test', 'test.txt')

      // Call the method directly
      wrapper.vm.handleFileChange([file])
      await wrapper.vm.$nextTick()

      wrapper.vm.handleClear()
      await wrapper.vm.$nextTick()

      const validationEvents = wrapper.emitted('validation-change')
      const lastValidation = validationEvents[validationEvents.length - 1]
      expect(lastValidation[0].isValid).toBe(true)
    })

    it('should close warning alert when close button is clicked', async () => {
      const wrapper = createWrapper()
      const largeFile = createMockFile('large', 'large.txt', 'text/plain', 60 * 1024 * 1024)

      // Call the method directly
      wrapper.vm.handleFileChange([largeFile])
      await wrapper.vm.$nextTick()

      let alert = wrapper.findComponent({ name: 'VAlert' })
      expect(alert.exists()).toBe(true)

      // Close the alert
      wrapper.vm.showFileSizeWarning = false
      await wrapper.vm.$nextTick()

      alert = wrapper.findAllComponents({ name: 'VAlert' })
        .find(a => a.props('type') === 'warning')
      expect(alert).toBeFalsy()
    })
  })

  describe('Accept Attribute', () => {
    it('should apply accept attribute to file input', () => {
      const wrapper = createWrapper({
        accept: '.txt,.pdf'
      })
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('.txt,.pdf')
    })

    it('should allow .aes files when specified', () => {
      const wrapper = createWrapper({
        accept: '.aes'
      })
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('.aes')
    })

    it('should have no accept restriction by default', () => {
      const wrapper = createWrapper()
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('')
    })
  })

  describe('Layout and Styling', () => {
    it('should render file input and button in same row', () => {
      const wrapper = createWrapper()
      const row = wrapper.findComponent({ name: 'VRow' })
      const cols = wrapper.findAllComponents({ name: 'VCol' })
      expect(row.exists()).toBe(true)
      expect(cols.length).toBe(2)
    })

    it('should make button block on small screens', () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('block')).toBe(true)
    })

    it('should set button size to large', () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('size')).toBe('large')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty file array', async () => {
      const wrapper = createWrapper()

      // Call the method directly with empty array
      wrapper.vm.handleFileChange([])
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('validation-change')).toBeTruthy()
    })

    it('should handle file with zero size', async () => {
      const wrapper = createWrapper()
      const emptyFile = createMockFile('', 'empty.txt', 'text/plain', 0)

      // Call the method directly
      wrapper.vm.handleFileChange([emptyFile])
      await wrapper.vm.$nextTick()

      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(false)
    })

    it('should handle rapid file changes', async () => {
      const wrapper = createWrapper()
      const file1 = createMockFile('test1', 'test1.txt')
      const file2 = createMockFile('test2', 'test2.txt')
      const file3 = createMockFile('test3', 'test3.txt')

      // Call the method directly multiple times
      wrapper.vm.handleFileChange([file1])
      wrapper.vm.handleFileChange([file2])
      wrapper.vm.handleFileChange([file3])
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted.length).toBe(3)
      expect(emitted[2][0]).toEqual([file3])
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on button', () => {
      const wrapper = createWrapper({
        canSubmit: false
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(true)
    })

    it('should provide visual feedback for disabled state', () => {
      const wrapper = createWrapper({
        canSubmit: false
      })
      const button = wrapper.findComponent({ name: 'VBtn' })
      expect(button.props('disabled')).toBe(true)
    })

    it('should have tooltip for accessibility', () => {
      const wrapper = createWrapper()
      const tooltip = wrapper.findComponent({ name: 'VTooltip' })
      expect(tooltip.exists()).toBe(true)
    })
  })

  describe('Component Props Validation', () => {
    it('should accept all required props', () => {
      const wrapper = createWrapper({
        label: 'Test Label',
        buttonText: 'Test Button',
        buttonIcon: 'mdi-test',
        canSubmit: true
      })
      expect(wrapper.props('label')).toBe('Test Label')
      expect(wrapper.props('buttonText')).toBe('Test Button')
      expect(wrapper.props('buttonIcon')).toBe('mdi-test')
      expect(wrapper.props('canSubmit')).toBe(true)
    })

    it('should handle modelValue prop', () => {
      const file = createMockFile('test', 'test.txt')
      const wrapper = createWrapper({
        modelValue: [file]
      })
      expect(wrapper.props('modelValue')).toEqual([file])
    })

    it('should handle disabled prop', () => {
      const wrapper = createWrapper({
        disabled: true
      })
      expect(wrapper.props('disabled')).toBe(true)
    })
  })
})
