<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <template #activator="{ on, attrs }">
      <v-btn v-bind="attrs" color="primary" text v-on="on"> Expire</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Expire Contract</span>
      </v-card-title>
      <form>
        <v-card-text>
          Confirm that you want to expire the contract
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close"> Cancel</v-btn>

          <v-btn
            :disabled="loading"
            :loading="loading"
            color="blue darken-1"
            type="button"
            @click.prevent="expire"
          >
            Expire
            <template #loader>
              <span>Loading...</span>
            </template>
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

const contracts = namespace("contracts")

@Component
export default class expireContract extends Vue {
  dialog = false
  loading = false

  @Prop()
  contractDetails!: LSPConfiguration

  @contracts.Action
  expireContract!: (syntheticName: string) => Promise<void>

  async expire(): Promise<void> {
    try {
      this.loading = true
      await this.expireContract(this.contractDetails.syntheticName)
      this.dialog = false
    } catch (e) {
      console.error("Expiry failed with exception: ", e)
    } finally {
      this.loading = false
    }
  }

  close(): void {
    this.dialog = false
  }
}
</script>
<style scoped>
/*.stale {*/
/*  !* Release the inner Jackson Pollock *!*/
/*  border: 1px solid red;*/
/*  background-color: yellow;*/
/*}*/
</style>
