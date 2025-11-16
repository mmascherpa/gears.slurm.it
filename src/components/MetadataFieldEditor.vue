<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
        Edit Metadata Field
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-4">
        <!-- Edit Warning -->
        <v-alert
          v-if="field?.editWarning"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <v-icon icon="mdi-alert-circle-outline" size="small" class="mr-2"></v-icon>
          {{ field.editWarning }}
        </v-alert>

        <!-- Current Value Display -->
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-1">Field</div>
          <div class="text-body-1 font-weight-medium d-flex align-center">
            <v-icon
              :icon="field?.icon || 'mdi-tag'"
              size="small"
              class="mr-2"
              color="grey"
            ></v-icon>
            {{ field?.label }}
            <v-chip
              v-if="field?.type"
              size="x-small"
              variant="outlined"
              color="info"
              class="ml-2"
            >
              {{ field.type }}
            </v-chip>
          </div>
        </div>

        <!-- Original Value -->
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-1">Original Value</div>
          <div class="text-body-2 pa-2 rounded bg-surface-variant">
            {{ field?.value || 'N/A' }}
          </div>
        </div>

        <!-- New Value Input -->
        <v-text-field
          v-model="editedValue"
          label="New Value"
          variant="outlined"
          density="comfortable"
          clearable
          autofocus
          :placeholder="field?.value"
          :hint="getFieldHint(field)"
          persistent-hint
          @keydown.enter="save"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-pencil-outline" size="small"></v-icon>
          </template>
        </v-text-field>

        <!-- Validation Message -->
        <v-alert
          v-if="validationError"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          {{ validationError }}
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="bg-surface-variant">
        <v-btn
          variant="text"
          @click="cancel"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          prepend-icon="mdi-delete"
          @click="remove"
        >
          Remove Field
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-content-save"
          @click="save"
          :disabled="!canSave"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { validateValueType } from '@/utils/exifTags';

export default {
  name: 'MetadataFieldEditor',
  props: {
    /**
     * Whether the dialog is visible
     */
    modelValue: {
      type: Boolean,
      default: false
    },
    /**
     * The field to edit
     */
    field: {
      type: Object,
      default: null
    }
  },
  emits: [
    /**
     * Update dialog visibility
     */
    'update:modelValue',
    /**
     * Save the edited value
     * @param {Object} payload - { field, newValue }
     */
    'save',
    /**
     * Remove the field entirely
     * @param {Object} field - The field to remove
     */
    'remove',
    /**
     * Cancel editing
     */
    'cancel'
  ],
  setup(props, { emit }) {
    // State
    const editedValue = ref('');
    const validationError = ref(null);

    // Computed
    const dialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const canSave = computed(() => {
      return editedValue.value !== null &&
             editedValue.value !== undefined &&
             editedValue.value !== '' &&
             editedValue.value !== props.field?.value &&
             !validationError.value;
    });

    // Methods
    const getFieldHint = (field) => {
      if (!field) return '';

      const hints = {
        'DateTime': 'Format: YYYY:MM:DD HH:MM:SS',
        'DateTimeOriginal': 'Format: YYYY:MM:DD HH:MM:SS',
        'DateTimeDigitized': 'Format: YYYY:MM:DD HH:MM:SS',
        'Copyright': 'Copyright notice or author name',
        'Artist': 'Photographer or creator name',
        'Make': 'Camera manufacturer (e.g., Canon, Nikon)',
        'Model': 'Camera model (e.g., EOS 5D)',
        'ImageDescription': 'Brief description of the image',
        'UserComment': 'User-defined comment or notes'
      };

      // Check by label
      for (const [key, hint] of Object.entries(hints)) {
        if (field.label.includes(key)) {
          return hint;
        }
      }

      return 'Enter new value for this field';
    };

    const validateValue = (value) => {
      if (!value) {
        return 'Value cannot be empty';
      }

      // Validate string length
      if (value.length > 500) {
        return 'Value too long (max 500 characters)';
      }

      // Type validation based on field type
      if (props.field?.type) {
        const typeValidation = validateValueType(value, props.field.type);
        if (!typeValidation.valid) {
          return typeValidation.warning;
        }
      }

      return null;
    };

    const save = () => {
      const error = validateValue(editedValue.value);

      if (error) {
        validationError.value = error;
        return;
      }

      emit('save', {
        field: props.field,
        newValue: editedValue.value
      });

      // Reset and close
      editedValue.value = '';
      validationError.value = null;
      dialog.value = false;
    };

    const remove = () => {
      emit('remove', props.field);

      // Reset and close
      editedValue.value = '';
      validationError.value = null;
      dialog.value = false;
    };

    const cancel = () => {
      emit('cancel');

      // Reset and close
      editedValue.value = '';
      validationError.value = null;
      dialog.value = false;
    };

    // Watchers
    watch(() => props.field, (newField) => {
      if (newField) {
        editedValue.value = newField.value || '';
        validationError.value = null;
      }
    }, { immediate: true });

    watch(editedValue, () => {
      // Clear validation error when user types
      validationError.value = null;
    });

    return {
      dialog,
      editedValue,
      validationError,
      canSave,
      getFieldHint,
      save,
      remove,
      cancel
    };
  }
};
</script>

<style scoped>
/* No custom styles needed - using Vuetify components */
</style>
