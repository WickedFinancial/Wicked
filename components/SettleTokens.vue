<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" text v-bind="attrs" v-on="on"> Settle</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Settle Tokens</span>
      </v-card-title>
      <form>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="longTokens"
                  label="Long Tokens to settle"
                  type="number"
                  :rules="rulesLong"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="shortTokens"
                  label="short Tokens to settle"
                  type="number"
                  :rules="rulesShort"
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
            @click.prevent="settle"
            :loading="loading"
            :disabled="loading || anyRuleViolated"
          >
            Settle
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
export default class SettleTokens extends Vue {
  dialog = false
  loading = false
  longTokens = 0
  shortTokens = 0

  @Prop()
  contractDetails!: LSPConfiguration

  @contracts.Action
  settleTokens!: (payload: {
    longTokens: number
    shortTokens: number
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
    const tokenBalances =
      this.getSyntheticTokenBalances[this.contractDetails.syntheticName]
    return (
      this.longTokens > tokenBalances.longTokens ||
      this.longTokens < 0 ||
      this.shortTokens > tokenBalances.shortTokens ||
      this.shortTokens < 0
    )
  }

  get rulesShort() {
    const tokenBalances =
      this.getSyntheticTokenBalances[this.contractDetails.syntheticName]
    function enoughTokens(value: number): boolean | string {
      return value <= tokenBalances.shortBalance || "Not enouth tokens"
    }
    function positive(value: number): boolean | string {
      return value > 0 || "Number of tokens must be positive"
    }
    return [positive, enoughTokens]
  }

  get rulesLong() {
    const tokenBalances =
      this.getSyntheticTokenBalances[this.contractDetails.syntheticName]
    function enoughTokens(value: number): boolean | string {
      return value <= tokenBalances.longBalance || "Not enouth tokens"
    }
    function positive(value: number): boolean | string {
      return value > 0 || "Number of tokens must be positive"
    }
    return [positive, enoughTokens]
  }

  async settle() {
    try {
      this.loading = true
      await this.settleTokens({
        longTokens: this.longTokens,
        shortTokens: this.shortTokens,
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
