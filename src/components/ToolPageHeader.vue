<template>
  <div class="d-flex align-center mb-6" data-testid="page-title">
    <v-avatar :color="avatarColor" size="48" class="mr-4">
      <v-icon :icon="icon" size="28" color="white"></v-icon>
    </v-avatar>
    <div>
      <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
      <p class="text-body-2 text-medium-emphasis mb-0">{{ description }}</p>
    </div>
  </div>
</template>

<script>
/**
 * ToolPageHeader Component
 *
 * Standardized header for all tool pages, displaying an icon, title,
 * and description in a consistent layout.
 *
 * Used across all tool components (Base64Enc, Base64Dec, AESEnc, etc.)
 * to ensure visual consistency.
 *
 * @component
 * @example
 * <ToolPageHeader
 *   icon="mdi-lock"
 *   title="AES Encryption"
 *   description="Secure your files with password-protected AES encryption"
 *   avatar-color="primary"
 * />
 */
export default {
  name: 'ToolPageHeader',
  props: {
    /**
     * Material Design Icon name (e.g., 'mdi-lock', 'mdi-file')
     */
    icon: {
      type: String,
      required: true
    },
    /**
     * Tool title (displayed as h1)
     */
    title: {
      type: String,
      required: true
    },
    /**
     * Tool description (displayed below title)
     */
    description: {
      type: String,
      required: true
    },
    /**
     * Avatar background color (Vuetify color name)
     */
    avatarColor: {
      type: String,
      default: 'primary'
    }
  }
};
</script>
