<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6">
        <h1>DeFi Currency Hedging<br />made simple</h1>
        <h3>
          Manage exchange rate risk using Wicked derivatives.
          <br />
        </h3>
        <br />
        <h2>Benefits</h2>
        <ul>
          <li>
            <v-icon medium color="gray"> mdi-scale-balance</v-icon>
            Tokenized long / short positions on Exchange Rates (e.g. EUR/USD)
          </li>
          <li>
            <v-icon medium color="gray"> mdi-cash</v-icon>
            Capital efficiency through leveraged payout structure
          </li>
          <li>
            <v-icon medium color="gray"> mdi-piggy-bank-outline</v-icon>
            No Liquidation risk for Liquidity Providers
          </li>
        </ul>

        <br />
        <h2>The Process</h2>
        <ol>
          <li>
            Sponsors deposit collateral to mint equal amount of Long / Short
            Tokens
          </li>
          <li>Users trade tokens to bet on either side of the currency pair</li>
          <li>Contract Expires</li>
          <li>Exchange Rate is provided by oracle system</li>
          <li>
            Collateral is distributed to Long / Short Token-Holders according to
            payout function
          </li>
        </ol>

        <br />
        <h2>Example: </h2>
        <ol>
          <li>
            Sponsor provides 100 LUSD collateral to mint Short / Long Tokens for USD/EUR-contract with bounds 1.10 - 1.30 USD.
          </li>
          <li>User A buys the Long Tokens from the Sponsor for 51 LUSD</li>
          <li>User B buys the Short Tokens from the Sponsor for 51 LUSD</li>
          <li>Contract Expires</li>
          <li>Value of 1.25 is returned by price oracle</li>
          <li>
            Payout User A: 100 LUSD * (1.25-1.10)/(1.30-1.1) = 75 LUSD 
          </li>
          <li>
            Payout User B: 100 LUSD * (1.30-1.25)/(1.30-1.1) = 25 LUSD 
          </li>
        </ol>

        <br />
        <h2>Wait but why? </h2>
        <ol>
          <li>
            Sponsors can earn returns through trading fees
          </li>
          <li>Users get leveraged exposure to the currency of their choice to:</li>
          <ol>
            <li>Hedge an existing currency risk exposure (e.g. USD income but EUR expenditures)</li>
            <li>Maximise profitability of their currency speculation</li>
          </ol>
        </ol>



      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator"

@Component
export default class Index extends Vue {}
</script>
<style type="text/css">
ul {
  margin-top: 20px;
}
ol {
  margin-top: 20px;
}

ul li {
  list-style: none !important;
  padding: 10px 0;
}

ol li {
  padding: 10px 0;
}

li i {
  padding-right: 10px;
}

h1 {
  font-weight: bolder;
  font-size: 46px;
  padding: 30px 0;
  line-height: 55px;
}

h3 {
  font-weight: 300;
  font-size: 18px;
}

h1,
h3 {
  background: -webkit-linear-gradient(left, #fff, #cbfdfd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
