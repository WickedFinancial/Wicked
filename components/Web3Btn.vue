<template>
  <v-btn role="button" @click.p="toggleConnectionStatus">
    <v-icon>mdiEthereum</v-icon>
    {{ btnAction }}
  </v-btn>
</template>
<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"

const web3 = namespace("web3")

@Component
export default class Web3Btn extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.Mutation
  setConnectionStatus!: (status: boolean) => void

  get btnAction() {
    return this.isConnected ? "Disconnect" : "Connect"
  }

  toggleConnectionStatus() {
    this.setConnectionStatus(!this.isConnected)
  }
}
</script>
