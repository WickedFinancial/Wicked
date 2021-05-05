/* eslint-disable import/no-duplicates */
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue/types/vue' {
  import { accessorType } from '~/store'

  interface Vue {
    $accessor: typeof accessorType
  }
}

declare module '@nuxt/types' {
  import { accessorType } from '~/store'

  interface NuxtAppOptions {
    $accessor: typeof accessorType
  }
}
