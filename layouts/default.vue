<template>
  <v-app id="app" dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      app
      class="navigationdrawer"
      stateless
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
    <v-app-bar :clipped-left="clipped" app fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-text="title" />
      <wicked-logo id="Logo" />
      <v-spacer />
      <div v-if="isConnected" :title="selectedAccount" class="connected">
        Connected: {{ selectedAccount }}
      </div>
      <web3-btn></web3-btn>
    </v-app-bar>

    <v-main>
      <NetworkStatusBanner />
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

  @web3.State
  selectedAccount!: string

  clipped = true
  drawer = false
  menuItems = [{ icon: "mdi-home", title: "Home", to: "/" }]

  title = "Wicked"

  @contracts.Getter
  syntheticNames!: Array<string>

  get items(): Array<object> {
    const contractItems = this.syntheticNames.map((syntheticName) => {
      return {
        icon: "mdi-candle",
        title: syntheticName,
        to: `/contract/${syntheticName}`,
      }
    })
    return this.menuItems.concat(contractItems)
  }
}
</script>

<style scoped>
header {
  background: #151e2a !important;
  box-shadow: none !important;
}

.navigationdrawer {
  background: rgba(0, 0, 0, 0.3);
  padding-top: 15px;
}

#app {
  background: #151e2a !important;
  background: linear-gradient(to top left, #295059, #151e2a) !important;
}

.connected {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #ffffff11;
  margin: 0 10px;
  padding: 6px 15px;
  border-radius: 15px;
  cursor: pointer;
}
</style>
