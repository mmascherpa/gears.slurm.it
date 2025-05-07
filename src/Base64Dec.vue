<template>
  <v-container>

    <h1 class="text-h4 mb-4">Base64 Decoder</h1>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea label="Encoded Text" v-model="encodedText" @input="updatePlainText()" variant="outlined"
          placeholder="Enter your b64-encoded text here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn flat icon @click="pasteFromClipboard" v-show="!encodedText">
          <v-icon icon='mdi-content-paste' />
        </v-btn>
        <v-btn flat icon @click="encodedText = ''; updatePlainText(0)" v-show="!!encodedText">
          <v-icon icon='mdi-close-octagon-outline' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea v-model="plainText" bg-color="primary" variant="outlined" readonly
          placeholder="Plain text will appear here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn v-if="!isLoading && !plainText" color="transparent" flat icon></v-btn>
        <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="48" :width="8"></v-progress-circular>
        <v-btn v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!plainText">
          <v-icon icon='mdi-content-copy' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="8" sm="6">
        <v-file-input v-model="encodedFile" label="Decode a file" variant="outlined" show-size></v-file-input>
      </v-col>
      <v-col cols="8" sm="4" class="ma-sm-2">
        <v-btn :disabled="encodedFile.length == 0" @click="decodeFile">Decode</v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
export default {
  data() {
    return {
      plainText: '',
      encodedText: '',
      isLoading: false,
      encodedFile: [],
      plainFile: false
    };
  },
  methods: {
    updatePlainText(timeout = 350) {
      this.isLoading = true;
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        this.plainText = atob(this.encodedText);
        this.isLoading = false;
      }, timeout); // Debounce time (adjust as needed)
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.plainText)
    },
    pasteFromClipboard() {
      navigator.clipboard.readText()
        .then((clipboardText) => {
          this.encodedText = clipboardText;
          this.updatePlainText();
        });
    },
    decodeFile() {
      var reader = new FileReader();
      // Use the javascript reader object to load the contents
      // of the file in the v-model prop
      reader.readAsDataURL(this.encodedFile[0])
      reader.onload = () => {
        const dataUrl = reader.result;
        // Extract base64 encoded string from data URL
        const plainString = atob(dataUrl.split(',')[1]);
        const dataLink = `data:application/octet-stream;base64,${plainString}` //`data:${fileType.mime};,${plainString}`;
        const link = document.createElement('a');
        link.href = dataLink;
        link.download = this.encodedFile[0].name.replace('.b64.txt', '');
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
};
</script>

<style></style>
