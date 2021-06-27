<template>
  <v-app id="app" dark>
    <v-navigation-drawer
      v-model="drawer"
      class="navigationdrawer"
      :clipped="clipped"
      stateless
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-text="title" />
      <wicked-logo id="Logo" />
      <v-spacer />
      {{ selectedAccount }}
      <web3-btn></web3-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, namespace, Vue } from "nuxt-property-decorator"

const contracts = namespace("contracts")

const web3 = namespace("web3")

@Component
export default class DefaultLayout extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.Getter
  selectedAccount!: string

  clipped = true
  drawer = false
  menuItems = [{ icon: "mdi-home", title: "Home", to: "/" }]

  title = "Wicked Financial"

  @contracts.Getter
  syntheticNames!: Array<string>

  get items(): Array<object> {
    const contractItems = this.syntheticNames.map((syntheticName) => {
      return {
        icon: "mdi-file-document-edit-outline",
        title: syntheticName,
        to: `/contract/${syntheticName}`,
      }
    })
    return this.menuItems.concat(contractItems)
  }
}
</script>

<style type="text/css" scoped>
header {
  background: transparent !important;
  box-shadow: none !important;
}

.navigationdrawer {
  background: rgba(0, 0, 0, 0.3);
  padding-top: 15px;
}
</style>
