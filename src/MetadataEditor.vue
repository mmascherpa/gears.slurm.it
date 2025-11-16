<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-image-filter-hdr"
      title="Metadata Editor"
      description="View, edit, and remove EXIF metadata from images for complete privacy control"
      avatar-color="warning"
    />

    <!-- Main Layout: Left Sidebar + Right Content -->
    <v-row>
      <!-- LEFT SIDEBAR: Upload + Preview (35% width on desktop) -->
      <v-col cols="12" lg="4" md="5" class="sidebar-column">
        <div class="sidebar-sticky">
          <!-- Upload Card -->
          <v-card elevation="2" class="mb-3">
            <v-card-title class="bg-surface-variant pa-3">
              <v-icon icon="mdi-upload" size="small" class="mr-2"></v-icon>
              <span class="text-body-1">Upload Image</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-file-input
                v-model="selectedFile"
                label="Select JPEG"
                accept=".jpg,.jpeg"
                prepend-icon="mdi-camera"
                variant="outlined"
                density="compact"
                clearable
                show-size
                hide-details
              />
            </v-card-text>
          </v-card>

          <!-- Image Preview Card (when metadata loaded) -->
          <v-card v-if="metadata && imagePreviewUrl" elevation="2">
            <v-card-title class="bg-surface-variant pa-3">
              <v-icon icon="mdi-image" size="small" class="mr-2"></v-icon>
              <span class="text-body-1">Preview</span>
              <v-chip
                v-if="isModified"
                size="x-small"
                color="warning"
                variant="flat"
                class="ml-2"
              >
                <v-icon start icon="mdi-pencil" size="x-small"></v-icon>
                Modified
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-img
                :src="isModified ? modifiedImageUrl : imagePreviewUrl"
                aspect-ratio="1"
                class="rounded cursor-pointer preview-thumbnail"
                cover
                @click="showImageDialog = true"
              >
                <template v-slot:placeholder>
                  <v-row align="center" justify="center" class="fill-height">
                    <v-progress-circular indeterminate size="32"></v-progress-circular>
                  </v-row>
                </template>

                <!-- Overlay with expand hint -->
                <div class="preview-overlay">
                  <v-icon icon="mdi-magnify-plus-outline" size="32" color="white"></v-icon>
                  <div class="text-caption text-white mt-1">Click to expand</div>
                </div>
              </v-img>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ fileName }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ fileSize }}
              </div>
              <div v-if="isModified" class="text-caption text-warning mt-1">
                <v-icon icon="mdi-alert" size="x-small" class="mr-1"></v-icon>
                {{ editCount }} unsaved change{{ editCount !== 1 ? 's' : '' }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- RIGHT CONTENT AREA: Metadata (65% width on desktop) -->
      <v-col cols="12" lg="8" md="7">
        <!-- Metadata Viewer: Horizontal Layout (Categories | Fields) -->
        <v-row v-if="metadata">
          <!-- Categories Column (Left) -->
          <v-col cols="12" md="4">
            <v-card elevation="2">
              <v-card-title class="bg-surface-variant pa-3">
                <v-icon icon="mdi-format-list-bulleted" size="small" class="mr-2"></v-icon>
                <span class="text-body-1">Categories</span>
              </v-card-title>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="(section, sectionKey) in metadata"
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
                    <v-chip
                      v-if="section.fields.filter(f => isFieldModified(f)).length > 0"
                      size="x-small"
                      variant="flat"
                      color="warning"
                      class="ml-2"
                    >
                      {{ section.fields.filter(f => isFieldModified(f)).length }} modified
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle class="text-caption">
                    {{ section.fields.filter(f => f.isPopulated).length }} / {{ section.fields.length }} populated
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Actions Card -->
            <v-card elevation="2" class="mt-3">
              <v-card-title class="bg-surface-variant pa-3">
                <v-icon icon="mdi-cog" size="small" class="mr-2"></v-icon>
                <span class="text-body-1">Actions</span>
              </v-card-title>
              <v-card-text class="pa-3">
                <!-- Attribute Actions Section -->
                <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">
                  Attribute Actions
                </div>
                <v-btn
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-plus-circle"
                  @click="showAddFieldDialog = true"
                  size="small"
                  block
                  class="mb-2"
                >
                  Add Custom Field
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-eraser"
                  @click="clearMetadataValues"
                  size="small"
                  block
                  :disabled="isModified"
                  class="mb-2"
                >
                  Clear All Values
                </v-btn>
                <v-btn
                  v-if="isModified"
                  color="grey"
                  variant="outlined"
                  prepend-icon="mdi-undo"
                  @click="discardChanges"
                  size="small"
                  block
                  class="mb-4"
                >
                  Discard Changes
                </v-btn>

                <!-- Divider -->
                <v-divider v-if="isModified" class="my-3"></v-divider>
                <v-divider v-else class="my-2"></v-divider>

                <!-- Download Actions Section -->
                <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">
                  Download Actions
                </div>
                <v-btn
                  v-if="isModified"
                  color="success"
                  variant="elevated"
                  prepend-icon="mdi-download"
                  @click="downloadModifiedImage"
                  size="small"
                  block
                  class="mb-2"
                >
                  Download Modified
                </v-btn>
                <v-btn
                  color="error"
                  variant="elevated"
                  prepend-icon="mdi-shield-lock"
                  @click="executeRemoveAll"
                  size="small"
                  block
                >
                  Download Clean
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Fields Column (Right) -->
          <v-col cols="12" md="8">
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
                      <v-icon
                        v-if="isFieldModified(field) && !isClearedField(field)"
                        icon="mdi-pencil"
                        size="x-small"
                        color="warning"
                        class="ml-1"
                      ></v-icon>
                      <v-icon
                        v-if="isClearedField(field)"
                        icon="mdi-delete"
                        size="x-small"
                        color="error"
                        class="ml-1"
                      ></v-icon>
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
                      <span v-if="field.isPopulated || isFieldModified(field)">
                        {{ field.value }}
                      </span>
                      <v-chip
                        v-if="!field.isPopulated && !isFieldModified(field)"
                        size="x-small"
                        variant="text"
                        color="grey"
                      >
                        empty
                      </v-chip>
                    </td>
                    <td style="width: 160px;" class="text-right">
                      <v-btn
                        v-if="isFieldModified(field) || isClearedField(field)"
                        icon="mdi-restore"
                        size="x-small"
                        variant="text"
                        color="success"
                        @click="restoreField(field)"
                      >
                        <v-icon size="small">mdi-restore</v-icon>
                        <v-tooltip activator="parent" location="top">Restore original value</v-tooltip>
                      </v-btn>
                      <v-btn
                        v-if="field.editable"
                        icon="mdi-pencil"
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="openFieldEditor(field)"
                      >
                        <v-icon size="small">mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="top">Edit field</v-tooltip>
                      </v-btn>
                      <v-btn
                        v-if="field.editable"
                        icon="mdi-delete"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="confirmRemoveField(field)"
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

        <!-- Empty State (no metadata) -->
        <v-card v-if="!metadata" variant="tonal" color="grey-lighten-4" elevation="0">
          <v-card-text class="text-center pa-8">
            <v-icon icon="mdi-image-off" size="64" color="grey"></v-icon>
            <p class="text-h6 text-medium-emphasis mt-4">No Image Loaded</p>
            <p class="text-body-2 text-medium-emphasis">
              Upload a JPEG image to view and edit its EXIF metadata.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Message (after removal) -->
    <v-card v-if="cleanedImageUrl" variant="tonal" color="success" elevation="2" class="mb-4">
      <v-card-text class="d-flex align-center pa-4">
        <v-icon icon="mdi-check-circle" size="48" class="mr-4"></v-icon>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-medium">Metadata Successfully Removed</div>
          <div class="text-body-2">Your image is now clean and ready to share safely.</div>
        </div>
        <v-btn
          color="success"
          variant="elevated"
          size="large"
          prepend-icon="mdi-download"
          @click="downloadCleanImage"
        >
          Download Clean Image
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />

    <!-- Field Editor Dialog -->
    <MetadataFieldEditor
      v-model="showFieldEditor"
      :field="currentEditField"
      @save="saveFieldEdit"
      @remove="confirmRemoveField"
      @cancel="closeFieldEditor"
    />

    <!-- Add Custom Field Dialog -->
    <AddCustomFieldDialog
      v-model="showAddFieldDialog"
      @add-field="addCustomFieldToImage"
      @cancel="showAddFieldDialog = false"
    />

    <!-- Loading Overlay -->
    <v-overlay :model-value="isProcessing" class="align-center justify-center">
      <v-progress-circular
        indeterminate
        size="64"
        color="warning"
      ></v-progress-circular>
      <p class="text-h6 mt-4">{{ loadingMessage }}</p>
    </v-overlay>


    <!-- Image Preview Dialog (Full Size) -->
    <v-dialog v-model="showImageDialog" max-width="90vw">
      <v-card>
        <v-card-title class="d-flex align-center bg-surface-variant">
          <v-icon icon="mdi-image" class="mr-2"></v-icon>
          {{ fileName }}
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showImageDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            :src="imagePreviewUrl"
            max-height="80vh"
            contain
          >
            <template v-slot:placeholder>
              <v-row align="center" justify="center" class="fill-height">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-card-text>
        <v-card-actions class="bg-surface-variant">
          <v-spacer></v-spacer>
          <div class="text-caption text-medium-emphasis">
            {{ fileSize }}
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import {
  addCustomField,
  base64ToBlob,
  clearAllMetadataValues,
  editMetadataField,
  fileToBase64,
  getMetadataStats,
  loadExifData,
  removeAllMetadata,
  removeMetadataField,
  validateImageData
} from '@/utils/metadataEditor';
import { useSnackbar } from '@/composables/useSnackbar';
import AddCustomFieldDialog from '@/components/AddCustomFieldDialog.vue';
import MetadataFieldEditor from '@/components/MetadataFieldEditor.vue';
import MetadataViewer from '@/components/MetadataViewer.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'MetadataEditor',
  components: {
    AddCustomFieldDialog,
    MetadataFieldEditor,
    MetadataViewer,
    SharedSnackbar,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const cleanedImageUrl = ref(null);
    const currentEditField = ref(null);
    const editHistory = ref([]);
    const fileName = ref('');
    const fileSize = ref('');
    const imageBase64 = ref(null);
    const imagePreviewUrl = ref(null);
    const isProcessing = ref(false);
    const loadingMessage = ref('Processing...');
    const metadata = ref(null);
    const modifiedImageUrl = ref(null);
    const originalImageBase64 = ref(null);
    const originalMetadata = ref(null);
    const selectedFile = ref(null);
    const selectedSection = ref(null);
    const showAddFieldDialog = ref(false);
    const showFieldEditor = ref(false);
    const showImageDialog = ref(false);

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();

    // Computed Properties

    /**
     * Get current section data
     */
    const currentSection = computed(() => {
      if (!selectedSection.value || !metadata.value) return null;
      return metadata.value[selectedSection.value];
    });

    /**
     * Track modified field keys from edit history
     */
    const modifiedFieldKeys = computed(() => {
      const keys = new Set();
      editHistory.value.forEach(edit => {
        if (edit.field && typeof edit.field === 'object' && edit.field.key) {
          keys.add(edit.field.key);
        }
      });
      return keys;
    });

    /**
     * Check if a field has been modified
     */
    const isFieldModified = (field) => {
      return modifiedFieldKeys.value.has(field.key);
    };

    /**
     * Check if a field has been cleared (was populated, now empty)
     */
    const isClearedField = (field) => {
      if (!originalMetadata.value) return false;

      // Find the original field
      for (const section of Object.values(originalMetadata.value)) {
        const originalField = section.fields.find(f => f.key === field.key);
        if (originalField && originalField.isPopulated && !field.isPopulated) {
          return true;
        }
      }

      return false;
    };

    /**
     * Get original value of a field
     */
    const getOriginalValue = (field) => {
      if (!originalMetadata.value) return null;

      for (const section of Object.values(originalMetadata.value)) {
        const originalField = section.fields.find(f => f.key === field.key);
        if (originalField) {
          return originalField.value;
        }
      }

      return null;
    };

    /**
     * Restore field to original value
     */
    const restoreField = async (field) => {
      const originalValue = getOriginalValue(field);

      if (originalValue === null || originalValue === '') {
        showSnackbar('❌ No original value to restore', 'error');
        return;
      }

      // Use the existing saveFieldEdit flow
      await saveFieldEdit({
        field: field,
        newValue: originalValue
      });

      // Remove from edit history to reflect it's back to original
      editHistory.value = editHistory.value.filter(edit =>
        !(edit.field && edit.field.key === field.key)
      );

      showSnackbar(`✓ Field "${field.label}" restored to original value`, 'success');
    };

    /**
     * Get metadata statistics
     */
    const stats = computed(() => {
      if (!metadata.value) {
        return {
          totalFields: 0,
          sections: 0,
          editableFields: 0,
          privacyFields: 0,
          hasGPS: false,
          hasCameraInfo: false,
          hasTimestamps: false,
          hasAuthorInfo: false
        };
      }
      return getMetadataStats(metadata.value);
    });

    /**
     * Check if metadata has been modified
     */
    const isModified = computed(() => {
      return editHistory.value.length > 0;
    });

    /**
     * Count of edits made
     */
    const editCount = computed(() => {
      return editHistory.value.length;
    });

    // Functions

    /**
     * Analyze uploaded image for EXIF metadata
     */
    const analyzeImage = async (file) => {
      if (!file) return;

      isProcessing.value = true;
      loadingMessage.value = 'Analyzing metadata...';

      try {
        fileName.value = file.name;
        fileSize.value = formatFileSize(file.size);

        // Convert file to Base64
        const base64Data = await fileToBase64(file);
        imageBase64.value = base64Data;

        // Create preview URL
        imagePreviewUrl.value = base64Data;

        // Validate image format
        const validation = validateImageData(base64Data);
        if (!validation.valid) {
          showSnackbar(`❌ ${validation.error}`, 'error');
          return;
        }

        // Load EXIF data
        const exifData = await loadExifData(base64Data);
        metadata.value = exifData;
        originalMetadata.value = JSON.parse(JSON.stringify(exifData));
        originalImageBase64.value = base64Data;

        // Check if any metadata was found
        if (Object.keys(exifData).length === 0) {
          showSnackbar('ℹ️ No EXIF metadata found in this image', 'info');
        } else {
          const stats = getMetadataStats(exifData);
          showSnackbar(`✓ Found ${stats.populatedFields} populated field${stats.populatedFields !== 1 ? 's' : ''} in the image`, 'success');
        }

        // Reset state
        cleanedImageUrl.value = null;
        modifiedImageUrl.value = null;
        editHistory.value = [];

      } catch (error) {
        console.error('Analysis error:', error);
        showSnackbar(`❌ ${error.message}`, 'error');
        metadata.value = null;
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Execute removal of all metadata (download clean)
     */
    const executeRemoveAll = async () => {
      if (!imageBase64.value) return;

      isProcessing.value = true;
      loadingMessage.value = 'Removing all metadata...';

      try {
        const cleanedBase64 = await removeAllMetadata(imageBase64.value);

        // Create download URL
        cleanedImageUrl.value = 'data:image/jpeg;base64,' + cleanedBase64;

        showSnackbar('✓ All metadata removed successfully!', 'success');

        // Clear metadata display
        metadata.value = null;
      } catch (error) {
        console.error('Metadata removal error:', error);
        showSnackbar(`❌ Failed to remove metadata: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Download cleaned image
     */
    const downloadCleanImage = () => {
      if (!cleanedImageUrl.value) return;

      const blob = base64ToBlob(cleanedImageUrl.value);
      const cleanFileName = fileName.value.replace(/\.[^/.]+$/, '') + '_clean.jpg';

      downloadFile(blob, cleanFileName);
      showSnackbar('✓ Clean image downloaded!', 'success');
    };

    /**
     * Open field editor dialog
     */
    const openFieldEditor = (field) => {
      currentEditField.value = field;
      showFieldEditor.value = true;
    };

    /**
     * Close field editor dialog
     */
    const closeFieldEditor = () => {
      currentEditField.value = null;
      showFieldEditor.value = false;
    };

    /**
     * Save field edit
     */
    const saveFieldEdit = async ({ field, newValue }) => {
      if (!imageBase64.value) return;

      isProcessing.value = true;
      loadingMessage.value = 'Saving changes...';

      try {
        const modifiedBase64 = await editMetadataField(imageBase64.value, field, newValue);

        // Update image
        imageBase64.value = 'data:image/jpeg;base64,' + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadExifData(imageBase64.value);
        metadata.value = newMetadata;

        // Track edit with field object (not just label)
        editHistory.value.push({
          field: field,
          oldValue: field.value,
          newValue: newValue,
          timestamp: new Date()
        });

        showSnackbar(`✓ Field "${field.label}" updated successfully!`, 'success');
      } catch (error) {
        console.error('Field edit error:', error);
        showSnackbar(`❌ Failed to edit field: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Confirm removing a single field
     */
    const confirmRemoveField = async (field) => {
      if (!imageBase64.value) return;

      isProcessing.value = true;
      loadingMessage.value = 'Removing field...';

      try {
        const modifiedBase64 = await removeMetadataField(imageBase64.value, field);

        // Update image
        imageBase64.value = 'data:image/jpeg;base64,' + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadExifData(imageBase64.value);
        metadata.value = newMetadata;

        // Track edit
        editHistory.value.push({
          field: field.label,
          oldValue: field.value,
          newValue: '[Removed]',
          timestamp: new Date()
        });

        showSnackbar(`✓ Field "${field.label}" removed successfully!`, 'success');
      } catch (error) {
        console.error('Field removal error:', error);
        showSnackbar(`❌ Failed to remove field: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Download modified image
     */
    const downloadModifiedImage = () => {
      if (!modifiedImageUrl.value) return;

      const blob = base64ToBlob(modifiedImageUrl.value);
      const modifiedFileName = fileName.value.replace(/\.[^/.]+$/, '') + '_modified.jpg';

      downloadFile(blob, modifiedFileName);
      showSnackbar('✓ Modified image downloaded!', 'success');
    };

    /**
     * Discard all changes and revert to original
     */
    const discardChanges = () => {
      if (!originalImageBase64.value || !originalMetadata.value) return;

      imageBase64.value = originalImageBase64.value;
      metadata.value = JSON.parse(JSON.stringify(originalMetadata.value));
      modifiedImageUrl.value = null;
      editHistory.value = [];

      showSnackbar('✓ Changes discarded', 'info');
    };

    /**
     * Clear all metadata values (keep structure for editing)
     */
    const clearMetadataValues = async () => {
      if (!imageBase64.value) return;

      isProcessing.value = true;
      loadingMessage.value = 'Clearing metadata values...';

      try {
        const clearedBase64 = await clearAllMetadataValues(imageBase64.value);

        // Update image
        imageBase64.value = 'data:image/jpeg;base64,' + clearedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata (will show all fields as empty)
        const newMetadata = await loadExifData(imageBase64.value);
        metadata.value = newMetadata;

        // Track as a change
        editHistory.value.push({
          field: 'All Fields',
          oldValue: 'Various values',
          newValue: '[Cleared]',
          timestamp: new Date()
        });

        showSnackbar('✓ All metadata values cleared. Fields are now empty and ready for editing.', 'success');
      } catch (error) {
        console.error('Clear metadata error:', error);
        showSnackbar(`❌ Failed to clear metadata: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Add custom field to image
     */
    const addCustomFieldToImage = async (customField) => {
      if (!imageBase64.value) return;

      isProcessing.value = true;
      loadingMessage.value = 'Adding custom field...';

      try {
        const modifiedBase64 = await addCustomField(
          imageBase64.value,
          customField.ifd,
          customField.tagId,
          customField.value,
          customField.type
        );

        // Update image
        imageBase64.value = 'data:image/jpeg;base64,' + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadExifData(imageBase64.value);
        metadata.value = newMetadata;

        // Find the newly added field in metadata to track it properly
        const fieldKey = `${customField.ifd}.${customField.tagId}`;
        let addedField = null;
        for (const section of Object.values(newMetadata)) {
          addedField = section.fields.find(f => f.key === fieldKey);
          if (addedField) break;
        }

        // Track edit
        editHistory.value.push({
          field: addedField || { key: fieldKey, label: customField.label },
          oldValue: '[Not set]',
          newValue: customField.value,
          timestamp: new Date()
        });

        showSnackbar(`✓ Custom field "${customField.label}" added successfully!`, 'success');
      } catch (error) {
        console.error('Add custom field error:', error);
        showSnackbar(`❌ Failed to add custom field: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    /**
     * Format file size for display
     */
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Watchers

    watch(selectedFile, (newVal) => {
      if (newVal && newVal.length > 0) {
        // Auto-analyze when file is selected
        analyzeImage(newVal[0]);
      } else {
        // Clear all state when file is removed
        metadata.value = null;
        imageBase64.value = null;
        imagePreviewUrl.value = null;
        cleanedImageUrl.value = null;
        modifiedImageUrl.value = null;
        originalImageBase64.value = null;
        originalMetadata.value = null;
        editHistory.value = [];
        fileName.value = '';
        fileSize.value = '';
        selectedSection.value = null;
      }
    });

    // Auto-select first section when metadata changes
    watch(metadata, (newMetadata) => {
      if (newMetadata && Object.keys(newMetadata).length > 0) {
        const firstKey = Object.keys(newMetadata)[0];
        selectedSection.value = firstKey;
      } else {
        selectedSection.value = null;
      }
    });

    return {
      // State
      cleanedImageUrl,
      currentEditField,
      currentSection,
      editCount,
      fileName,
      fileSize,
      imagePreviewUrl,
      isModified,
      isProcessing,
      loadingMessage,
      metadata,
      modifiedImageUrl,
      selectedFile,
      selectedSection,
      showAddFieldDialog,
      showFieldEditor,
      showImageDialog,
      stats,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Methods
      addCustomFieldToImage,
      clearMetadataValues,
      closeFieldEditor,
      confirmRemoveField,
      discardChanges,
      downloadCleanImage,
      downloadModifiedImage,
      executeRemoveAll,
      isClearedField,
      isFieldModified,
      openFieldEditor,
      restoreField,
      saveFieldEdit
    };
  }
};
</script>

<style scoped>
/* Sidebar sticky positioning on desktop */
.sidebar-sticky {
  position: sticky;
  top: 20px;
}

/* Preview thumbnail styles */
.preview-thumbnail {
  position: relative;
  transition: all 0.3s ease;
}

.preview-thumbnail:hover {
  transform: scale(1.02);
}

/* Overlay hint that appears on hover */
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.preview-thumbnail:hover .preview-overlay {
  background: rgba(0, 0, 0, 0.6);
  opacity: 1;
}

/* Category item hover effect */
.category-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Cursor pointer for clickable image */
.cursor-pointer {
  cursor: pointer;
}

/* Responsive: Remove sticky on mobile/tablet */
@media (max-width: 1023px) {
  .sidebar-sticky {
    position: relative;
    top: 0;
  }
}
</style>
