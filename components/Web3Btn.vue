<template>
  <div>
    <v-btn role="button" @click.p="connectToWeb3">
      <v-icon>mdi-plus</v-icon>
      {{ btnAction }}
    </v-btn>
  </div>
</template>
<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"

const web3 = namespace("web3")
const contracts = namespace("contracts")

@Component
export default class Web3Btn extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.Action
  connectWeb3!: () => Promise<void>

  @web3.Action
  registerListeners!: () => Promise<void>

  @web3.Mutation
  clearProvider!: () => void

  @contracts.Action
  initializeContracts!: () => Promise<void>

  @contracts.Action
  updateTokenBalances!: () => Promise<void>

  get btnAction() {
    return this.isConnected ? "Disconnect" : "Connect"
  }

  async connect() {
    await this.connectWeb3()
    await this.registerListeners()
    await this.initializeContracts()
    await this.updateTokenBalances()
  }

  clear() {
    this.clearProvider()
  }

  async connectToWeb3() {
    this.isConnected ? this.clear() : await this.connect()
  }
}
</script>
