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
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from "Vuex"
export default {
  data() {
    return {
      clipped: true,
      drawer: true,
      right: true,
      rightDrawer: false,
      title: "Avow",
    }
  },
  computed: {
    ...mapGetters("contracts", ["syntheticNames"]),
    items() {
      let menuItems = [
        {
          icon: "mdi-apps",
          title: "Dashboard",
          to: "/",
        },
      ]
      const contractItems = this.syntheticNames.map((syntheticName) => {
        return {
          icon: "mdi-file-document-edit-outline",
          title: syntheticName,
          to: "/",
        }
      })
      return menuItems.concat(contractItems)
    },
  },
}
</script>
