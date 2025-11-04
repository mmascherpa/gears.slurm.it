import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolPageHeader from '@/components/ToolPageHeader.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('ToolPageHeader.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    })
  })

  const createWrapper = (props = {}) => {
    return mount(ToolPageHeader, {
      props: {
        icon: 'mdi-lock',
        title: 'AES Encryption',
        description: 'Secure your files with password-protected AES encryption',
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

    it('should render avatar with icon', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.findComponent({ name: 'VAvatar' })
      const icon = wrapper.findComponent({ name: 'VIcon' })

      expect(avatar.exists()).toBe(true)
      expect(icon.exists()).toBe(true)
    })

    it('should render title as h1', () => {
      const wrapper = createWrapper()
      const h1 = wrapper.find('h1')

      expect(h1.exists()).toBe(true)
      expect(h1.text()).toBe('AES Encryption')
    })

    it('should render description', () => {
      const wrapper = createWrapper()
      const description = wrapper.find('p')

      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('Secure your files with password-protected AES encryption')
    })
  })

  describe('Icon Props', () => {
    it('should display specified icon', () => {
      const wrapper = createWrapper({
        icon: 'mdi-file-document'
      })
      const icon = wrapper.findComponent({ name: 'VIcon' })

      expect(icon.props('icon')).toBe('mdi-file-document')
    })

    it('should handle different icon types', () => {
      const wrapper = createWrapper({
        icon: 'mdi-lock-outline'
      })
      const icon = wrapper.findComponent({ name: 'VIcon' })

      expect(icon.props('icon')).toBe('mdi-lock-outline')
    })

    it('should set icon size to 28', () => {
      const wrapper = createWrapper()
      const icon = wrapper.findComponent({ name: 'VIcon' })

      expect(icon.props('size')).toBe('28')
    })

    it('should set icon color to white', () => {
      const wrapper = createWrapper()
      const icon = wrapper.findComponent({ name: 'VIcon' })

      expect(icon.props('color')).toBe('white')
    })
  })

  describe('Avatar Props', () => {
    it('should use default primary color for avatar', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.findComponent({ name: 'VAvatar' })

      expect(avatar.props('color')).toBe('primary')
    })

    it('should apply custom avatar color', () => {
      const wrapper = createWrapper({
        avatarColor: 'success'
      })
      const avatar = wrapper.findComponent({ name: 'VAvatar' })

      expect(avatar.props('color')).toBe('success')
    })

    it('should accept secondary color', () => {
      const wrapper = createWrapper({
        avatarColor: 'secondary'
      })
      const avatar = wrapper.findComponent({ name: 'VAvatar' })

      expect(avatar.props('color')).toBe('secondary')
    })

    it('should accept error color', () => {
      const wrapper = createWrapper({
        avatarColor: 'error'
      })
      const avatar = wrapper.findComponent({ name: 'VAvatar' })

      expect(avatar.props('color')).toBe('error')
    })

    it('should set avatar size to 48', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.findComponent({ name: 'VAvatar' })

      expect(avatar.props('size')).toBe('48')
    })
  })

  describe('Title and Description', () => {
    it('should display custom title', () => {
      const wrapper = createWrapper({
        title: 'Base64 Encoding'
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe('Base64 Encoding')
    })

    it('should display custom description', () => {
      const wrapper = createWrapper({
        description: 'Encode text or files to Base64 format'
      })
      const p = wrapper.find('p')

      expect(p.text()).toBe('Encode text or files to Base64 format')
    })

    it('should handle long titles', () => {
      const longTitle = 'This is a Very Long Title That Should Still Render Correctly'
      const wrapper = createWrapper({
        title: longTitle
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe(longTitle)
    })

    it('should handle long descriptions', () => {
      const longDesc = 'This is a very long description that provides detailed information about the tool and its capabilities. It should wrap properly and display all content without truncation.'
      const wrapper = createWrapper({
        description: longDesc
      })
      const p = wrapper.find('p')

      expect(p.text()).toBe(longDesc)
    })

    it('should handle special characters in title', () => {
      const wrapper = createWrapper({
        title: 'AES-256 Encryption & Decryption'
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe('AES-256 Encryption & Decryption')
    })

    it('should handle special characters in description', () => {
      const wrapper = createWrapper({
        description: 'Encrypt/decrypt files with <strong> security & privacy'
      })
      const p = wrapper.find('p')

      expect(p.text()).toBe('Encrypt/decrypt files with <strong> security & privacy')
    })
  })

  describe('Layout and Styling', () => {
    it('should use flexbox layout', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.d-flex')

      expect(container.exists()).toBe(true)
    })

    it('should have align-center class', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.align-center')

      expect(container.exists()).toBe(true)
    })

    it('should have bottom margin', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.mb-6')

      expect(container.exists()).toBe(true)
    })

    it('should have proper typography classes on title', () => {
      const wrapper = createWrapper()
      const h1 = wrapper.find('h1')

      expect(h1.classes()).toContain('text-h4')
      expect(h1.classes()).toContain('font-weight-bold')
    })

    it('should have proper typography classes on description', () => {
      const wrapper = createWrapper()
      const p = wrapper.find('p')

      expect(p.classes()).toContain('text-body-2')
      expect(p.classes()).toContain('text-medium-emphasis')
    })

    it('should have no bottom margin on description', () => {
      const wrapper = createWrapper()
      const p = wrapper.find('p')

      expect(p.classes()).toContain('mb-0')
    })
  })

  describe('Component Props Validation', () => {
    it('should accept all required props', () => {
      const wrapper = createWrapper({
        icon: 'mdi-test',
        title: 'Test Title',
        description: 'Test Description',
        avatarColor: 'warning'
      })

      expect(wrapper.props('icon')).toBe('mdi-test')
      expect(wrapper.props('title')).toBe('Test Title')
      expect(wrapper.props('description')).toBe('Test Description')
      expect(wrapper.props('avatarColor')).toBe('warning')
    })

    it('should accept minimal required props', () => {
      const wrapper = mount(ToolPageHeader, {
        props: {
          icon: 'mdi-home',
          title: 'Home',
          description: 'Welcome'
        },
        global: {
          plugins: [vuetify],
        },
      })

      expect(wrapper.props('icon')).toBe('mdi-home')
      expect(wrapper.props('title')).toBe('Home')
      expect(wrapper.props('description')).toBe('Welcome')
      expect(wrapper.props('avatarColor')).toBe('primary')
    })
  })

  describe('Different Tool Configurations', () => {
    it('should render Base64 Encoding header', () => {
      const wrapper = createWrapper({
        icon: 'mdi-file-document-outline',
        title: 'Base64 Encoding',
        description: 'Encode text or files to Base64 format',
        avatarColor: 'primary'
      })

      expect(wrapper.find('h1').text()).toBe('Base64 Encoding')
      expect(wrapper.findComponent({ name: 'VIcon' }).props('icon')).toBe('mdi-file-document-outline')
    })

    it('should render AES Encryption header', () => {
      const wrapper = createWrapper({
        icon: 'mdi-lock',
        title: 'AES Encryption',
        description: 'Secure your files with password-protected AES encryption',
        avatarColor: 'success'
      })

      expect(wrapper.find('h1').text()).toBe('AES Encryption')
      expect(wrapper.findComponent({ name: 'VAvatar' }).props('color')).toBe('success')
    })

    it('should render AES Decryption header', () => {
      const wrapper = createWrapper({
        icon: 'mdi-lock-open',
        title: 'AES Decryption',
        description: 'Decrypt password-protected AES files',
        avatarColor: 'warning'
      })

      expect(wrapper.find('h1').text()).toBe('AES Decryption')
      expect(wrapper.findComponent({ name: 'VIcon' }).props('icon')).toBe('mdi-lock-open')
    })

    it('should render Password Generator header', () => {
      const wrapper = createWrapper({
        icon: 'mdi-key',
        title: 'Password Generator',
        description: 'Generate secure random passwords',
        avatarColor: 'info'
      })

      expect(wrapper.find('h1').text()).toBe('Password Generator')
      expect(wrapper.findComponent({ name: 'VAvatar' }).props('color')).toBe('info')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      const wrapper = createWrapper({
        title: ''
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe('')
    })

    it('should handle empty string description', () => {
      const wrapper = createWrapper({
        description: ''
      })
      const p = wrapper.find('p')

      expect(p.text()).toBe('')
    })

    it('should handle very short title', () => {
      const wrapper = createWrapper({
        title: 'X'
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe('X')
    })

    it('should handle unicode characters in title', () => {
      const wrapper = createWrapper({
        title: 'Encryption 🔒'
      })
      const h1 = wrapper.find('h1')

      expect(h1.text()).toBe('Encryption 🔒')
    })

    it('should handle HTML entities in description', () => {
      const wrapper = createWrapper({
        description: 'Encrypt & decrypt files with security > privacy'
      })
      const p = wrapper.find('p')

      expect(p.text()).toContain('&')
      expect(p.text()).toContain('>')
    })
  })
})
