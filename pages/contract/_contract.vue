<template>
  <v-container>
    <contract-summary
      :contractDetails="contractDetails"
      :contractName="contractName"
    />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"
import { LSPConfiguration } from "@/types"
import ContractSummary from "@/components/ContractSummary.vue"
const contracts = namespace("contracts")

@Component({ components: { ContractSummary } })
export default class contract extends Vue {
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
