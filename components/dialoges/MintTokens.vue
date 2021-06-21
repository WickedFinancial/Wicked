<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on"> Mint </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Mint Tokens</span>
        </v-card-title>
        <form @submit.prevent="submit">
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Collateral Tokens to deposit"
                    v-model="collateralTokens"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Close </v-btn>
            <v-progress-circular
              indeterminate
              color="primary"
              v-if="loading"
            ></v-progress-circular>
            <v-btn v-else color="blue darken-1" text type="submit">
              Mint
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      loading: false,
      collateralTokens: 0,
    }
  },

  methods: {
    async submit(event) {
      try {
        this.loading = true
        console.log("Minting amount of tokens: ", this.collateralTokens)
        this.dialog = false
      } finally {
        this.loading = false
      }
    },
    close() {
      this.dialog = false
    },
  },
}
</script>
<style scoped>
.stale {
  /* Release the inner Jackson Pollock */
  border: 1px solid red;
  background-color: yellow;
}
</style>
