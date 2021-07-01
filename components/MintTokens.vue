<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <template #activator="{ on, attrs }">
      <v-btn v-bind="attrs" color="primary" text v-on="on"> Mint</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Mint Tokens</span>
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
                  <v-list-item-title> Required Collateral</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ collateralAmount }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-list-item>
                  <v-list-item-title> Available Collateral</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ collateralTokens }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close"> Cancel</v-btn>

          <v-btn
            v-if="collateralApproved"
            color="blue darken-1"
            type="button"
            @click.prevent="mint"
            :loading="loading"
            :disabled="loading || anyRuleViolated"
          >
            Mint
            <template #loader>
              <span>Loading...</span>
            </template>
          </v-btn>
          <v-btn
            v-else
            color="blue darken-1"
            type="button"
            @click.prevent="approve"
            :loading="loading"
            :disabled="loading || anyRuleViolated"
          >
            Approve
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
import { ethers } from "ethers"
import { LSPConfiguration } from "~/types"

const contracts = namespace("contracts")

@Component
export default class mintTokens extends Vue {
  dialog = false
  loading = false
  syntheticTokens = 0

  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  collateralTokens!: number

  @contracts.Action
  approveCollateral!: (payload: {
    collateralName: string
    syntheticName: string
  }) => Promise<void>

  @contracts.Action
  mintTokens!: (payload: {
    amount: number
    syntheticName: string
  }) => Promise<void>

  @contracts.State
  collateralAllowances!: Record<string, ethers.BigNumber>

  get collateralAmount(): number {
    return (
      this.syntheticTokens * parseFloat(this.contractDetails.collateralPerPair)
    )
  }

  get anyRuleViolated(): boolean {
    return (
      this.syntheticTokens *
        parseFloat(this.contractDetails.collateralPerPair) >
        this.collateralTokens || this.syntheticTokens <= 0
    )
  }

  get collateralApproved(): boolean {
    const synthName = this.contractDetails.syntheticName
    const collateralAllowance = this.collateralAllowances[synthName]
    if (collateralAllowance === undefined) {
      return false
    } else {
      return collateralAllowance.eq(ethers.constants.MaxUint256)
    }
  }

  get rules() {
    const enoughCollateral = (value: number): boolean | string => {
      return (
        value * parseFloat(this.contractDetails.collateralPerPair) <=
          this.collateralTokens || "Not enough collateral"
      )
    }

    const positive = (value: number): boolean | string => {
      return value > 0 || "Number of tokens must be positive"
    }

    return [positive, enoughCollateral]
  }

  async approve() {
    try {
      this.loading = true
      console.info("Approving amount of tokens: ", this.collateralAmount)
      await this.approveCollateral({
        collateralName: this.contractDetails.collateralToken,
        syntheticName: this.contractDetails.syntheticName,
      })
    } finally {
      this.loading = false
    }
  }

  async mint() {
    try {
      this.loading = true
      console.info("Minting amount of tokens: ", this.syntheticTokens)
      await this.mintTokens({
        amount: this.collateralAmount,
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
