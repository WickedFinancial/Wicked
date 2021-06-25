<template>
  <v-container>
    <contract-summary
      :contractDetails="contractDetails"
      :contractName="contractName"
    />
    <contract-tokens
      :contractDetails="contractDetails"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

import ContractSummary from "@/components/ContractSummary.vue"
import ContractTokens from "@/components/ContractTokens.vue"

const contracts = namespace("contracts")

@Component({ components: { ContractSummary, ContractTokens } })
export default class Contract extends Vue {
  @contracts.State
  contractConfigs!: Array<LSPConfiguration>

  get contractDetails(): LSPConfiguration | undefined {
    return this.contractConfigs.find(
      (config) => config.syntheticName === this.contractName
    )
  }

  get contractName(): string {
    return this.$route.params.contract
  }
}
</script>
