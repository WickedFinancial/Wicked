<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" text v-bind="attrs" v-on="on"> Redeem</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Redeem Tokens</span>
      </v-card-title>
      <form>
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
                  <v-list-item-title> Available Token Pairs</v-list-item-title>
                  <v-list-item-subtitle>{{ tokenPairs }} </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close"> Cancel</v-btn>

          <v-btn
            color="blue darken-1"
            type="button"
            @click.prevent="redeem"
            :loading="loading"
            :disabled="loading || anyRuleViolated"
          >
            Redeem
            <template v-slot:loader>
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
import { SyntheticTokenBalances, LSPConfiguration } from "~/types"
import { ethers } from "ethers"

const contracts = namespace("contracts")

@Component
export default class RedeemTokens extends Vue {
  dialog = false
  loading = false
  syntheticTokens = 0

  @Prop()
  contractDetails!: LSPConfiguration

  @contracts.Action
  redeemTokens!: (payload: {
    amount: number
    syntheticName: string
  }) => Promise<void>

  @contracts.Getter
  getSyntheticTokenBalances!: Record<string, SyntheticTokenBalances>

  get tokenPairs(): number {
    const tokenBalances =
      this.getSyntheticTokenBalances[this.contractDetails.syntheticName]
    if (tokenBalances === undefined) return 0
    else {
      console.log("Balances: ", tokenBalances)
      return Math.min(tokenBalances.shortBalance, tokenBalances.longBalance)
    }
  }

  get anyRuleViolated(): boolean {
    return this.syntheticTokens > this.tokenPairs || this.syntheticTokens <= 0
  }

  get rules() {
    let self = this
    function enoughCollateral(value: number): boolean | string {
      return value <= self.tokenPairs || "Not enough pairs of synthetic tokens"
    }
    function positive(value: number): boolean | string {
      return value > 0 || "Number of tokens must be positive"
    }
    return [positive, enoughCollateral]
  }

  async redeem() {
    try {
      this.loading = true
      console.info("Redeeming amount of tokens: ", this.syntheticTokens)
      await this.redeemTokens({
        amount: this.syntheticTokens,
        syntheticName: this.contractDetails.syntheticName,
      })
      this.dialog = false
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
