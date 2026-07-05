<template>
  <div>
    <ToolPageHeader
      title="Password Manager"
      description="Securely store and manage passwords with Age encryption"
      icon="mdi-key"
      avatar-color="primary"
    />

    <LearnMorePanel
      title="Password Security Best Practices"
      storage-key="slurm-help-password-manager"
    >
      <p class="mb-2">
        Your password vault is encrypted with <strong>Age encryption</strong>, a modern and secure
        encryption format. All data is stored locally in your browser and never leaves your device.
      </p>
      <ul class="ml-4 mb-2">
        <li><strong>Master password</strong> - Choose a strong, unique password you'll remember</li>
        <li><strong>Auto-lock</strong> - Vault automatically locks after {{ autoLockMinutes }} minutes of inactivity</li>
        <li><strong>Local storage</strong> - Data stays on your device, works offline</li>
        <li><strong>Import/Export</strong> - Migrate from other password managers via CSV/JSON</li>
      </ul>
      <EducationalAlert title="Backup Reminder" type="warning" spacing="mt-3">
        Export your vault regularly to a secure location. If you clear browser data, your vault will be lost.
      </EducationalAlert>
    </LearnMorePanel>

    <!-- Locked State / Setup -->
    <v-card v-if="isLocked" class="mb-4">
      <v-card-text class="pa-6 text-center">
        <v-icon
          :icon="hasVault ? 'mdi-lock' : 'mdi-shield-key'"
          size="64"
          color="primary"
          class="mb-4"
        ></v-icon>

        <h2 class="text-h5 mb-2">
          {{ hasVault ? 'Vault Locked' : 'Create Your Vault' }}
        </h2>

        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ hasVault
            ? 'Enter your master password to unlock your password vault.'
            : 'Set up a secure vault to store your passwords. All data is encrypted and stored locally.'
          }}
        </p>

        <v-btn
          color="primary"
          size="large"
          @click="showUnlockDialog = true"
        >
          <v-icon :icon="hasVault ? 'mdi-lock-open' : 'mdi-plus'" class="mr-2"></v-icon>
          {{ hasVault ? 'Unlock Vault' : 'Create Vault' }}
        </v-btn>

        <div v-if="hasVault" class="mt-4">
          <v-btn
            variant="text"
            color="error"
            size="small"
            @click="showDeleteVaultDialog = true"
          >
            Delete Vault
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Unlocked State -->
    <template v-else>
      <!-- Toolbar -->
      <v-card class="mb-4">
        <v-card-text class="pa-3">
          <div class="d-flex flex-wrap align-center gap-2">
            <!-- Search -->
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search passwords..."
              hide-details
              density="compact"
              clearable
              style="max-width: 300px; min-width: 200px"
              class="flex-grow-1"
            ></v-text-field>

            <v-spacer class="d-none d-sm-flex"></v-spacer>

            <!-- Actions -->
            <v-btn
              color="primary"
              @click="openAddDialog"
            >
              <v-icon icon="mdi-plus" class="mr-1"></v-icon>
              Add
            </v-btn>

            <v-btn
              variant="tonal"
              @click="showImportDialog = true"
            >
              <v-icon icon="mdi-upload" class="mr-1"></v-icon>
              Import
            </v-btn>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" v-bind="props">
                  <v-icon icon="mdi-download" class="mr-1"></v-icon>
                  Export
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="exportVault('csv')">
                  <v-list-item-title>Export as CSV</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportVault('json')">
                  <v-list-item-title>Export as JSON</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="exportVault('csv-encrypted')">
                  <v-list-item-title>Export as Encrypted CSV</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportVault('json-encrypted')">
                  <v-list-item-title>Export as Encrypted JSON</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-btn
              v-if="biometricAvailable"
              variant="tonal"
              :color="hasWebAuthnCredential ? 'success' : undefined"
              :loading="webAuthn.isLoading.value"
              @click="toggleBiometricUnlock"
            >
              <v-icon icon="mdi-fingerprint" class="mr-1"></v-icon>
              {{ hasWebAuthnCredential ? 'Biometrics On' : 'Enable Biometrics' }}
            </v-btn>

            <v-btn
              variant="tonal"
              color="warning"
              @click="handleLock"
            >
              <v-icon icon="mdi-lock" class="mr-1"></v-icon>
              Lock
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Entry Count -->
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-body-2 text-medium-emphasis">
          {{ filteredEntries.length }} {{ filteredEntries.length === 1 ? 'entry' : 'entries' }}
          <span v-if="searchQuery">(filtered)</span>
        </span>

        <v-chip
          v-if="autoLockEnabled && autoLockRemaining !== null"
          size="small"
          color="info"
          variant="tonal"
        >
          <v-icon icon="mdi-clock" size="14" class="mr-1"></v-icon>
          Auto-lock in {{ formatTimeRemaining(autoLockRemaining) }}
        </v-chip>
      </div>

      <!-- Empty State -->
      <v-card v-if="filteredEntries.length === 0" class="mb-4">
        <v-card-text class="pa-6 text-center">
          <v-icon
            :icon="searchQuery ? 'mdi-magnify' : 'mdi-key'"
            size="48"
            color="grey"
            class="mb-3"
          ></v-icon>

          <h3 class="text-h6 mb-2">
            {{ searchQuery ? 'No matches found' : 'No passwords yet' }}
          </h3>

          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ searchQuery
              ? 'Try a different search term'
              : 'Add your first password entry or import from a file'
            }}
          </p>

          <div v-if="!searchQuery" class="d-flex justify-center gap-2">
            <v-btn color="primary" @click="openAddDialog">
              <v-icon icon="mdi-plus" class="mr-1"></v-icon>
              Add Entry
            </v-btn>
            <v-btn variant="tonal" @click="showImportDialog = true">
              <v-icon icon="mdi-upload" class="mr-1"></v-icon>
              Import
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Entry Grid -->
      <div v-else class="entry-grid">
        <PasswordEntryCard
          v-for="entry in filteredEntries"
          :key="entry.id"
          :entry="entry"
          @edit="openEditDialog"
          @delete="handleDelete"
          @copy-success="(msg) => showSnackbar(msg, 'success')"
          @copy-error="(msg) => showSnackbar(msg, 'error')"
        />
      </div>
    </template>

    <!-- Dialogs -->
    <VaultUnlockDialog
      v-model="showUnlockDialog"
      :is-new-vault="!hasVault"
      :is-loading="vaultLoading"
      :error="vaultError"
      :has-web-authn="hasWebAuthnCredential"
      @submit="handleUnlock"
      @webauthn="handleWebAuthn"
    />

    <PasswordEntryDialog
      v-model="showEntryDialog"
      :entry="editingEntry"
      :is-loading="vaultLoading"
      @submit="handleEntrySave"
    />

    <VaultImportDialog
      v-model="showImportDialog"
      @import="handleImport"
    />

    <!-- Delete Vault Confirmation -->
    <v-dialog v-model="showDeleteVaultDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-alert" color="error" class="mr-2"></v-icon>
          Delete Vault
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert type="error" variant="tonal" class="mb-3">
            This will permanently delete your password vault and all stored passwords.
            This action cannot be undone.
          </v-alert>
          <p>Are you sure you want to delete your vault?</p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteVaultDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="handleDeleteVault">Delete Forever</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Export Password Dialog (for encrypted exports) -->
    <v-dialog v-model="showExportPasswordDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-lock" class="mr-2"></v-icon>
          Export Password
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-3">Enter a password to encrypt the exported file.</p>
          <v-text-field
            v-model="exportPassword"
            :type="showExportPassword ? 'text' : 'password'"
            label="Export Password"
            :append-inner-icon="showExportPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showExportPassword = !showExportPassword"
            @keyup.enter="confirmEncryptedExport"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showExportPasswordDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmEncryptedExport" :disabled="!exportPassword">
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { usePasswordVault } from '@/composables/usePasswordVault';
import { useVaultAutoLock } from '@/composables/useVaultAutoLock';
import { useWebAuthn } from '@/composables/useWebAuthn';
import { useSnackbar } from '@/composables/useSnackbar';
import { exportToCSV, exportToJSON, getExportFilename } from '@/utils/passwordVaultExport';
import { downloadFile } from '@/utils/fileDownload';

import ToolPageHeader from '@/components/ToolPageHeader.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import EducationalAlert from '@/components/EducationalAlert.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import PasswordEntryCard from '@/components/PasswordEntryCard.vue';
import PasswordEntryDialog from '@/components/PasswordEntryDialog.vue';
import VaultUnlockDialog from '@/components/VaultUnlockDialog.vue';
import VaultImportDialog from '@/components/VaultImportDialog.vue';

// Composables
const {
  vault,
  isLocked,
  isLoading: vaultLoading,
  error: vaultError,
  hasVault,
  createVault,
  unlockVault,
  lockVault,
  addEntry,
  updateEntry,
  deleteEntry,
  importEntries,
  searchEntries,
  getEntries,
  getAutoLockMinutes,
  getMasterPassword,
  deleteVault
} = usePasswordVault();

const webAuthn = useWebAuthn();

const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

// Auto-lock composable
const autoLock = useVaultAutoLock({
  onLock: () => {
    lockVault();
    showSnackbar('Vault auto-locked due to inactivity', 'info');
  },
  getTimeout: () => getAutoLockMinutes(),
  isLocked: () => isLocked.value
});

// Local state
const searchQuery = ref('');
const showUnlockDialog = ref(false);
const showEntryDialog = ref(false);
const showImportDialog = ref(false);
const showDeleteVaultDialog = ref(false);
const showExportPasswordDialog = ref(false);
const editingEntry = ref(null);
const exportPassword = ref('');
const showExportPassword = ref(false);
const pendingExportFormat = ref(null);

// WebAuthn (biometric) unlock state
const hasWebAuthnCredential = webAuthn.hasCredential;
const biometricAvailable = ref(false);

// Auto-lock state (from composable)
const autoLockEnabled = computed(() => autoLock.isActive.value);
const autoLockMinutes = computed(() => getAutoLockMinutes());
const autoLockRemaining = ref(null);
let autoLockTimerInterval = null;

/**
 * Formats seconds into a human-readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "4m 30s", "59s")
 */
function formatTimeRemaining(seconds) {
  if (seconds === null || seconds <= 0) return '0s';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${secs}s`;
}

/**
 * Updates the auto-lock remaining time display
 */
function updateAutoLockDisplay() {
  if (!autoLock.isActive.value || isLocked.value) {
    autoLockRemaining.value = null;
    return;
  }
  autoLockRemaining.value = autoLock.getTimeRemaining();
}

/**
 * Starts the auto-lock display timer
 */
function startAutoLockDisplay() {
  // Update immediately
  updateAutoLockDisplay();

  // Update every second
  if (autoLockTimerInterval) {
    clearInterval(autoLockTimerInterval);
  }
  autoLockTimerInterval = setInterval(updateAutoLockDisplay, 1000);
}

/**
 * Stops the auto-lock display timer
 */
function stopAutoLockDisplay() {
  if (autoLockTimerInterval) {
    clearInterval(autoLockTimerInterval);
    autoLockTimerInterval = null;
  }
  autoLockRemaining.value = null;
}

// Computed
const filteredEntries = computed(() => {
  if (!searchQuery.value) {
    return getEntries();
  }
  return searchEntries(searchQuery.value);
});

// Watch for lock state changes to start/stop auto-lock
watch(isLocked, (locked) => {
  if (locked) {
    autoLock.stop();
    stopAutoLockDisplay();
  } else {
    autoLock.start();
    startAutoLockDisplay();
  }
});

// Lifecycle
onMounted(async () => {
  // Auto-open unlock dialog if vault exists
  if (hasVault.value) {
    showUnlockDialog.value = true;
  }

  biometricAvailable.value = webAuthn.isSupported.value &&
    await webAuthn.isPlatformAuthenticatorAvailable();
});

onBeforeUnmount(() => {
  stopAutoLockDisplay();
});

// Handlers
async function handleUnlock(password) {
  const isNew = !hasVault.value;

  let success;
  if (isNew) {
    success = await createVault(password);
    if (success) {
      showSnackbar('Vault created successfully', 'success');
    }
  } else {
    success = await unlockVault(password);
    if (success) {
      showSnackbar('Vault unlocked', 'success');
    }
  }

  if (success) {
    showUnlockDialog.value = false;
    // Auto-lock will be started by the watcher on isLocked change
  }
}

async function handleWebAuthn() {
  const password = await webAuthn.authenticate();
  if (!password) {
    showSnackbar(webAuthn.error.value || 'Biometric unlock failed', 'error');
    return;
  }

  const success = await unlockVault(password);
  if (success) {
    showUnlockDialog.value = false;
    showSnackbar('Vault unlocked', 'success');
  } else {
    // Stored password no longer opens the vault (master password changed)
    showSnackbar('Stored biometric password no longer matches - unlock with your password and re-enable biometrics', 'error');
    webAuthn.removeCredential();
  }
}

async function toggleBiometricUnlock() {
  if (hasWebAuthnCredential.value) {
    webAuthn.removeCredential();
    showSnackbar('Biometric unlock disabled', 'info');
    return;
  }

  const success = await webAuthn.register(getMasterPassword());
  if (success) {
    showSnackbar('Biometric unlock enabled', 'success');
  } else {
    showSnackbar(webAuthn.error.value || 'Could not enable biometric unlock', 'error');
  }
}

function handleLock() {
  autoLock.clear(); // Clear activity timestamp
  lockVault();
  showSnackbar('Vault locked', 'info');
}

function openAddDialog() {
  editingEntry.value = null;
  showEntryDialog.value = true;
}

function openEditDialog(entry) {
  editingEntry.value = entry;
  showEntryDialog.value = true;
}

async function handleEntrySave(entryData) {
  let success;

  if (editingEntry.value) {
    // Update existing
    success = await updateEntry(editingEntry.value.id, entryData);
    if (success) {
      showSnackbar('Entry updated', 'success');
    }
  } else {
    // Add new
    success = await addEntry(entryData);
    if (success) {
      showSnackbar('Entry added', 'success');
    }
  }

  if (success) {
    showEntryDialog.value = false;
    editingEntry.value = null;
  } else {
    showSnackbar(vaultError.value || 'Failed to save entry', 'error');
  }
}

async function handleDelete(entry) {
  const success = await deleteEntry(entry.id);
  if (success) {
    showSnackbar('Entry deleted', 'success');
  } else {
    showSnackbar(vaultError.value || 'Failed to delete entry', 'error');
  }
}

async function handleImport(result) {
  showSnackbar(
    `Import complete: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped`,
    'success'
  );
  showImportDialog.value = false;
}

function exportVault(format) {
  if (format.includes('encrypted')) {
    pendingExportFormat.value = format;
    exportPassword.value = '';
    showExportPasswordDialog.value = true;
    return;
  }

  performExport(format);
}

async function confirmEncryptedExport() {
  if (!exportPassword.value || !pendingExportFormat.value) return;

  showExportPasswordDialog.value = false;
  await performExport(pendingExportFormat.value, exportPassword.value);
  exportPassword.value = '';
  pendingExportFormat.value = null;
}

async function performExport(format, password = null) {
  const entries = getEntries();

  let content;
  let filename;
  let mimeType;

  const baseFormat = format.replace('-encrypted', '');

  if (baseFormat === 'csv') {
    content = exportToCSV(entries);
    filename = getExportFilename('csv');
    mimeType = 'text/csv';
  } else {
    content = exportToJSON(entries);
    filename = getExportFilename('json');
    mimeType = 'application/json';
  }

  if (password) {
    // Encrypt the export
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      // Use the same worker pattern as the vault
      const worker = new Worker(
        new URL('../workers/cryptoWorker.js', import.meta.url),
        { type: 'module' }
      );

      const encrypted = await new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
          const [action, result] = event.data;
          if (action === 'ERROR') {
            reject(new Error(result));
          } else {
            resolve(result);
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          reject(e);
          worker.terminate();
        };

        const blob = new Blob([data]);
        worker.postMessage(['ENCRYPT', blob, password, filename, 'age']);
      });

      filename += '.age';
      downloadFile(encrypted, filename);
      showSnackbar(`Exported ${entries.length} entries (encrypted)`, 'success');
    } catch (err) {
      console.error('Export encryption failed:', err);
      showSnackbar('Failed to encrypt export', 'error');
    }
  } else {
    // Plain export
    const blob = new Blob([content], { type: mimeType });
    const data = new Uint8Array(await blob.arrayBuffer());
    downloadFile(data, filename);
    showSnackbar(`Exported ${entries.length} entries`, 'success');
  }
}

function handleDeleteVault() {
  deleteVault();
  webAuthn.removeCredential();
  showDeleteVaultDialog.value = false;
  showSnackbar('Vault deleted', 'success');
}
</script>

<style scoped>
.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .entry-grid {
    grid-template-columns: 1fr;
  }
}

.gap-2 {
  gap: 8px;
}
</style>
