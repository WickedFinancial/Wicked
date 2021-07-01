<template>
  <v-container v-if="contractDetails">
    <contract-summary
      :contract-details="contractDetails"
      :contract-name="contractName"
      :contract-state="contractState"
    />
    <contract-tokens
      v-if="contractState !== undefined"
      :contract-details="contractDetails"
      :contract-state="contractState"
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

@Component<Contract>({
  beforeMount() {
    if (!this.$route.params.contract || !this.contractDetails) {
      this.$router.replace("/")
    }
  },
})
export default class Contract extends Vue {
  @contracts.State
  contractConfigs!: Array<LSPConfiguration>

  @contracts.State
  contractStatuses!: Record<string, number>

  get contractState(): number | undefined {
    return this.contractStatuses[this.contractName]
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
