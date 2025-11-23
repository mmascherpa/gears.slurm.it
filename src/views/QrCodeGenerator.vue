<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      title="QR Code Generator"
      description="Generate QR codes for text, WiFi, contacts, and more"
      icon="mdi-qrcode"
      avatar-color="primary" />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      title="What are QR Codes?"
      storage-key="slurm-help-qr-code"
    >
      <p class="mb-2">
        <strong>QR Codes</strong> (Quick Response codes) are 2D barcodes that can be scanned by smartphone
        cameras to quickly access information without typing.
      </p>
      <ul class="ml-4 mb-2">
        <li><strong>WiFi Sharing</strong> - Generate codes that connect devices to WiFi networks instantly</li>
        <li><strong>Contact Cards</strong> - Share contact information (vCard format) via a single scan</li>
        <li><strong>URLs & Text</strong> - Direct users to websites or display messages</li>
        <li><strong>Error Correction</strong> - QR codes can still work even if partially damaged or obscured</li>
      </ul>
      <EducationalAlert title="WiFi Security Note" type="info" spacing="mt-3">
        WiFi QR codes contain your network password in plain text. Only share with trusted individuals
        and consider using guest networks for public sharing.
      </EducationalAlert>
      <p class="mt-3 mb-2">
        <strong>Common use cases:</strong> Restaurant menus, event check-ins, WiFi guest access,
        business cards, product packaging, payment links.
      </p>

      <!-- Reference Links -->
      <div class="text-caption text-medium-emphasis mt-3">
        <strong>Learn more:</strong>
        <a href="https://en.wikipedia.org/wiki/QR_code" target="_blank" rel="noopener noreferrer" class="text-info">
          Wikipedia: QR Code
        </a>
        •
        <a href="https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/" target="_blank" rel="noopener noreferrer" class="text-info">
          QR Code Basics
        </a>
      </div>

      <!-- Technical Details -->
      <div class="text-caption text-medium-emphasis mt-2">
        <strong>Technical:</strong> Uses the
        <a href="https://github.com/soldair/node-qrcode" target="_blank" rel="noopener noreferrer" class="text-info">qrcode</a>
        npm library. All QR codes generated locally in your browser.
      </div>
    </LearnMorePanel>

    <!-- Main Layout Row -->
    <v-row>
      <!-- Configuration Column (70%) -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="bg-surface-variant">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            Configuration
          </v-card-title>
          <v-card-text class="pa-4">
            <!-- Type and Options Row -->
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="qrType"
                  :items="qrTypes"
                  label="QR Code Type"
                  variant="outlined"
                  density="comfortable" hide-details="true">
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="qrOptions.width"
                  :items="sizeOptions"
                  label="Size"
                  variant="outlined"
                  density="comfortable" hide-details="true">
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="qrOptions.errorCorrectionLevel"
                  :items="errorCorrectionLevels"
                  label="Error Correction"
                  variant="outlined"
                  density="comfortable" hide-details="true">
                </v-select>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

        <!-- Plain Text Form -->
        <div v-if="qrType === 'text'">
          <v-textarea
            v-model="textData"
            label="Text or URL"
            placeholder="Enter text or URL to encode..."
            variant="outlined"
            rows="4"
            auto-grow>
          </v-textarea>
        </div>

        <!-- WiFi Form -->
        <div v-if="qrType === 'wifi'">
          <v-text-field
            v-model="wifiData.ssid"
            label="Network Name (SSID)"
            placeholder="MyWiFiNetwork"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-select
            v-model="wifiData.security"
            :items="securityTypes"
            label="Security Type"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-select>

          <v-text-field
            v-if="wifiData.security !== 'nopass'"
            v-model="wifiData.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword">
          </v-text-field>

          <v-checkbox
            v-model="wifiData.hidden"
            label="Hidden Network"
            density="compact">
          </v-checkbox>
        </div>

        <!-- vCard Form -->
        <div v-if="qrType === 'vcard'">
          <v-text-field
            v-model="vcardData.name"
            label="Full Name"
            placeholder="John Doe"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-text-field
            v-model="vcardData.phone"
            label="Phone Number"
            placeholder="+1234567890"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-text-field
            v-model="vcardData.email"
            label="Email Address"
            placeholder="john@example.com"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-text-field
            v-model="vcardData.organization"
            label="Organization (Optional)"
            placeholder="Company Inc."
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-text-field
            v-model="vcardData.url"
            label="Website (Optional)"
            placeholder="https://example.com"
            variant="outlined"
            density="comfortable">
          </v-text-field>
        </div>

        <!-- Email Form -->
        <div v-if="qrType === 'email'">
          <v-text-field
            v-model="emailData.to"
            label="Recipient Email"
            placeholder="recipient@example.com"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-text-field
            v-model="emailData.subject"
            label="Subject (Optional)"
            placeholder="Email subject"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-textarea
            v-model="emailData.body"
            label="Body (Optional)"
            placeholder="Email message..."
            variant="outlined"
            rows="3"
            auto-grow>
          </v-textarea>
        </div>

        <!-- SMS Form -->
        <div v-if="qrType === 'sms'">
          <v-text-field
            v-model="smsData.phone"
            label="Phone Number"
            placeholder="+1234567890"
            variant="outlined"
            density="comfortable"
            class="mb-3">
          </v-text-field>

          <v-textarea
            v-model="smsData.message"
            label="Message (Optional)"
            placeholder="Text message..."
            variant="outlined"
            rows="3"
            auto-grow>
          </v-textarea>
        </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- QR Code Output Column (30%) -->
      <v-col cols="12" lg="4">
        <v-card class="qr-output-card">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-qrcode" class="mr-2"></v-icon>
        QR Code Output
      </v-card-title>
      <v-card-text class="pa-4">
        <div v-if="qrCodeDataUrl" class="text-center">
          <!-- QR Code Image -->
          <div class="qr-code-container mb-4">
            <img :src="qrCodeDataUrl" alt="Generated QR Code" class="qr-code-image" />
          </div>

          <!-- Action Buttons -->
          <div class="d-flex flex-column gap-2">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-download"
              block
              @click="handleDownload">
              Download PNG
            </v-btn>

            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-content-copy"
              block
              @click="handleCopy">
              Copy Image
            </v-btn>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-qrcode-scan" size="64" color="grey-lighten-1" class="mb-3"></v-icon>
          <div class="text-body-1 text-grey">
            {{ errorMessage || 'Enter data to generate a QR code' }}
          </div>
        </div>
      </v-card-text>
    </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import EducationalAlert from '@/components/EducationalAlert.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';
import { generateQrCode, downloadQrCode, copyQrCodeToClipboard } from '@/utils/qrCodeGenerator';
import { formatPlainText, formatWiFi, formatVCard, formatEmail, formatSMS } from '@/utils/qrDataFormatters';

export default {
  name: 'QrCodeGenerator',
  components: {
    EducationalAlert,
    LearnMorePanel,
    SharedSnackbar,
    ToolPageHeader,
  },
  setup() {
    // Constants
    const QR_TYPES = [
      { value: 'text', title: 'Plain Text / URL' },
      { value: 'wifi', title: 'WiFi Network' },
      { value: 'vcard', title: 'Contact (vCard)' },
      { value: 'email', title: 'Email' },
      { value: 'sms', title: 'SMS / Phone' },
    ];

    const SECURITY_TYPES = [
      { value: 'WPA', title: 'WPA/WPA2' },
      { value: 'WEP', title: 'WEP' },
      { value: 'nopass', title: 'No Password' },
    ];

    const SIZE_OPTIONS = [
      { value: 128, title: '128px (Small)' },
      { value: 256, title: '256px (Medium)' },
      { value: 512, title: '512px (Large)' },
      { value: 1024, title: '1024px (Extra Large)' },
    ];

    const ERROR_CORRECTION_LEVELS = [
      { value: 'L', title: 'Low (7%)' },
      { value: 'M', title: 'Medium (15%)' },
      { value: 'Q', title: 'Quartile (25%)' },
      { value: 'H', title: 'High (30%)' },
    ];

    // Reactive State
    const qrType = ref('text');
    const qrCodeDataUrl = ref('');
    const errorMessage = ref('');
    const showPassword = ref(false);

    // Form Data
    const textData = ref('');
    const wifiData = ref({
      ssid: '',
      password: '',
      security: 'WPA',
      hidden: false,
    });
    const vcardData = ref({
      name: '',
      phone: '',
      email: '',
      organization: '',
      url: '',
    });
    const emailData = ref({
      to: '',
      subject: '',
      body: '',
    });
    const smsData = ref({
      phone: '',
      message: '',
    });

    // QR Options
    const qrOptions = ref({
      width: 256,
      errorCorrectionLevel: 'M',
      color: '#000000',
      backgroundColor: '#FFFFFF',
    });

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

    // Computed Properties
    const currentFormData = computed(() => {
      switch (qrType.value) {
        case 'text':
          return textData.value;
        case 'wifi':
          return wifiData.value;
        case 'vcard':
          return vcardData.value;
        case 'email':
          return emailData.value;
        case 'sms':
          return smsData.value;
        default:
          return '';
      }
    });

    const qrTypes = computed(() => QR_TYPES);
    const securityTypes = computed(() => SECURITY_TYPES);
    const sizeOptions = computed(() => SIZE_OPTIONS);
    const errorCorrectionLevels = computed(() => ERROR_CORRECTION_LEVELS);

    // Functions
    async function generateQrCodeFromCurrentData() {
      errorMessage.value = '';
      qrCodeDataUrl.value = '';

      try {
        let dataToEncode = '';

        switch (qrType.value) {
          case 'text':
            dataToEncode = formatPlainText(textData.value);
            break;
          case 'wifi':
            dataToEncode = formatWiFi(wifiData.value);
            break;
          case 'vcard':
            dataToEncode = formatVCard(vcardData.value);
            break;
          case 'email':
            dataToEncode = formatEmail(emailData.value);
            break;
          case 'sms':
            dataToEncode = formatSMS(smsData.value);
            break;
          default:
            throw new Error('Invalid QR code type');
        }

        const dataUrl = await generateQrCode(dataToEncode, qrOptions.value);
        qrCodeDataUrl.value = dataUrl;
      } catch (error) {
        const errMsg = typeof error === 'string' ? error : (error.message || 'Unknown error');
        errorMessage.value = errMsg;
        console.error('QR code generation error:', error);
      }
    }

    function handleDownload() {
      try {
        let filename = 'qrcode.png';

        switch (qrType.value) {
          case 'text':
            filename = 'qrcode-text.png';
            break;
          case 'wifi':
            filename = wifiData.value.ssid ? `qrcode-wifi-${wifiData.value.ssid}.png` : 'qrcode-wifi.png';
            break;
          case 'vcard':
            filename = vcardData.value.name ? `qrcode-${vcardData.value.name.replace(/\s+/g, '-')}.png` : 'qrcode-contact.png';
            break;
          case 'email':
            filename = 'qrcode-email.png';
            break;
          case 'sms':
            filename = 'qrcode-sms.png';
            break;
        }

        downloadQrCode(qrCodeDataUrl.value, filename);
        showSnackbar('QR code downloaded successfully', 'success');
      } catch (error) {
        const errorMsg = typeof error === 'string' ? error : (error.message || 'Failed to download QR code');
        showSnackbar(errorMsg, 'error');
        console.error('Download error:', error);
      }
    }

    async function handleCopy() {
      try {
        await copyQrCodeToClipboard(qrCodeDataUrl.value);
        showSnackbar('QR code copied to clipboard', 'success');
      } catch (error) {
        const errorMsg = typeof error === 'string' ? error : (error.message || 'Failed to copy QR code');
        showSnackbar(errorMsg, 'error');
        console.error('Copy error:', error);
      }
    }

    // Debounce setup (after function definition)
    const { debounce: debouncedGenerate } = useDebounce(generateQrCodeFromCurrentData, 350);

    // Watchers
    watch(currentFormData, () => {
      debouncedGenerate();
    }, { deep: true });

    watch(qrOptions, () => {
      debouncedGenerate();
    }, { deep: true });

    watch(qrType, () => {
      qrCodeDataUrl.value = '';
      errorMessage.value = '';
    });

    // Return
    return {
      // State
      qrType,
      qrCodeDataUrl,
      errorMessage,
      showPassword,
      textData,
      wifiData,
      vcardData,
      emailData,
      smsData,
      qrOptions,

      // Snackbar
      snackbar,
      snackbarText,
      snackbarColor,

      // Computed
      qrTypes,
      securityTypes,
      sizeOptions,
      errorCorrectionLevels,

      // Methods
      handleDownload,
      handleCopy,
    };
  },
};
</script>

<style scoped>
.qr-output-card {
  position: sticky;
  top: 24px;
  align-self: flex-start;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 0 auto;
  max-width: fit-content;
}

.qr-code-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.gap-2 {
  gap: 0.5rem;
}

/* On mobile, remove sticky behavior */
@media (max-width: 1279px) {
  .qr-output-card {
    position: static;
  }
}
</style>
