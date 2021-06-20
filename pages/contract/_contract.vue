<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6"> {{ this.contractName }}</v-col>
      <v-col cols="12" sm="8" md="6"> {{ this.contractDetails }}</v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"
import { LSPConfiguration } from "@/types"
const contracts = namespace("contracts")
@Component
export default class contract extends Vue {
  @contracts.State
  contractConfigs!: Array<LSPConfiguration>
  @contracts.Getter
  syntheticNames!: Array<string>

  get contractName(): string {
    return this.$route.params.contract
  }

  get contractDetails(): LSPConfiguration | undefined {
    return this.contractConfigs.find(
      (config) => config.syntheticName === this.contractName
    )
  }
}
</script>
