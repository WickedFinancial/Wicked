<template>
  <v-container>
    <contract-summary
      :contractDetails="contractDetails"
      :contractName="contractName"
      :contractState="contractState"
    />
    <contract-tokens
      v-if="contractState !== undefined"
      :contractDetails="contractDetails"
      :contractState="contractState"
    />
    <price-dashboard
      v-if="contractState === undefined || contractState === 0"
      :contractDetails="contractDetails"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

const contracts = namespace("contracts")

@Component
export default class Contract extends Vue {
  @contracts.State
  contractConfigs!: Array<LSPConfiguration>

  @contracts.Getter
  getContractStatuses!: Record<string, number>

  get contractState(): number | undefined {
    return this.getContractStatuses[this.contractName]
  }

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
