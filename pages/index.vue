<template>
  <v-container>
    <section id="hero">
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
        </v-col>
      </v-row>
    </section>
    <section id="about">
      <div class="py-12"></div>

      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">THE PROCESS</h2>

        <v-responsive class="mx-auto mb-8" width="56">
          <v-divider class="mb-1"></v-divider>

          <v-divider></v-divider>
        </v-responsive>

        <v-responsive
          class="mx-auto title font-weight-light mb-8 text-left"
          max-width="720"
        >
          <ol>
            <li>
              Sponsors deposit collateral to mint equal amount of Long / Short
              Tokens
            </li>
            <li>
              Users trade tokens to bet on either side of the currency pair
            </li>
            <li>Contract Expires</li>
            <li>Exchange Rate is provided by oracle system</li>
            <li>
              Collateral is distributed to Long / Short Token-Holders according
              to payout function
            </li>
          </ol>
        </v-responsive>
      </v-container>

      <div class="py-12"></div>
    </section>
    <section id="about">
      <div class="py-12"></div>

      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">EXAMPLE</h2>

        <v-responsive class="mx-auto mb-8" width="56">
          <v-divider class="mb-1"></v-divider>

          <v-divider></v-divider>
        </v-responsive>

        <v-responsive
          class="mx-auto title font-weight-light mb-8 text-center"
          max-width="720"
        >
          <div class="py-12 px-4" flat>
            <div>
              <v-avatar color="green" size="68">
                <v-icon medium>mdi-piggy-bank-outline</v-icon>
              </v-avatar>
            </div>
            <p class="subtitle-1">
              <b>Sponsor</b> provides 100 LUSD collateral to mint Short / Long
              Tokens <br />
              for USD/EUR-contract with bounds 1.10 - 1.30 USD.
            </p>
          </div>
          <div flat>
            <div class="px-4 col-6 example-cards" flat>
              <div>
                <v-avatar color="blue" size="68">
                  <v-icon medium>mdi-account-outline</v-icon>
                </v-avatar>
              </div>
              <p class="subtitle-1">
                <b>User A</b> buys the Long Tokens from the Sponsor for 51 LUSD.
              </p>
            </div>
            <div class="px-4 col-6 example-cards" flat>
              <div>
                <v-avatar color="red lighten-1" size="68">
                  <v-icon medium>mdi-account-outline</v-icon>
                </v-avatar>
              </div>
              <p class="subtitle-1">
                <b>User B</b> buys the Short Tokens from the Sponsor for 51
                LUSD.
              </p>
            </div>
          </div>
          <div class="py-12 px-4" flat>
            <div>
              <v-avatar color="grey" size="68">
                <v-icon medium>mdi-timer-sand-empty</v-icon>
              </v-avatar>
            </div>
            <p class="subtitle-1">
              <b>Contract Expires</b>.<br />
              <b>Value of 1.25</b> is returned by price oracle.
            </p>
          </div>
          <div flat>
            <div class="px-4 col-6 example-cards" flat>
              <div>
                <v-avatar color="blue" size="68">
                  <v-icon medium>mdi-account-heart-outline</v-icon>
                </v-avatar>
              </div>
              <p class="subtitle-1">
                <b>Payout User A:</b><br />
                100 LUSD * (1.25-1.10)/(1.30-1.1) = 75 LUSD.
              </p>
            </div>
            <div class="px-4 col-6 example-cards" flat>
              <div>
                <v-avatar color="red lighten-1" size="68">
                  <v-icon medium>mdi-account-heart-outline</v-icon>
                </v-avatar>
              </div>
              <p class="subtitle-1">
                <b>Payout User B:</b><br />
                100 LUSD * (1.30-1.25)/(1.30-1.1) = 25 LUSD.
              </p>
            </div>
          </div>
        </v-responsive>
      </v-container>

      <div class="py-12"></div>
    </section>
    <section id="about">
      <div class="py-12"></div>

      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">WAIT BUT WHY?</h2>

        <v-responsive class="mx-auto mb-8" width="56">
          <v-divider class="mb-1"></v-divider>

          <v-divider></v-divider>
        </v-responsive>

        <v-responsive
          class="mx-auto title font-weight-light mb-8 text-left"
          max-width="720"
        >
          <ol>
            <li>Sponsors can earn returns through trading fees</li>
            <li>
              Users get leveraged exposure to the currency of their choice to:
            </li>
            <ul>
              <li>
                Hedge an existing currency risk exposure (e.g. USD income but
                EUR expenditures)
              </li>
              <li>Maximise profitability of their currency speculation</li>
            </ul>
          </ol>
        </v-responsive>
      </v-container>

      <div class="py-12"></div>
    </section>
    <section id="about">
      <div class="py-12"></div>

      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">THE TECH</h2>

        <v-responsive class="mx-auto mb-8" width="56">
          <v-divider class="mb-1"></v-divider>

          <v-divider></v-divider>
        </v-responsive>

        <v-responsive
          class="mx-auto title font-weight-light mb-8 text-left"
          max-width="720"
        >
          1. Derivative contracts based on
          <a class="tech" target="_blank" href="https://umaproject.org/">UMA</a>
          Primitives:
          <ul>
            <li>
              General Contract-Lifecycle defined by the Long-Short-Pair
              Contract:
              <a
                class="tech"
                target="_blank"
                href="https://medium.com/uma-project/introducing-umas-long-short-pair-lsp-financial-primitive-84596803864f"
                >Blogpost</a
              >,
              <a
                class="tech"
                target="_blank"
                href="https://docs.umaproject.org/synthetic-tokens/long-short-pair"
                >Documentation</a
              >,
              <a
                class="tech"
                target="_blank"
                href="https://www.youtube.com/watch?v=sPb1kOmZgbs"
                >Video-Explainer</a
              >
            </li>
            <li>
              Payout structure based on Linear Payout Library:
              <a
                class="tech"
                target="_blank"
                href="https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol"
                >GitHub</a
              >
            </li>
            <li>
              Price feeds provided through Optimistic-Oracle:
              <a
                class="tech"
                target="_blank"
                href="https://docs.umaproject.org/getting-started/oracle"
                >Documentation</a
              >
            </li>
          </ul>

          2.
          <a class="tech" target="_blank" href="https://www.liquity.org/"
            >Liquity</a
          >
          (LUSD) used as collateral stable-coin for contracts
        </v-responsive>
      </v-container>

      <div class="py-12"></div>
    </section>
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
.v-application .title {
  font-size: 1.1rem !important;
}
.example-cards {
  float: left;
}
a.tech {
  color: #90caf9 !important;
  caret-color: #f4f4f4 !important;
}
</style>
