<template>
  <div>
    <v-btn role="button" @click.p="connectToWeb3">
      <v-icon>mdi-plus</v-icon>
      {{ btnAction }}
    </v-btn>
  </div>
</template>
<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"

const web3 = namespace("web3")

@Component
export default class Web3Btn extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.Action
  connectWeb3!: () => void

  @web3.Mutation
  clearProvider!: () => void

  get btnAction() {
    return this.isConnected ? "Disconnect" : "Connect"
  }

  async connect() {
    await this.connectWeb3()
  }

  clear() {
    this.clearProvider()
  }

  async connectToWeb3() {
    this.isConnected ? this.clear() : await this.connect()
  }
}
</script>
