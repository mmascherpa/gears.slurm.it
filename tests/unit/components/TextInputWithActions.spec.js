import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInputWithActions from '@/components/TextInputWithActions.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('TextInputWithActions.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(TextInputWithActions, {
      props: {
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

    it('should render textarea', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.exists()).toBe(true)
    })

    it('should render with default empty modelValue', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('modelValue')).toBe('')
    })

    it('should render with custom modelValue', () => {
      const wrapper = createWrapper({
        modelValue: 'Test content'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('modelValue')).toBe('Test content')
    })
  })

  describe('Textarea Props', () => {
    it('should apply label', () => {
      const wrapper = createWrapper({
        label: 'Input Text'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('label')).toBe('Input Text')
    })

    it('should apply placeholder', () => {
      const wrapper = createWrapper({
        placeholder: 'Enter text here...'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('placeholder')).toBe('Enter text here...')
    })

    it('should apply rows prop', () => {
      const wrapper = createWrapper({
        rows: 6
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('rows')).toBe(6)
    })

    it('should use default 4 rows', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('rows')).toBe(4)
    })

    it('should apply variant prop', () => {
      const wrapper = createWrapper({
        variant: 'filled'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('variant')).toBe('filled')
    })

    it('should use default outlined variant', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('variant')).toBe('outlined')
    })

    it('should apply density prop', () => {
      const wrapper = createWrapper({
        density: 'compact'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('density')).toBe('compact')
    })

    it('should apply readonly prop', () => {
      const wrapper = createWrapper({
        readonly: true
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('readonly')).toBe(true)
    })

    it('should apply disabled prop', () => {
      const wrapper = createWrapper({
        disabled: true
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('disabled')).toBe(true)
    })
  })

  describe('Button Visibility - Empty State', () => {
    it('should show paste button when empty and showPaste is true', () => {
      const wrapper = createWrapper({
        modelValue: '',
        showPaste: true
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBeGreaterThan(0)
    })

    it('should not show paste button when showPaste is false', () => {
      const wrapper = createWrapper({
        modelValue: '',
        showPaste: false
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBe(0)
    })

    it('should not show copy button when empty', () => {
      const wrapper = createWrapper({
        modelValue: ''
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBe(0)
    })

    it('should not show clear button when empty', () => {
      const wrapper = createWrapper({
        modelValue: ''
      })
      const clearButtons = wrapper.findAll('[aria-label="Clear text"]')
      expect(clearButtons.length).toBe(0)
    })

    it('should not show download button when empty', () => {
      const wrapper = createWrapper({
        modelValue: '',
        showDownload: true
      })
      const downloadButtons = wrapper.findAll('[aria-label="Download as file"]')
      expect(downloadButtons.length).toBe(0)
    })
  })

  describe('Button Visibility - With Content', () => {
    it('should not show paste button when has content', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showPaste: true
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBe(0)
    })

    it('should show copy button when has content and showCopy is true', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should not show copy button when showCopy is false', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showCopy: false
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBe(0)
    })

    it('should show clear button when has content and showClear is true', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showClear: true
      })
      const clearButtons = wrapper.findAll('[aria-label="Clear text"]')
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it('should not show clear button when showClear is false', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showClear: false
      })
      const clearButtons = wrapper.findAll('[aria-label="Clear text"]')
      expect(clearButtons.length).toBe(0)
    })

    it('should show download button when has content and showDownload is true', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showDownload: true
      })
      const downloadButtons = wrapper.findAll('[aria-label="Download as file"]')
      expect(downloadButtons.length).toBeGreaterThan(0)
    })

    it('should not show download button when showDownload is false', () => {
      const wrapper = createWrapper({
        modelValue: 'Content here',
        showDownload: false
      })
      const downloadButtons = wrapper.findAll('[aria-label="Download as file"]')
      expect(downloadButtons.length).toBe(0)
    })
  })

  describe('Loading State', () => {
    it('should show progress spinner when isLoading is true', () => {
      const wrapper = createWrapper({
        isLoading: true
      })
      const spinner = wrapper.findComponent({ name: 'VProgressCircular' })
      expect(spinner.exists()).toBe(true)
    })

    it('should not show buttons when loading', () => {
      const wrapper = createWrapper({
        isLoading: true,
        modelValue: 'Content',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBe(0)
    })

    it('should not show paste button when loading', () => {
      const wrapper = createWrapper({
        isLoading: true,
        modelValue: '',
        showPaste: true
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBe(0)
    })

    it('should show buttons when not loading', () => {
      const wrapper = createWrapper({
        isLoading: false,
        modelValue: 'Content',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should configure spinner size', () => {
      const wrapper = createWrapper({
        isLoading: true
      })
      const spinner = wrapper.findComponent({ name: 'VProgressCircular' })
      expect(spinner.props('size')).toBe(48)
    })

    it('should configure spinner width', () => {
      const wrapper = createWrapper({
        isLoading: true
      })
      const spinner = wrapper.findComponent({ name: 'VProgressCircular' })
      expect(spinner.props('width')).toBe(6)
    })

    it('should set spinner color to primary', () => {
      const wrapper = createWrapper({
        isLoading: true
      })
      const spinner = wrapper.findComponent({ name: 'VProgressCircular' })
      expect(spinner.props('color')).toBe('primary')
    })
  })

  describe('Event Emissions', () => {
    it('should emit update:modelValue when textarea changes', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.findComponent({ name: 'VTextarea' })

      await textarea.vm.$emit('update:modelValue', 'New content')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('New content')
    })

    it('should emit paste event when paste button is clicked', async () => {
      const wrapper = createWrapper({
        modelValue: '',
        showPaste: true
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')

      await pasteButtons[0].trigger('click')

      expect(wrapper.emitted('paste')).toBeTruthy()
    })

    it('should emit clear event when clear button is clicked', async () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showClear: true
      })
      const clearButtons = wrapper.findAll('[aria-label="Clear text"]')

      await clearButtons[0].trigger('click')

      expect(wrapper.emitted('clear')).toBeTruthy()
    })

    it('should emit copy event when copy button is clicked', async () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')

      await copyButtons[0].trigger('click')

      expect(wrapper.emitted('copy')).toBeTruthy()
    })

    it('should emit download event when download button is clicked', async () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showDownload: true
      })
      const downloadButtons = wrapper.findAll('[aria-label="Download as file"]')

      await downloadButtons[0].trigger('click')

      expect(wrapper.emitted('download')).toBeTruthy()
    })
  })

  describe('Tooltips', () => {
    it('should have "Paste from clipboard" tooltip on paste button', () => {
      const wrapper = createWrapper({
        modelValue: '',
        showPaste: true
      })
      const tooltips = wrapper.findAllComponents({ name: 'VTooltip' })
      const pasteTooltip = tooltips.find(t => t.props('text') === 'Paste from clipboard')
      expect(pasteTooltip).toBeTruthy()
    })

    it('should have "Clear text" tooltip on clear button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showClear: true
      })
      const tooltips = wrapper.findAllComponents({ name: 'VTooltip' })
      const clearTooltip = tooltips.find(t => t.props('text') === 'Clear text')
      expect(clearTooltip).toBeTruthy()
    })

    it('should have "Copy to clipboard" tooltip on copy button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showCopy: true
      })
      const tooltips = wrapper.findAllComponents({ name: 'VTooltip' })
      const copyTooltip = tooltips.find(t => t.props('text') === 'Copy to clipboard')
      expect(copyTooltip).toBeTruthy()
    })

    it('should have "Download as file" tooltip on download button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showDownload: true
      })
      const tooltips = wrapper.findAllComponents({ name: 'VTooltip' })
      const downloadTooltip = tooltips.find(t => t.props('text') === 'Download as file')
      expect(downloadTooltip).toBeTruthy()
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom textarea class', () => {
      const wrapper = createWrapper({
        textareaClass: 'custom-textarea'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('class')).toContain('custom-textarea')
    })

    it('should apply custom row class', () => {
      const wrapper = createWrapper({
        rowClass: 'custom-row'
      })
      const row = wrapper.findComponent({ name: 'VRow' })
      expect(row.props('class')).toContain('custom-row')
    })

    it('should apply custom button column class', () => {
      const wrapper = createWrapper({
        buttonColumnClass: 'custom-buttons'
      })
      const buttonCol = wrapper.find('.button-column')
      expect(buttonCol.classes()).toContain('custom-buttons')
    })

    it('should apply custom copy button class', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showCopy: true,
        copyButtonClass: 'custom-copy'
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons[0].classes()).toContain('custom-copy')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on paste button', () => {
      const wrapper = createWrapper({
        modelValue: '',
        showPaste: true
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBeGreaterThan(0)
    })

    it('should have aria-label on clear button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showClear: true
      })
      const clearButtons = wrapper.findAll('[aria-label="Clear text"]')
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it('should have aria-label on copy button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should have aria-label on download button', () => {
      const wrapper = createWrapper({
        modelValue: 'Content',
        showDownload: true
      })
      const downloadButtons = wrapper.findAll('[aria-label="Download as file"]')
      expect(downloadButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should use v-row with no-gutters', () => {
      const wrapper = createWrapper()
      const row = wrapper.findComponent({ name: 'VRow' })
      expect(row.props('noGutters')).toBe(true)
    })

    it('should have flex-grow-1 on textarea column', () => {
      const wrapper = createWrapper()
      const textareaCol = wrapper.findAll('[class*="flex-grow-1"]')
      expect(textareaCol.length).toBeGreaterThan(0)
    })

    it('should have button column with auto width', () => {
      const wrapper = createWrapper()
      const buttonCols = wrapper.findAll('.button-column')
      expect(buttonCols.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text content', () => {
      const longText = 'a'.repeat(10000)
      const wrapper = createWrapper({
        modelValue: longText
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('modelValue')).toBe(longText)
    })

    it('should handle empty string vs null', () => {
      const wrapper = createWrapper({
        modelValue: ''
      })
      const pasteButtons = wrapper.findAll('[aria-label="Paste from clipboard"]')
      expect(pasteButtons.length).toBeGreaterThan(0)
    })

    it('should handle whitespace-only content as content', () => {
      const wrapper = createWrapper({
        modelValue: '   ',
        showCopy: true
      })
      const copyButtons = wrapper.findAll('[aria-label="Copy to clipboard"]')
      // Whitespace is truthy, so copy button should show
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should handle special characters in content', () => {
      const wrapper = createWrapper({
        modelValue: '<script>alert("test")</script>'
      })
      const textarea = wrapper.findComponent({ name: 'VTextarea' })
      expect(textarea.props('modelValue')).toBe('<script>alert("test")</script>')
    })
  })

  describe('Slots', () => {
    it('should support actions slot for custom buttons', () => {
      const wrapper = mount(TextInputWithActions, {
        props: {
          modelValue: 'Content'
        },
        slots: {
          actions: '<button class="custom-action">Custom</button>'
        },
        global: {
          plugins: [vuetify],
        },
      })
      const customButton = wrapper.find('.custom-action')
      expect(customButton.exists()).toBe(true)
    })
  })
})
