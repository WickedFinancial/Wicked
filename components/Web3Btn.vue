<template>
  <div>
    <v-btn
      :loading="loading"
      outlined
      role="button"
      text
      @click.p="connectToWeb3"
    >
      {{ btnAction }}
      <template #loader>
        <span>Loading...</span>
      </template>
    </v-btn>
  </div>
</template>
<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"

const web3 = namespace("web3")
const contracts = namespace("contracts")

@Component
export default class Web3Btn extends Vue {
  loading = false
  @web3.State
  isConnected!: boolean

  @web3.Getter
  onCorrectNetwork!: boolean

  @web3.Action
  connectWeb3!: () => Promise<void>

  @web3.Mutation
  clearProvider!: () => void

  @contracts.Action
  initializeContracts!: () => Promise<void>

  @contracts.Action
  updateContractData!: () => Promise<void>

  @contracts.Action
  clearContracts!: () => void

  get btnAction() {
    return this.isConnected ? "Disconnect" : "+ Connect"
  }

  async connect() {
    this.loading = true
    try {
      await this.connectWeb3()
      await this.initializeContracts()
      await this.updateContractData()
    } finally {
      this.loading = false
    }
  }

  clear() {
    this.clearProvider()
    this.clearContracts()
  }

  async connectToWeb3() {
    this.isConnected ? this.clear() : await this.connect()
  }
}
</script>
