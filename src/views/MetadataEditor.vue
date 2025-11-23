<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-image-filter-hdr"
      title="Metadata Editor"
      description="View, edit, and remove metadata from JPEG and PNG images for complete privacy control"
      avatar-color="warning"
    />

    <!-- Main Layout: Left Sidebar + Right Content -->
    <v-row>
      <!-- LEFT SIDEBAR: Upload + Preview (35% width on desktop) -->
      <v-col cols="12" lg="4" md="5" class="sidebar-column">
        <div class="sidebar-sticky">
          <!-- Upload Card -->
          <v-card class="mb-3">
            <v-card-title class="bg-surface-variant">
              <v-icon icon="mdi-image" class="mr-2"></v-icon>
              Edit image metadata
            </v-card-title>
            <v-card-text class="pa-3">
              <FileUpload
                v-model="selectedFile"
                label="Select Image"
                accept=".jpg,.jpeg,.png"
                prepend-icon="mdi-camera"
                hint="Supported formats: JPEG, PNG"
              />
            </v-card-text>
          </v-card>

          <!-- Image Preview Card (when metadata loaded) -->
          <v-card v-if="metadata && imagePreviewUrl">
            <v-card-title class="bg-surface-variant">
              <v-icon icon="mdi-image" class="mr-2"></v-icon>
              Preview
            </v-card-title>
              <template #actions>
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
              </template>
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
            <v-card>
              <v-card-title class="bg-surface-variant">
                <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
                Categories
              </v-card-title>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="(section, sectionKey) in metadata"
                  :key="sectionKey"
                  :value="sectionKey"
                  :active="selectedSection === sectionKey"
                  @click="selectedSection = sectionKey"
                  class="list-item-hover"
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
            <v-card class="mt-3">
              <v-card-title class="bg-surface-variant">
                <v-icon icon="mdi-cog" class="mr-2"></v-icon>
                Actions
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
            <v-card v-if="currentSection">
              <!-- Section Header -->
              <v-card-title class="bg-surface-variant">
                <v-icon
                  :icon="currentSection.icon"
                  :color="currentSection.color"
                ></v-icon>
                {{ currentSection.name }}
                <!-- Google Maps link for GPS coordinates -->
                <v-btn
                  v-if="selectedSection === 'Location' && hasValidGpsCoordinates"
                  :href="googleMapsUrl"
                  target="_blank"
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-map-marker"
                  class="ml-3"
                >
                  View on Maps
                  <v-tooltip activator="parent" location="bottom">Open coordinates in Google Maps</v-tooltip>
                </v-btn>
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
              <div class="metadata-fields-table">
                <v-table density="compact" class="d-none d-sm-table">
                  <tbody>
                    <tr
                      v-for="field in currentSection.fields"
                      :key="field.key"
                    >
                      <td class="table-col-label text-body-2 font-weight-medium">
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
                          <span class="tooltip-content">{{ field.editWarning }}</span>
                        </v-tooltip>
                      </td>
                      <td class="table-col-value text-body-2">
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
                      <td class="table-col-actions-md">
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

                <!-- Mobile Card Layout -->
                <div class="d-sm-none">
                  <v-card
                    v-for="field in currentSection.fields"
                    :key="field.key"
                    variant="outlined"
                    class="mb-2"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <span class="text-body-2 font-weight-medium">{{ field.label }}</span>
                        <v-spacer></v-spacer>
                        <v-icon
                          v-if="isFieldModified(field) && !isClearedField(field)"
                          icon="mdi-pencil"
                          size="small"
                          color="warning"
                        ></v-icon>
                        <v-icon
                          v-if="isClearedField(field)"
                          icon="mdi-delete"
                          size="small"
                          color="error"
                        ></v-icon>
                      </div>
                      <div class="text-body-2 mb-2" style="word-break: break-word;">
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
                      </div>
                      <div class="d-flex gap-2">
                        <v-btn
                          v-if="isFieldModified(field) || isClearedField(field)"
                          size="small"
                          variant="outlined"
                          color="success"
                          @click="restoreField(field)"
                        >
                          <v-icon start size="small">mdi-restore</v-icon>
                          Restore
                        </v-btn>
                        <v-btn
                          v-if="field.editable"
                          size="small"
                          variant="outlined"
                          color="primary"
                          @click="openFieldEditor(field)"
                        >
                          <v-icon start size="small">mdi-pencil</v-icon>
                          Edit
                        </v-btn>
                        <v-btn
                          v-if="field.editable"
                          size="small"
                          variant="outlined"
                          color="error"
                          @click="confirmRemoveField(field)"
                        >
                          <v-icon start size="small">mdi-delete</v-icon>
                          Remove
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
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
      </v-col>
    </v-row>

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

    <!-- Add Custom Field Dialog (JPEG) -->
    <AddCustomFieldDialog
      v-if="imageFormat === IMAGE_FORMATS.JPEG"
      v-model="showAddFieldDialog"
      @add-field="addCustomFieldToImage"
      @cancel="showAddFieldDialog = false"
    />

    <!-- Add PNG Field Dialog -->
    <AddPngFieldDialog
      v-if="imageFormat === IMAGE_FORMATS.PNG"
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
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { formatFileSize } from '@/utils/fileSizeValidator';

// Metadata manager for multi-format support
import {
  detectImageFormat,
  loadMetadata,
  editMetadataField as editMetadataFieldManager,
  removeMetadataField as removeMetadataFieldManager,
  removeAllMetadata as removeAllMetadataManager,
  addCustomField as addCustomFieldManager,
  getMetadataStats as getMetadataStatsManager,
  getFileExtension,
  getMimeType,
  IMAGE_FORMATS
} from '@/utils/metadataManager';

// JPEG-specific utilities (still needed for some helper functions)
import {
  base64ToBlob,
  clearAllMetadataValues,
  fileToBase64,
  validateImageData
} from '@/utils/metadataEditor';

import { useSnackbar } from '@/composables/useSnackbar';
import AddCustomFieldDialog from '@/components/AddCustomFieldDialog.vue';
import AddPngFieldDialog from '@/components/AddPngFieldDialog.vue';
import CardSectionHeader from '@/components/CardSectionHeader.vue';
import FileUpload from '@/components/FileUpload.vue';
import MetadataFieldEditor from '@/components/MetadataFieldEditor.vue';
import MetadataViewer from '@/components/MetadataViewer.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'MetadataEditor',
  components: {
    AddCustomFieldDialog,
    AddPngFieldDialog,
    CardSectionHeader,
    FileUpload,
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
    const imageFormat = ref(IMAGE_FORMATS.UNKNOWN); // Track detected image format
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

    /**
     * Check if valid GPS coordinates are available
     */
    const hasValidGpsCoordinates = computed(() => {
      if (!metadata.value || !metadata.value.Location) {
        console.log('[GPS] No metadata or Location section');
        return false;
      }

      const locationFields = metadata.value.Location.fields;
      const latField = locationFields.find(f => f.key === 'GPS.2');
      const lonField = locationFields.find(f => f.key === 'GPS.4');

      console.log('[GPS] latField:', latField);
      console.log('[GPS] lonField:', lonField);

      if (!latField || !lonField) {
        console.log('[GPS] Missing lat or lon field');
        return false;
      }

      // Check if both have populated values and are not 0
      const lat = parseFloat(latField.value);
      const lon = parseFloat(lonField.value);

      console.log('[GPS] lat:', lat, 'lon:', lon);
      console.log('[GPS] isPopulated:', latField.isPopulated, lonField.isPopulated);

      const isValid = latField.isPopulated && lonField.isPopulated &&
             !isNaN(lat) && !isNaN(lon) &&
             (lat !== 0 || lon !== 0);

      console.log('[GPS] hasValidGpsCoordinates:', isValid);
      return isValid;
    });

    /**
     * Generate Google Maps URL from GPS coordinates
     */
    const googleMapsUrl = computed(() => {
      if (!hasValidGpsCoordinates.value || !metadata.value) return '';

      const locationFields = metadata.value.Location.fields;
      const latField = locationFields.find(f => f.key === 'GPS.2');
      const lonField = locationFields.find(f => f.key === 'GPS.4');
      const latRefField = locationFields.find(f => f.key === 'GPS.1');
      const lonRefField = locationFields.find(f => f.key === 'GPS.3');

      // Extract numeric values from the formatted display values (remove degree symbol)
      let lat = parseFloat(latField.value.replace('°', ''));
      let lon = parseFloat(lonField.value.replace('°', ''));

      // Apply direction - S is negative latitude, W is negative longitude
      if (latRefField && latRefField.value === 'S') {
        lat = -lat;
      }
      if (lonRefField && lonRefField.value === 'W') {
        lon = -lon;
      }

      return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
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

        // Detect image format
        const format = detectImageFormat(file);
        imageFormat.value = format;

        if (format === IMAGE_FORMATS.UNKNOWN) {
          showSnackbar('❌ Unsupported image format. Please use JPEG or PNG.', 'error');
          return;
        }

        // Create preview URL
        imagePreviewUrl.value = base64Data;

        // Load metadata using format-specific loader
        const metadataData = await loadMetadata(base64Data, format);
        metadata.value = metadataData;
        originalMetadata.value = JSON.parse(JSON.stringify(metadataData));
        originalImageBase64.value = base64Data;

        // Check if any metadata was found
        if (Object.keys(metadataData).length === 0) {
          showSnackbar(`ℹ️ No metadata found in this ${format} image`, 'info');
        } else {
          const stats = getMetadataStatsManager(metadataData, format);
          showSnackbar(`✓ Found ${stats.populatedFields} populated field${stats.populatedFields !== 1 ? 's' : ''} in the ${format} image`, 'success');
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
        const cleanedBase64 = await removeAllMetadataManager(imageBase64.value, imageFormat.value);

        // Create download URL with correct MIME type
        const mimeType = getMimeType(imageFormat.value);
        cleanedImageUrl.value = `data:${mimeType};base64,` + cleanedBase64;

        showSnackbar('✓ All metadata removed successfully!', 'success');

        // Trigger download immediately
        const blob = base64ToBlob(cleanedImageUrl.value);
        const extension = getFileExtension(imageFormat.value);
        const cleanFileName = fileName.value.replace(/\.[^/.]+$/, '') + `_clean.${extension}`;
        downloadFile(blob, cleanFileName);

        // Keep metadata display so user can continue editing
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
      const extension = getFileExtension(imageFormat.value);
      const cleanFileName = fileName.value.replace(/\.[^/.]+$/, '') + `_clean.${extension}`;

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
        const modifiedBase64 = await editMetadataFieldManager(imageBase64.value, imageFormat.value, field, newValue);

        // Update image with correct MIME type
        const mimeType = getMimeType(imageFormat.value);
        imageBase64.value = `data:${mimeType};base64,` + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadMetadata(imageBase64.value, imageFormat.value);
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
        const modifiedBase64 = await removeMetadataFieldManager(imageBase64.value, imageFormat.value, field);

        // Update image with correct MIME type
        const mimeType = getMimeType(imageFormat.value);
        imageBase64.value = `data:${mimeType};base64,` + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadMetadata(imageBase64.value, imageFormat.value);
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
      const extension = getFileExtension(imageFormat.value);
      const modifiedFileName = fileName.value.replace(/\.[^/.]+$/, '') + `_modified.${extension}`;

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

      // This feature is only supported for JPEG images
      if (imageFormat.value !== IMAGE_FORMATS.JPEG) {
        showSnackbar('Clear all values is only supported for JPEG images. Use "Download Clean" to remove all PNG metadata.', 'info');
        return;
      }

      isProcessing.value = true;
      loadingMessage.value = 'Clearing metadata values...';

      try {
        const clearedBase64 = await clearAllMetadataValues(imageBase64.value);

        // Update image
        const mimeType = getMimeType(imageFormat.value);
        imageBase64.value = `data:${mimeType};base64,` + clearedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata (will show all fields as empty)
        const newMetadata = await loadMetadata(imageBase64.value, imageFormat.value);
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
        const modifiedBase64 = await addCustomFieldManager(imageBase64.value, imageFormat.value, customField);

        // Update image with correct MIME type
        const mimeType = getMimeType(imageFormat.value);
        imageBase64.value = `data:${mimeType};base64,` + modifiedBase64;
        modifiedImageUrl.value = imageBase64.value;

        // Reload metadata
        const newMetadata = await loadMetadata(imageBase64.value, imageFormat.value);
        metadata.value = newMetadata;

        // Find the newly added field in metadata to track it properly
        let fieldKey;
        if (imageFormat.value === IMAGE_FORMATS.JPEG) {
          fieldKey = `${customField.ifd}.${customField.tagId}`;
        } else if (imageFormat.value === IMAGE_FORMATS.PNG) {
          fieldKey = customField.keyword;
        }

        let addedField = null;
        for (const section of Object.values(newMetadata)) {
          addedField = section.fields.find(f => f.key === fieldKey);
          if (addedField) break;
        }

        // Track edit
        editHistory.value.push({
          field: addedField || { key: fieldKey, label: customField.label || customField.keyword },
          oldValue: '[Not set]',
          newValue: customField.value,
          timestamp: new Date()
        });

        showSnackbar(`✓ Custom field "${customField.label || customField.keyword}" added successfully!`, 'success');
      } catch (error) {
        console.error('Add custom field error:', error);
        showSnackbar(`❌ Failed to add custom field: ${error.message}`, 'error');
      } finally {
        isProcessing.value = false;
      }
    };

    // formatFileSize is now imported from @/utils/fileSizeValidator

    /**
     * Revoke blob URLs to prevent memory leaks
     * Should be called when URLs are no longer needed
     */
    const revokeImageUrls = () => {
      if (imagePreviewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl.value);
      }
      if (modifiedImageUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(modifiedImageUrl.value);
      }
      if (cleanedImageUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(cleanedImageUrl.value);
      }
    };

    // Watchers

    watch(selectedFile, (newVal, oldVal) => {
      // Revoke old blob URLs before creating new ones
      if (oldVal) {
        revokeImageUrls();
      }

      if (newVal) {
        // Auto-analyze when file is selected
        // FileUpload component returns a File object (not an array)
        analyzeImage(newVal);
      } else {
        // Clear all state when file is removed
        revokeImageUrls();
        metadata.value = null;
        imageBase64.value = null;
        imageFormat.value = IMAGE_FORMATS.UNKNOWN;
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

    // Cleanup: Revoke blob URLs on component unmount to prevent memory leaks
    onBeforeUnmount(() => {
      revokeImageUrls();
    });

    return {
      // State
      cleanedImageUrl,
      currentEditField,
      currentSection,
      editCount,
      fileName,
      fileSize,
      googleMapsUrl,
      hasValidGpsCoordinates,
      imageFormat,
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

      // Constants
      IMAGE_FORMATS,

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

/* Category item hover effect - moved to global-styles.css */
/* .category-item -> .list-item-hover (now global) */

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

/* Mobile field buttons spacing */
.gap-2 {
  gap: 8px;
  flex-wrap: wrap;
}
</style>
