<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon icon="mdi-upload" class="mr-2"></v-icon>
        Import Passwords
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Step 1: File Selection -->
        <template v-if="step === 'select'">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Import passwords from CSV or JSON files. Supports encrypted files (.aes, .enc, .age).
          </v-alert>

          <v-file-input
            v-model="selectedFile"
            label="Select file to import"
            accept=".csv,.json,.aes,.enc,.age"
            prepend-icon="mdi-file"
            show-size
            @update:model-value="handleFileSelect"
          ></v-file-input>

          <div class="text-caption text-medium-emphasis mt-2">
            Supported formats: CSV, JSON, or encrypted versions (.aes, .enc, .age)
          </div>
        </template>

        <!-- Step 2: Decryption Password (for encrypted files) -->
        <template v-if="step === 'decrypt'">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            This file is encrypted. Enter the password to decrypt it.
          </v-alert>

          <v-text-field
            v-model="decryptPassword"
            :type="showDecryptPassword ? 'text' : 'password'"
            label="Decryption Password"
            :append-inner-icon="showDecryptPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showDecryptPassword = !showDecryptPassword"
            @keyup.enter="handleDecrypt"
            :error-messages="decryptError"
            autofocus
          ></v-text-field>
        </template>

        <!-- Step 3: Preview -->
        <template v-if="step === 'preview'">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-subtitle-1">
              Found {{ parsedEntries.length }} entries
            </span>
            <v-chip
              v-if="duplicateCount > 0"
              color="warning"
              size="small"
            >
              {{ duplicateCount }} duplicates
            </v-chip>
          </div>

          <!-- Duplicate Handling -->
          <v-select
            v-if="duplicateCount > 0"
            v-model="duplicateMode"
            label="Handle duplicates"
            :items="[
              { title: 'Skip duplicates', value: 'skip' },
              { title: 'Overwrite existing', value: 'overwrite' },
              { title: 'Keep both', value: 'keepBoth' }
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            class="mb-3"
          ></v-select>

          <!-- Preview Table -->
          <v-card variant="outlined" class="preview-container">
            <v-table density="compact" fixed-header height="300">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>URL</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in parsedEntries" :key="index">
                  <td class="text-truncate" style="max-width: 150px">{{ entry.name || '-' }}</td>
                  <td class="text-truncate" style="max-width: 120px">{{ entry.username || entry.email || '-' }}</td>
                  <td class="text-truncate" style="max-width: 150px">{{ displayUrl(entry.url) }}</td>
                  <td>
                    <v-chip
                      :color="isDuplicate(entry) ? 'warning' : 'success'"
                      size="x-small"
                    >
                      {{ isDuplicate(entry) ? 'Duplicate' : 'New' }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </template>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-2 text-body-2">{{ loadingMessage }}</div>
        </div>

        <!-- Error Display -->
        <v-alert
          v-if="error && step !== 'decrypt'"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn
          v-if="step !== 'select'"
          variant="text"
          @click="goBack"
          :disabled="isLoading"
        >
          Back
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="isLoading"
        >
          Cancel
        </v-btn>

        <v-btn
          v-if="step === 'decrypt'"
          color="primary"
          :loading="isLoading"
          :disabled="!decryptPassword"
          @click="handleDecrypt"
        >
          Decrypt
        </v-btn>

        <v-btn
          v-if="step === 'preview'"
          color="primary"
          :loading="isLoading"
          :disabled="parsedEntries.length === 0"
          @click="handleImport"
        >
          Import {{ parsedEntries.length }} Entries
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import {
  parsePasswordCSV,
  parsePasswordJSON,
  detectFileFormat,
  findDuplicates
} from '@/utils/passwordVaultImport';
import { usePasswordVault } from '@/composables/usePasswordVault';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'import']);

const { getEntries, importEntries } = usePasswordVault();

// State
const step = ref('select');
const selectedFile = ref(null);
const fileContent = ref(null);
const fileFormat = ref(null);
const parsedEntries = ref([]);
const duplicateMode = ref('skip');

const decryptPassword = ref('');
const showDecryptPassword = ref(false);
const decryptError = ref('');

const isLoading = ref(false);
const loadingMessage = ref('');
const error = ref('');

// Computed
const duplicates = computed(() => {
  const existing = getEntries();
  return findDuplicates(existing, parsedEntries.value);
});

const duplicateCount = computed(() => duplicates.value.length);

// Reset when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetState();
  }
});

function resetState() {
  step.value = 'select';
  selectedFile.value = null;
  fileContent.value = null;
  fileFormat.value = null;
  parsedEntries.value = [];
  duplicateMode.value = 'skip';
  decryptPassword.value = '';
  decryptError.value = '';
  error.value = '';
}

function goBack() {
  if (step.value === 'preview') {
    if (fileFormat.value?.isEncrypted) {
      step.value = 'decrypt';
    } else {
      step.value = 'select';
    }
  } else if (step.value === 'decrypt') {
    step.value = 'select';
  }
}

async function handleFileSelect(file) {
  if (!file) return;

  isLoading.value = true;
  loadingMessage.value = 'Reading file...';
  error.value = '';

  try {
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);

    // Detect format
    fileFormat.value = detectFileFormat(file.name, content);

    if (fileFormat.value.isEncrypted) {
      // Need decryption
      fileContent.value = content;
      step.value = 'decrypt';
    } else {
      // Parse directly
      const text = new TextDecoder().decode(content);
      await parseAndPreview(text, fileFormat.value.format);
    }
  } catch (err) {
    console.error('File read error:', err);
    error.value = 'Failed to read file';
  } finally {
    isLoading.value = false;
  }
}

async function handleDecrypt() {
  if (!decryptPassword.value || !fileContent.value) return;

  isLoading.value = true;
  loadingMessage.value = 'Decrypting file...';
  decryptError.value = '';
  error.value = '';

  try {
    // Create worker for decryption
    const worker = new Worker(
      new URL('../workers/cryptoWorker.js', import.meta.url),
      { type: 'module' }
    );

    const decrypted = await new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        const [action, data] = event.data;
        if (action === 'ERROR') {
          reject(new Error(data));
        } else {
          resolve(data);
        }
        worker.terminate();
      };
      worker.onerror = (e) => {
        reject(e);
        worker.terminate();
      };

      const blob = new Blob([fileContent.value]);
      worker.postMessage(['DECRYPT', blob, decryptPassword.value, 'import', fileFormat.value.algorithm]);
    });

    // Parse decrypted content
    const text = new TextDecoder().decode(decrypted);

    // Detect format from content (since we don't know original format)
    const trimmed = text.trim();
    const format = (trimmed.startsWith('{') || trimmed.startsWith('[')) ? 'json' : 'csv';

    await parseAndPreview(text, format);
  } catch (err) {
    console.error('Decryption error:', err);
    const errMsg = typeof err === 'string' ? err : (err.message || 'Decryption failed');
    if (errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('decrypt')) {
      decryptError.value = 'Incorrect password';
    } else {
      decryptError.value = errMsg;
    }
  } finally {
    isLoading.value = false;
  }
}

async function parseAndPreview(text, format) {
  isLoading.value = true;
  loadingMessage.value = 'Parsing entries...';
  error.value = '';

  try {
    let entries;
    if (format === 'json') {
      entries = parsePasswordJSON(text);
    } else {
      entries = parsePasswordCSV(text);
    }

    if (entries.length === 0) {
      error.value = 'No entries found in file';
      step.value = 'select';
      return;
    }

    parsedEntries.value = entries;
    step.value = 'preview';
  } catch (err) {
    console.error('Parse error:', err);
    error.value = 'Failed to parse file contents';
    step.value = 'select';
  } finally {
    isLoading.value = false;
  }
}

async function handleImport() {
  if (parsedEntries.value.length === 0) return;

  isLoading.value = true;
  loadingMessage.value = 'Importing entries...';
  error.value = '';

  try {
    const result = await importEntries(parsedEntries.value, duplicateMode.value);
    emit('import', result);
    emit('update:modelValue', false);
  } catch (err) {
    console.error('Import error:', err);
    error.value = 'Failed to import entries';
  } finally {
    isLoading.value = false;
  }
}

function handleCancel() {
  emit('update:modelValue', false);
}

function isDuplicate(entry) {
  const key = `${entry.name.toLowerCase()}|${entry.username.toLowerCase()}`;
  return duplicates.value.some(d => d.key === key);
}

function displayUrl(url) {
  if (!url) return '-';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return url.substring(0, 30);
  }
}
</script>

<style scoped>
.preview-container {
  max-height: 350px;
  overflow: auto;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
