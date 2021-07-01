<template>
  <v-container v-if="contractDetails">
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
  </v-container>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

const contracts = namespace("contracts")

@Component({
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
