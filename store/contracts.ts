import { Module, Mutation, VuexModule } from "vuex-module-decorators"
import { LSPConfiguration } from "../types"

@Module({ stateFactory: true, name: "contracts", namespaced: true })
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("../deployedContractConfigs.json")

  get syntheticNames(){
      return this.contractConfigs.map((config) => config.syntheticName)
  }
}
