<template>
  <div v-if="sections && Object.keys(sections).length > 0">
    <!-- Master-Detail Layout -->
    <v-row>
      <!-- Left: Category List -->
      <v-col cols="12" md="4" lg="3">
        <v-card elevation="2">
          <v-card-title class="bg-surface-variant pa-3">
            <span class="text-body-1">Categories</span>
          </v-card-title>
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-for="(section, sectionKey) in sections"
              :key="sectionKey"
              :value="sectionKey"
              :active="selectedSection === sectionKey"
              @click="selectedSection = sectionKey"
              class="category-item"
            >
              <template v-slot:prepend>
                <v-icon
                  :icon="section.icon"
                  :color="section.color"
                  size="small"
                ></v-icon>
              </template>

              <v-list-item-title class="text-body-2">
                {{ section.name }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption">
                {{ section.fields.length }} field{{ section.fields.length !== 1 ? 's' : '' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Right: Field Details -->
      <v-col cols="12" md="8" lg="9">
        <v-card v-if="currentSection" elevation="2">
          <!-- Section Header -->
          <v-card-title class="bg-surface-variant pa-3">
            <v-icon
              :icon="currentSection.icon"
              :color="currentSection.color"
              size="small"
              class="mr-2"
            ></v-icon>
            <span class="text-body-1">{{ currentSection.name }}</span>
          </v-card-title>

          <!-- Section Description -->
          <v-alert
            v-if="currentSection.description"
            color="info"
            variant="tonal"
            density="compact"
            class="ma-3"
          >
            {{ currentSection.description }}
          </v-alert>

          <!-- Fields Table -->
          <v-table density="compact">
            <tbody>
              <tr
                v-for="field in currentSection.fields"
                :key="field.key"
              >
                <td style="width: 40%;" class="text-body-2 font-weight-medium">
                  <v-icon
                    :icon="field.icon"
                    size="x-small"
                    color="grey"
                    class="mr-2"
                  ></v-icon>
                  {{ field.label }}
                  <v-tooltip v-if="field.editWarning" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        icon="mdi-information-outline"
                        size="x-small"
                        color="info"
                        class="ml-1"
                      ></v-icon>
                    </template>
                    <span style="max-width: 300px; display: block;">{{ field.editWarning }}</span>
                  </v-tooltip>
                </td>
                <td class="text-body-2">
                  <span :class="{
                    'text-medium-emphasis': !field.isPopulated
                  }">
                    {{ field.value }}
                  </span>
                  <v-chip
                    v-if="!field.isPopulated"
                    size="x-small"
                    variant="text"
                    color="grey"
                    class="ml-2"
                  >
                    empty
                  </v-chip>
                </td>
                <td style="width: 120px;" class="text-right">
                  <v-btn
                    v-if="editable && field.editable"
                    icon="mdi-pencil"
                    size="x-small"
                    variant="text"
                    color="primary"
                    @click="$emit('edit-field', field)"
                  >
                    <v-icon size="small">mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit field</v-tooltip>
                  </v-btn>
                  <v-btn
                    v-if="editable && field.editable"
                    icon="mdi-delete"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="$emit('remove-field', field)"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove this field</v-tooltip>
                  </v-btn>
                  <v-btn
                    v-else-if="field.warning && showQuickActions"
                    icon="mdi-delete"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="$emit('remove-field', field)"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove this field</v-tooltip>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Empty state when no section selected -->
        <v-card v-else variant="tonal" color="grey-lighten-4" elevation="0">
          <v-card-text class="text-center pa-8">
            <v-icon icon="mdi-arrow-left" size="64" color="grey"></v-icon>
            <p class="text-h6 text-medium-emphasis mt-4">Select a Category</p>
            <p class="text-body-2 text-medium-emphasis">
              Click a category on the left to view its metadata fields.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>

  <!-- Empty State -->
  <v-card v-else variant="tonal" color="grey-lighten-4" elevation="0">
    <v-card-text class="text-center pa-8">
      <v-icon icon="mdi-image-off" size="64" color="grey"></v-icon>
      <p class="text-h6 text-medium-emphasis mt-4">No Metadata Found</p>
      <p class="text-body-2 text-medium-emphasis">
        This image does not contain any EXIF metadata, or the metadata could not be read.
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'MetadataViewer',
  props: {
    /**
     * Organized metadata sections
     * @type {Object}
     */
    sections: {
      type: Object,
      required: true
    },
    /**
     * Whether fields are editable
     * @type {Boolean}
     */
    editable: {
      type: Boolean,
      default: false
    },
    /**
     * Show quick action buttons (delete, etc.)
     * @type {Boolean}
     */
    showQuickActions: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    /**
     * Emitted when user clicks edit button on a field
     * @param {Object} field - The field to edit
     */
    'edit-field',
    /**
     * Emitted when user clicks remove button on a field
     * @param {Object} field - The field to remove
     */
    'remove-field'
  ],
  setup(props) {
    // Selected section key
    const selectedSection = ref(null);

    // Get current section data
    const currentSection = computed(() => {
      if (!selectedSection.value || !props.sections) return null;
      return props.sections[selectedSection.value];
    });

    // Auto-select first section when sections change
    watch(() => props.sections, (newSections) => {
      if (newSections && Object.keys(newSections).length > 0) {
        // Select first section by default
        const firstKey = Object.keys(newSections)[0];
        selectedSection.value = firstKey;
      } else {
        selectedSection.value = null;
      }
    }, { immediate: true });

    return {
      selectedSection,
      currentSection
    };
  }
};
</script>

<style scoped>
.category-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
