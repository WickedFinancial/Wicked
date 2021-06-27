<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6">
        <h1>Earn DeFi yields <br />without the currency risk</h1>
        <h3>Get rewards from your favourite yearn pool in your local currency <br /> instead of USD
          and avoid exposure to dollar fluctuations.</h3>
      <ul>
        <li>
          <v-icon
            medium
            color="gray"
          >
            mdi-web
          </v-icon>
          Any standard ERC20 token
        </li>
        <li>
          <v-icon
            medium
            color="gray"
          >
            mdi-sync
          </v-icon>
          Insure or provide insurance
        </li>
        <li>
          <v-icon
            medium
            color="gray"
          >
            mdi-thumb-up
          </v-icon>
          No currency risk
        </li>
      </ul>
        <v-btn
          class="use-app"
          outlined
          to="/app"
        >
          Use App <v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>
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
ul{
  margin-top:10px;
}
li{
  list-style: none !important;
  padding: 10px 0;
}
li i{
  padding-right: 10px;
}
.use-app{
  margin: 30px 0 !important;
}
#app{
  background: -webkit-radial-gradient(bottom right, #0eb035, #172733) !important;
  background: -moz-radial-gradient(bottom right, #0eb035, #172733) !important;
  background: radial-gradient(to top left, #0eb035, #172733) !important;
}
</style>
