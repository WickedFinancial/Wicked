<template>
  <div v-if="isConnected">
    <v-banner v-if="onCorrectNetwork" color="green" single-line>
      Successfully connected to network {{ activeNetwork }}
      <template v-slot:actions="{ dismiss }">
        <v-btn text @click="dismiss"> Dismiss</v-btn>
      </template>
    </v-banner>
    <v-banner v-else color="red lighten-2" single-line>
      The contracts for this app are currently only deployed on the
      {{ correctNetwork }} network, whereas your wallet is connected to the
      {{ activeNetwork }} network. Please change your network accordingly and
      reconnect.
      <template v-slot:actions="{ dismiss }">
        <v-btn text @click="dismiss"> Dismiss</v-btn>
      </template>
    </v-banner>
  </div>
  <v-banner v-else color="red lighten-2" single-line>
    To use most features of this Dapp you will have to connect an ethereum
    wallet. Please do so by pressing the connect button on the top of the page.
    <template v-slot:actions="{ dismiss }">
      <v-btn text @click="dismiss"> Dismiss</v-btn>
    </template>
  </v-banner>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"

const web3 = namespace("web3")

@Component
export default class NetworkStatusBanner extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.State
  correctNetwork!: string

  @web3.State
  activeNetwork?: string

  @web3.Getter
  onCorrectNetwork!: boolean
}
</script>
