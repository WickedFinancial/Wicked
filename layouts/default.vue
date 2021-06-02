<template>
  <v-app dark>
    <v-app-bar fixed app min-height="">
      <div id="site-title" class="text-md-h3 d-md-inline">
        {{ title }}
      </div>
      <avow-logo id="Logo" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"

@Component
export default class DefaultLayout extends Vue {
  title = "Avow"
}
</script>
