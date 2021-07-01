<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6">
        <h1>DeFi Currency Hedging<br />made simple</h1>
        <h3>
          Manage exchange rate risk using on-chain derivatives.
          <br />
        </h3>
        <br />
        <h2>Benefits</h2>
        <ul>
          <li>
            <v-icon medium color="gray"> mdi-ethereum</v-icon>
            Trade long/short positions on Exchange Rates (e.g. EUR/USD) as
            ERC-20 tokens
          </li>
          <li>
            <v-icon medium color="gray"> mdi-percent-outline</v-icon>
            Capital efficiency through leveraged payout structure
          </li>
          <li>
            <v-icon medium color="gray"> mdi-safe</v-icon>
            No Liquidation risk for Liquidity Providers
          </li>
          <li>
            <v-icon medium color="gray"> mdi-exit-run</v-icon>
            Retrieve collateral pre-expiry by burning long/short token-pairs
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
        <h2>Example:</h2>
        <ol>
          <li>
            Sponsor provides 100 LUSD collateral to mint Short / Long Tokens for
            USD/EUR-contract with bounds 1.10 - 1.30 USD.
          </li>
          <li>User A buys the Long Tokens from the Sponsor for 51 LUSD</li>
          <li>User B buys the Short Tokens from the Sponsor for 51 LUSD</li>
          <li>Contract Expires</li>
          <li>Value of 1.25 is returned by price oracle</li>
          <li>Payout User A: 100 LUSD * (1.25-1.10)/(1.30-1.1) = 75 LUSD</li>
          <li>Payout User B: 100 LUSD * (1.30-1.25)/(1.30-1.1) = 25 LUSD</li>
        </ol>

        <br />
        <h2>Wait but why?</h2>
        <ol>
          <li>Sponsors can earn returns through trading fees</li>
          <li>
            Users get leveraged exposure to the currency of their choice to:
          </li>
          <ul>
            <li>
              Hedge an existing currency risk exposure (e.g. USD income but EUR
              expenditures)
            </li>
            <li>Maximise profitability of their currency speculation</li>
          </ul>
        </ol>

        <br />
        <h2>The technology</h2>
        <ol>
          <li>
            Derivative contracts based on
            <a href="https://umaproject.org/">UMA</a> Primitives:
          </li>
          <ul>
            <li>
              General Contract-Lifecycle defined by the Long-Short-Pair
              Contract:
              <a
                href="https://medium.com/uma-project/introducing-umas-long-short-pair-lsp-financial-primitive-84596803864f"
                >Blogpost</a
              >,
              <a
                href="https://docs.umaproject.org/synthetic-tokens/long-short-pair"
                >Documentation</a
              >,
              <a href="https://www.youtube.com/watch?v=sPb1kOmZgbs"
                >Video-Explainer</a
              >
            </li>
            <li>
              Payout structure based on Linear Payout Library:
              <a
                href="https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol"
                >github</a
              >
            </li>
            <li>
              Price feeds provided through Optimistic-Oracle:
              <a href="https://docs.umaproject.org/getting-started/oracle"
                >Documentation</a
              >,
            </li>
          </ul>

          <li>
            <a href="https://www.liquity.org/">Liquity</a>(LUSD) used as
            collateral stable-coin for contracts
          </li>
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
