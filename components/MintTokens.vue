<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template #activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on"> Mint</v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Mint Tokens</span>
        </v-card-title>
        <form @submit.prevent="mint">
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="syntheticTokens"
                    label="Synthetic Tokens to create"
                    type="number"
                    :rules="rules"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-list-item>
                    <v-list-item-title> Required Collateral</v-list-item-title>
                    <v-list-item-subtitle
                      >{{ collateralAmount }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel</v-btn>

            <div v-if="approved">
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="primary"
              ></v-progress-circular>
              <v-btn v-else color="blue darken-1" text type="submit">
                Mint
              </v-btn>
            </div>

            <div v-else>
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="primary"
              ></v-progress-circular>
              <v-btn
                v-else
                color="blue darken-1"
                text
                type="button"
                @click.prevent="approve"
              >
                Approve
              </v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

@Component
export default class mintTokens extends Vue {
  dialog = false
  loading = false
  approved = false
  syntheticTokens = 0

  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  collateralTokens!: number

  get collateralAmount(): number {
    return (
      this.syntheticTokens * parseFloat(this.contractDetails.collateralPerPair)
    )
  }

  get rules() {
      let self = this;
    function enoughCollateral(value: number): boolean | string {
      return (
        (value * parseFloat(self.contractDetails.collateralPerPair) <=
        self.collateralTokens) || "Not enough collateral"
      )
    }
    return [enoughCollateral]
  }

  approve() {
    try {
      this.loading = true
      console.info("Approving amount of tokens: ", this.collateralAmount)
      this.approved = true
    } finally {
      this.loading = false
    }
  }

  mint() {
    try {
      this.loading = true
      console.info("Minting amount of tokens: ", this.syntheticTokens)
      this.dialog = false
      this.approved = false
    } finally {
      this.loading = false
    }
  }

  close() {
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
