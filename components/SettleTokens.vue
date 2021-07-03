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
                  <v-list-item-title> Expiry Price</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ expiryPrice }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-list-item>
                  <v-list-item-title> Collateral / Long</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ collateralPerLong }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-list-item>
                  <v-list-item-title> Collateral / Short</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ collateralPerShort }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-list-item>
                  <v-list-item-title> Returned Collateral</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ returnedCollateral }}
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
            color="blue darken-1"
            type="button"
            :loading="loading"
            :disabled="loading || anyRuleViolated"
            @click.prevent="settle"
          >
            Settle
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
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { ExpiryData, LSPConfiguration, SyntheticTokenBalances } from "~/types"

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

  @contracts.State
  syntheticTokenBalances!: Record<string, SyntheticTokenBalances>

  @contracts.State
  expiryData!: Record<string, ExpiryData>

  get returnedCollateral(): number {
    return (
      (this.collateralPerShort || 0) * this.shortTokens +
      (this.collateralPerLong || 0) * this.longTokens
    )
  }

  get collateralPerShort(): number | undefined {
    const synthExpiry = this.expiryData[this.contractDetails.syntheticName]
    const percentagePerLong: number = synthExpiry.percentageLong
    const percentagePerShort = 1 - percentagePerLong
    return (
      percentagePerShort * parseFloat(this.contractDetails.collateralPerPair)
    )
  }

  get collateralPerLong(): number | undefined {
    const synthExpiry = this.expiryData[this.contractDetails.syntheticName]
    const percentagePerLong: number = synthExpiry.percentageLong
    return (
      percentagePerLong * parseFloat(this.contractDetails.collateralPerPair)
    )
  }

  get expiryPrice(): string | undefined {
    return formatUnits(
      parseUnits(
        this.expiryData[this.contractDetails.syntheticName].price.toString(),
        "wei"
      )
    )
  }

  get anyRuleViolated(): boolean {
    const synthName = this.contractDetails.syntheticName
    const tokenBalances = this.syntheticTokenBalances[synthName]
    return (
      this.longTokens > tokenBalances.longBalance ||
      this.longTokens < 0 ||
      this.shortTokens > tokenBalances.shortBalance ||
      this.shortTokens < 0
    )
  }

  get rulesShort() {
    const synthName = this.contractDetails.syntheticName
    const tokenBalances = this.syntheticTokenBalances[synthName]

    function enoughTokens(value: number): boolean | string {
      return value <= tokenBalances.shortBalance || "Not enough tokens"
    }

    function positive(value: number): boolean | string {
      return value >= 0 || "Number of tokens must be non-negative"
    }

    return [positive, enoughTokens]
  }

  get rulesLong() {
    const synthName = this.contractDetails.syntheticName
    const tokenBalances = this.syntheticTokenBalances[synthName]

    function enoughTokens(value: number): boolean | string {
      return value <= tokenBalances.longBalance || "Not enouth tokens"
    }

    function positive(value: number): boolean | string {
      return value >= 0 || "Number of tokens must be non-negative"
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
    } catch (e) {
      console.error("Settlement failed with exception: ", e)
    } finally {
      this.loading = false
    }
  }

  close() {
    this.dialog = false
  }
}
</script>
