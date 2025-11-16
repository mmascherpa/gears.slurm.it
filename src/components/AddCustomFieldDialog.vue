<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon icon="mdi-plus-circle" class="mr-2"></v-icon>
        Add Custom EXIF Field
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-4">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <strong>Note:</strong> Adding custom fields to EXIF data can help with organization or steganography (hiding data).
          Choose from commonly used fields or select a custom tag ID.
        </v-alert>

        <!-- Field Selection -->
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedIfd"
              :items="ifdOptions"
              label="IFD (Image File Directory)"
              variant="outlined"
              density="comfortable"
              hint="Choose where to store the field"
              persistent-hint
            >
              <template v-slot:prepend-inner>
                <v-icon icon="mdi-folder" size="small"></v-icon>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="tagId"
              label="Tag ID"
              variant="outlined"
              density="comfortable"
              type="number"
              hint="Numeric tag identifier"
              persistent-hint
              :rules="[v => !!v || 'Tag ID is required', v => v > 0 || 'Must be positive']"
            >
              <template v-slot:prepend-inner>
                <v-icon icon="mdi-tag" size="small"></v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Common Custom Fields Suggestions -->
        <v-expansion-panels class="mt-4 mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-lightbulb" class="mr-2" size="small"></v-icon>
              Suggested Custom Fields
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <v-list-item
                  v-for="suggestion in suggestions"
                  :key="suggestion.key"
                  @click="applySuggestion(suggestion)"
                  class="suggestion-item"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="suggestion.icon" size="small"></v-icon>
                  </template>
                  <v-list-item-title>{{ suggestion.label }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ suggestion.ifd }}.{{ suggestion.tagId }} - {{ suggestion.description }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Field Label -->
        <v-text-field
          v-model="fieldLabel"
          label="Field Label"
          variant="outlined"
          density="comfortable"
          hint="Human-readable name for this field"
          persistent-hint
          class="mb-3"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-text" size="small"></v-icon>
          </template>
        </v-text-field>

        <!-- Value Type -->
        <v-select
          v-model="valueType"
          :items="typeOptions"
          label="Value Type"
          variant="outlined"
          density="comfortable"
          hint="Data type for this field"
          persistent-hint
          class="mb-3"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-format-list-bulleted-type" size="small"></v-icon>
          </template>
        </v-select>

        <!-- Field Value -->
        <v-textarea
          v-model="fieldValue"
          label="Field Value"
          variant="outlined"
          density="comfortable"
          rows="3"
          :hint="getValueHint()"
          persistent-hint
          :placeholder="getValuePlaceholder()"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-pencil" size="small"></v-icon>
          </template>
        </v-textarea>

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
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="addField"
          :disabled="!canAdd"
        >
          Add Field
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed } from 'vue';
import { validateValueType } from '@/utils/exifTags';

export default {
  name: 'AddCustomFieldDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'add-field', 'cancel'],
  setup(props, { emit }) {
    // State
    const selectedIfd = ref('0th');
    const tagId = ref(null);
    const fieldLabel = ref('');
    const valueType = ref('string');
    const fieldValue = ref('');
    const validationError = ref(null);

    // Options
    const ifdOptions = [
      { title: '0th - Main Image Data', value: '0th' },
      { title: 'Exif - EXIF Data', value: 'Exif' },
      { title: 'GPS - GPS Data', value: 'GPS' },
      { title: '1st - Thumbnail Data', value: '1st' }
    ];

    const typeOptions = [
      { title: 'Text (String)', value: 'string' },
      { title: 'Number (Integer)', value: 'number' },
      { title: 'Rational (Fraction)', value: 'rational' },
      { title: 'DateTime', value: 'datetime' },
      { title: 'Array', value: 'array' }
    ];

    const suggestions = [
      {
        ifd: '0th',
        tagId: 270,
        label: 'Image Description',
        icon: 'mdi-text',
        description: 'General description of the image'
      },
      {
        ifd: 'Exif',
        tagId: 37510,
        label: 'User Comment',
        icon: 'mdi-message-text',
        description: 'User-defined comment (ideal for hidden data)'
      },
      {
        ifd: '0th',
        tagId: 315,
        label: 'Artist/Author',
        icon: 'mdi-account',
        description: 'Creator of the image'
      },
      {
        ifd: '0th',
        tagId: 33432,
        label: 'Copyright',
        icon: 'mdi-copyright',
        description: 'Copyright information'
      },
      {
        ifd: '0th',
        tagId: 305,
        label: 'Software',
        icon: 'mdi-application',
        description: 'Software used to create/edit the image'
      }
    ];

    // Computed
    const dialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const canAdd = computed(() => {
      return selectedIfd.value &&
             tagId.value &&
             tagId.value > 0 &&
             fieldLabel.value &&
             fieldValue.value &&
             !validationError.value;
    });

    // Methods
    const getValueHint = () => {
      const hints = {
        string: 'Enter any text value',
        number: 'Enter a whole number (e.g., 100, 400)',
        rational: 'Enter a fraction (e.g., 1/125) or decimal (e.g., 2.8)',
        datetime: 'Format: YYYY:MM:DD HH:MM:SS',
        array: 'Enter comma-separated values (e.g., 1, 2, 3)'
      };
      return hints[valueType.value] || 'Enter field value';
    };

    const getValuePlaceholder = () => {
      const placeholders = {
        string: 'Enter text...',
        number: '100',
        rational: '1/125',
        datetime: '2025:11:15 14:30:00',
        array: '1, 2, 3'
      };
      return placeholders[valueType.value] || '';
    };

    const applySuggestion = (suggestion) => {
      selectedIfd.value = suggestion.ifd;
      tagId.value = suggestion.tagId;
      fieldLabel.value = suggestion.label;
    };

    const validateField = () => {
      if (!fieldValue.value) {
        return 'Field value is required';
      }

      // Type validation
      const typeValidation = validateValueType(fieldValue.value, valueType.value);
      if (!typeValidation.valid) {
        return typeValidation.warning;
      }

      return null;
    };

    const addField = () => {
      const error = validateField();

      if (error) {
        validationError.value = error;
        return;
      }

      emit('add-field', {
        ifd: selectedIfd.value,
        tagId: parseInt(tagId.value),
        label: fieldLabel.value,
        type: valueType.value,
        value: fieldValue.value
      });

      // Reset
      selectedIfd.value = '0th';
      tagId.value = null;
      fieldLabel.value = '';
      valueType.value = 'string';
      fieldValue.value = '';
      validationError.value = null;
      dialog.value = false;
    };

    const cancel = () => {
      emit('cancel');

      // Reset
      selectedIfd.value = '0th';
      tagId.value = null;
      fieldLabel.value = '';
      valueType.value = 'string';
      fieldValue.value = '';
      validationError.value = null;
      dialog.value = false;
    };

    return {
      dialog,
      selectedIfd,
      tagId,
      fieldLabel,
      valueType,
      fieldValue,
      validationError,
      ifdOptions,
      typeOptions,
      suggestions,
      canAdd,
      getValueHint,
      getValuePlaceholder,
      applySuggestion,
      addField,
      cancel
    };
  }
};
</script>

<style scoped>
.suggestion-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
