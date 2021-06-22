import Vuetify from "vuetify"
import { createLocalVue, mount, MountOptions } from "@vue/test-utils"
import Vue from "vue"
import Logo from "~/components/AvowLogo.vue"

describe("Logo", () => {
  const localVue = createLocalVue()
  let vuetify: any
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const mountFunction = (options: MountOptions<Vue>) => {
    return mount(Logo, {
      localVue,
      vuetify,
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
})
