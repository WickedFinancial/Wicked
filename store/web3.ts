import { Module, Mutation, VuexModule } from "vuex-module-decorators"

@Module({ stateFactory: true, name: "web3", namespaced: true })
export default class web3 extends VuexModule {
  isConnected = false

  @Mutation
  setConnectionStatus(status: boolean) {
    this.isConnected = status
  }
}
