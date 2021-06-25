<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :clipped="clipped" fixed app>
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

      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <avow-logo id="Logo" />
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

import Web3Btn from "~/components/Web3Btn.vue"

const contracts = namespace("contracts")

const web3 = namespace("web3")

@Component({ components: { Web3Btn } })
export default class DefaultLayout extends Vue {
  @web3.State
  isConnected!: boolean

  @web3.Getter
  selectedAccount!: string

  clipped = true
  drawer = true
  menuItems = [{ icon: "mdi-apps", title: "Dashboard", to: "/" }]
  right = true
  rightDrawer = false
  title = "Avow"

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
