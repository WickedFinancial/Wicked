<template>
  <div v-if="isConnected">
    <v-alert v-if="onCorrectNetwork" color="green" class="mb-0" dense>
      Successfully connected to network {{ getNetworkInfo.name }}</v-alert
    >
    <v-alert v-else color="red lighten-2" class="mb-0" dense>
      The contracts for this app are currently only deployed on the
      {{ correctNetwork }} network, whereas your wallet is connected to the
      {{ getNetworkInfo.name }} network. Please change your network accordingly and reconnect.
    </v-alert>
  </div>
  <v-alert v-else color="red lighten-2" class="mb-0" dense>
    To use most features of this Dapp you will have to connect an ethereum
    wallet. Please do so by pressing the connect button on the top of the page.
  </v-alert>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"
import { ethers } from "ethers"

const web3 = namespace("web3")

@Component
export default class NetworkStatusBanner extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.State
  correctNetwork!: string

  @web3.Getter
  getNetworkInfo!: ethers.providers.Network

  @web3.Getter
  onCorrectNetwork!: boolean


}
</script>
