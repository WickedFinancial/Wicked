<template>
  <v-btn role="button" @click.p="toggleConnectionStatus">
    <v-icon>mdi-plus</v-icon>
    {{ btnAction }}
  </v-btn>
</template>
<script lang="ts">
import { Vue, Component, namespace, getModule } from "nuxt-property-decorator"
import Web3modal from "web3modal"
import Web3Store from "~/store/web3"

const web3 = namespace("web3")
let web3Context: Web3Store

@Component
export default class Web3Btn extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.State
  web3Modal?: Web3modal

  @web3.Mutation
  setConnectionStatus!: (status: boolean) => void

  get btnAction() {
    return this.isConnected ? "Disconnect" : "Connect"
  }

  async toggleConnectionStatus() {
    if (this.web3Modal) {
      await this.web3Modal.connect()
      this.setConnectionStatus(!this.isConnected)
    }
  }

  created() {
    web3Context = getModule(Web3Store, this.$store)
    web3Context.setUpModal()
  }
}
</script>
