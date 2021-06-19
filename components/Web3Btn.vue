<template>
  <v-btn role="button" @click.p="toggleConnectionStatus">
    <v-icon>mdiEthereum</v-icon>
    {{ connectionStatus }}
  </v-btn>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator"

@Component
export default class Web3Btn extends Vue {
  isConnected = false

  get connectionStatus() {
    return this.isConnected ? "Disconnect" : "Connect"
  }

  set connectionStatus(isConnected: boolean) {
    this.isConnected = isConnected
  }

  toggleConnectionStatus() {
    this.connectionStatus = !this.isConnected
  }
}
</script>
<style scoped></style>
