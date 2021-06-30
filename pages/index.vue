<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6">
        <h1>Borrow from DeFi<br />without the currency risk</h1>
        <h3>
          Collateralized debt positions are all the rage in Defi.
          <br />
          <p>
            Presently most systems are USD centric which presents a currency
            risk to European borrowers who may have their income denominated in
            Euro.
          </p>
        </h3>
        <br />
        <h2>Introducing Wicked Candles as a solution</h2>
        <h3>How does it work?</h3>
        <ul>
          <li>
            <v-icon medium color="gray"> mdi-piggy-bank-outline</v-icon>
            Lockup ETH and borrow LUSD. A zero interest loan with a low one time
            fee!
          </li>
          <li>
            <v-icon medium color="gray"> mdi-web</v-icon>
            Lockup some or all of that LUSD and receive a pair of ERC20 tokens.
          </li>
          <li>
            <v-icon medium color="gray"> mdi-scale-balance</v-icon>
            Before expiry, you may redeem the pair for your stable coin.
          </li>
          <li>
            <v-icon medium color="gray"> mdi-cash</v-icon>
            After expiry, the tokens may be settled individually at a rate
            determined by the upper bound and lower bound of the contract.
          </li>
          <li>
            <v-icon medium color="gray"> mdi-thumb-up</v-icon>
            Sell the long tokens and if the Euro is worth less dollars at expiry
            you profit at 5x leverage (capped at lower bound).
          </li>
        </ul>
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

li {
  list-style: none !important;
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
