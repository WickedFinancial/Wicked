# Wicked

## Build Setup  🧐

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# generate static project
$ yarn generate

# build for production and launch server
$ yarn build
$ yarn start
```

## Run Tests 🧪
```bash
# run all tests with jest
$ yarn jest
# If making UI changes make sure to update related snapshots.
$ yarn jest -u
```

## Test Frontend Setup 🐥

We suggest the following workflow for testing which requires metamask and Kovan node access :
1. Start local network based on kovan fork with: 
   
   ```yarn hardhat node --fork KOVAN_RPC_URL --show-accounts```
  2. Copy paste the first account in the displayed list and register it in your metamask this is the deployer account which should have 10000 ETH on this network
3. In a separate terminal run the "collateral" task to deposit/mint WETH collateral to your deployer account: 

    ```yarn hardhat collateral --amount 100 --network localhost ```
4. Run the hardhat task  to generate 1 pair of Long / Short Tokens (alternatively you can set a different number of synthetic tokens to create using the amount parameter
5. Switch your metamask to the localhost network
6. Open the app connect and navigate to the respective contract, you should see the correct balances for the respective token types


For detailed explanation on how things work, check out the following resources.

## Documentation  📚

#### The giants whose shoulder we stand on

### Front End 
- [Vue 2 Docs](https://vuejs.org/v2/guide/)
- [Nuxt.js Docs](https://nuxtjs.org) 
- [Vuetify Docs](https://vuetifyjs.com/en/introduction/why-vuetify/)

### Web3/ Smart Contracts / Backend
- [UMA: The Long Short Pair](https://docs.umaproject.org/synthetic-tokens/long-short-pair)
- [Hardhat docs](https://hardhat.org/getting-started)

### Testing
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Jest Docs](https://jestjs.io/docs/api)
- [Hardhat Scripts](https://hardhat.org/guides/scripts.html)

### Linting and Styling
- [Prettier Docs](https://prettier.io/docs/en/configuration.html)
- [Eslint Docs](https://eslint.org/docs/user-guide/configuring/)
