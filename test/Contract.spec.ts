import Vuetify from "vuetify"
import { createLocalVue, mount, MountOptions } from "@vue/test-utils"
import { Store } from "vuex"
import Vue from "vue"
import Contract from "~/pages/contract/_contract.vue"
import contracts from "~/store/contracts"

describe("Contracts component", () => {
  const localVue = createLocalVue()
  let vuetify: any
  const $route = {
    params: { contract: "USDETH-Linear-210701" },
  }
  let store: Store<any>

  beforeEach(() => {
    vuetify = new Vuetify()
    store = new Store({ modules: { contracts } })
  })
  const mountFunction = (options: MountOptions<Vue>) => {
    return mount(Contract, {
      localVue,
      vuetify,
      store,
      mocks: {
        $route,
      },
      ...options,
    })
  }

  it("should mount properly", () => {
    const wrapper = mountFunction({})
    expect(wrapper.exists()).toBe(true)
  })

  it("should match snapshot", () => {
    const wrapper = mountFunction({
      mocks: {
        $route,
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
