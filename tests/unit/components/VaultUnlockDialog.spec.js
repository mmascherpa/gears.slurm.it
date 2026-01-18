/**
 * Tests for VaultUnlockDialog.vue component
 *
 * Note: This component uses v-dialog which teleports content outside the component tree.
 * Tests focus on verifying props and emits rather than rendered content.
 * Visual/integration testing should be done with E2E tests.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VaultUnlockDialog from '@/components/VaultUnlockDialog.vue';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

describe('VaultUnlockDialog.vue', () => {
  let vuetify;

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives
    });

    // Setup WebAuthn mock
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true)
      },
      writable: true,
      configurable: true
    });
  });

  const createWrapper = (props = {}) => {
    return mount(VaultUnlockDialog, {
      props: {
        modelValue: true,
        ...props
      },
      global: {
        plugins: [vuetify],
        components: {
          PasswordStrengthIndicator
        }
      }
    });
  };

  describe('props', () => {
    it('accepts modelValue prop', () => {
      const wrapper = createWrapper({ modelValue: true });
      expect(wrapper.props('modelValue')).toBe(true);
    });

    it('accepts isNewVault prop with default false', () => {
      const wrapper = createWrapper();
      expect(wrapper.props('isNewVault')).toBe(false);
    });

    it('accepts isNewVault prop as true', () => {
      const wrapper = createWrapper({ isNewVault: true });
      expect(wrapper.props('isNewVault')).toBe(true);
    });

    it('accepts hasWebAuthn prop with default false', () => {
      const wrapper = createWrapper();
      expect(wrapper.props('hasWebAuthn')).toBe(false);
    });

    it('accepts hasWebAuthn prop as true', () => {
      const wrapper = createWrapper({ hasWebAuthn: true });
      expect(wrapper.props('hasWebAuthn')).toBe(true);
    });

    it('accepts isLoading prop with default false', () => {
      const wrapper = createWrapper();
      expect(wrapper.props('isLoading')).toBe(false);
    });

    it('accepts isLoading prop as true', () => {
      const wrapper = createWrapper({ isLoading: true });
      expect(wrapper.props('isLoading')).toBe(true);
    });

    it('accepts error prop with default empty string', () => {
      const wrapper = createWrapper();
      expect(wrapper.props('error')).toBe('');
    });

    it('accepts error prop with value', () => {
      const wrapper = createWrapper({ error: 'Test error' });
      expect(wrapper.props('error')).toBe('Test error');
    });
  });

  describe('emits', () => {
    it('defines update:modelValue emit', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$options.emits).toContain('update:modelValue');
    });

    it('defines submit emit', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$options.emits).toContain('submit');
    });

    it('defines webauthn emit', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$options.emits).toContain('webauthn');
    });

    it('defines cancel emit', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$options.emits).toContain('cancel');
    });
  });

  describe('component structure', () => {
    it('mounts without error', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('mounts with new vault mode without error', () => {
      const wrapper = createWrapper({ isNewVault: true });
      expect(wrapper.exists()).toBe(true);
    });

    it('mounts with hasWebAuthn without error', () => {
      const wrapper = createWrapper({ hasWebAuthn: true });
      expect(wrapper.exists()).toBe(true);
    });

    it('mounts with all props without error', () => {
      const wrapper = createWrapper({
        isNewVault: true,
        hasWebAuthn: true,
        isLoading: true,
        error: 'Some error'
      });
      expect(wrapper.exists()).toBe(true);
    });
  });
});
