import Vuetify from "vuetify"
import { createLocalVue, mount, MountOptions } from "@vue/test-utils"
import { Store } from "vuex"
import { getModule } from "nuxt-property-decorator"
import Vue from "vue"
import Web3Btn from "~/components/Web3Btn.vue"
import { createStore } from "~/test/setup"
import web3 from "~/store/web3"

describe("Web3Btn", () => {
  const localVue = createLocalVue()
  let vuetify: any
  let store: Store<any>

  beforeEach(() => {
    vuetify = new Vuetify()
    store = createStore({ modules: { web3 } })
  })
  const mountFunction = (options: MountOptions<Vue>) => {
    return mount(Web3Btn, {
      localVue,
      vuetify,
      store,
      ...options,
    })
  }

  it("should mount properly", () => {
    const wrapper = mountFunction({})
    expect(wrapper.exists()).toBe(true)
  })

  it("should match snapshot", () => {
    const wrapper = mountFunction({})
    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should try to initialize the ", async () => {
    // Todo mock connection to web3
    const wrapper = mountFunction({})
    const btn = wrapper.find('[role="button"]')
    const web3Store = getModule(web3, store)
    await btn.trigger("click")
    expect(web3Store.modalInitializing).toBe(true)
  })
})
