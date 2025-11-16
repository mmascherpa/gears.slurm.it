<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon icon="mdi-plus-circle" class="mr-2"></v-icon>
        Add PNG Text Field
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-4">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <strong>PNG Text Chunks:</strong> PNG images store metadata as keyword-value pairs in tEXt chunks.
          Use standard keywords or create custom ones for your needs.
        </v-alert>

        <!-- Keyword Input -->
        <v-text-field
          v-model="keyword"
          label="Keyword"
          variant="outlined"
          density="comfortable"
          hint="1-79 Latin-1 characters (e.g., 'Title', 'Author', 'MyCustomField')"
          persistent-hint
          :rules="keywordRules"
          :error-messages="keywordError"
          class="mb-3"
          @update:model-value="validateKeyword"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-tag" size="small"></v-icon>
          </template>
        </v-text-field>

        <!-- Standard Keywords Suggestions -->
        <v-expansion-panels class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-lightbulb" class="mr-2" size="small"></v-icon>
              Standard PNG Keywords
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <v-list-item
                  v-for="suggestion in standardKeywords"
                  :key="suggestion.keyword"
                  @click="applyKeyword(suggestion.keyword)"
                  class="suggestion-item"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="suggestion.icon" size="small"></v-icon>
                  </template>
                  <v-list-item-title>{{ suggestion.keyword }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ suggestion.description }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Value Input -->
        <v-textarea
          v-model="value"
          label="Value"
          variant="outlined"
          density="comfortable"
          rows="4"
          hint="Text value for this field (UTF-8 supported)"
          persistent-hint
          :rules="[v => !!v || 'Value is required']"
        >
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-text" size="small"></v-icon>
          </template>
        </v-textarea>

        <!-- Character Count -->
        <div class="text-caption text-medium-emphasis mt-2">
          Keyword: {{ keyword.length }}/79 characters | Value: {{ value.length }} characters
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="!isValid"
          @click="addField"
        >
          <v-icon start icon="mdi-plus"></v-icon>
          Add Field
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { validatePngKeyword } from '@/utils/pngTags';

export default {
  name: 'AddPngFieldDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue', 'add-field', 'cancel'],
  setup(props, { emit }) {
    // Reactive state
    const keyword = ref('');
    const value = ref('');
    const keywordError = ref('');

    // Standard PNG keywords
    const standardKeywords = [
      {
        keyword: 'Title',
        icon: 'mdi-text-box',
        description: 'Short title or caption for the image'
      },
      {
        keyword: 'Author',
        icon: 'mdi-account',
        description: 'Name of image creator'
      },
      {
        keyword: 'Description',
        icon: 'mdi-text',
        description: 'Longer description of image'
      },
      {
        keyword: 'Copyright',
        icon: 'mdi-copyright',
        description: 'Copyright notice'
      },
      {
        keyword: 'Creation Time',
        icon: 'mdi-clock-outline',
        description: 'Time of original image creation'
      },
      {
        keyword: 'Software',
        icon: 'mdi-application',
        description: 'Software used to create the image'
      },
      {
        keyword: 'Comment',
        icon: 'mdi-comment-text',
        description: 'Miscellaneous comment'
      },
      {
        keyword: 'Source',
        icon: 'mdi-source-branch',
        description: 'Device used to create the image'
      }
    ];

    // Computed
    const dialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const keywordRules = computed(() => [
      v => !!v || 'Keyword is required',
      v => (v && v.length <= 79) || 'Keyword must be 79 characters or less',
      v => (v && v.trim() === v) || 'Keyword should not have leading/trailing spaces'
    ]);

    const isValid = computed(() => {
      return keyword.value &&
             value.value &&
             keyword.value.length <= 79 &&
             keyword.value.trim() === keyword.value &&
             !keywordError.value;
    });

    // Methods
    const validateKeyword = () => {
      if (!keyword.value) {
        keywordError.value = '';
        return;
      }

      const validation = validatePngKeyword(keyword.value);
      keywordError.value = validation.valid ? '' : validation.error;
    };

    const applyKeyword = (selectedKeyword) => {
      keyword.value = selectedKeyword;
      validateKeyword();
    };

    const addField = () => {
      if (!isValid.value) return;

      emit('add-field', {
        keyword: keyword.value,
        value: value.value
      });

      resetForm();
      dialog.value = false;
    };

    const closeDialog = () => {
      resetForm();
      emit('cancel');
      dialog.value = false;
    };

    const resetForm = () => {
      keyword.value = '';
      value.value = '';
      keywordError.value = '';
    };

    // Watchers
    watch(() => props.modelValue, (newVal) => {
      if (!newVal) {
        resetForm();
      }
    });

    return {
      dialog,
      keyword,
      value,
      keywordError,
      keywordRules,
      standardKeywords,
      isValid,
      validateKeyword,
      applyKeyword,
      addField,
      closeDialog
    };
  }
};
</script>

<style scoped>
.suggestion-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
