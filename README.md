# Wicked

This is the repo of the [wicked.financial](https://wicked.financial/) dapp for
creating, redeeming and settling synthetich tokens based on UMA
[LSP](https://medium.com/uma-project/introducing-umas-long-short-pair-lsp-financial-primitive-84596803864f) (Long Short Position)
contracts.

## Use Case

The LSP contracts are a financial primitive that allow the user to build a variety of different derivatives by choosing the corresponding configuration parameters.
We are currently focusing on a configuration that allows the user to achieve a
leveraged exposure to exchange rate changes between fiat currencies (i.e.
EUR/USD) while providing a (potentially interest yielding) Stable-Coin token as collateral.

The ultimate goal is to enable people around the world to easily hedge their foreign currency risk in a distributed and permission-less way.

Using the LSP contract for this purpose allows users to:

1. Avoid liquidation risk / management effort
2. Trade Long and Short Positions as individual tokens on secondary markets

## Development Setup

### Install Requirements

Assuming you have `Node(v14.x)` and `Yarn (v1.22)` installed you should be able to install
all other dependencies using:

```bash
$ yarn install
```

### Run Tests 🧪
The project contains a number of tests regarding the dapp itself as well as the UMA contract interfaces that we use which you can run with:

```bash
$ yarn test
```

### Run Dev Server

Run a development `Nuxt` server with hot reload to serve the Dapp at [localhost:300](http://localhost:3000/):

```bash
$ yarn dev
```

### Build / Run Prod Server

```bash
# generate static project
$ yarn generate

# build for production and launch server
$ yarn build
$ yarn start
```


## Using the Dapp 🐥

Currently the relevant contract instances for the Dapp are only deployed on the Kovan-testnet.
Therefore you have to options when using / manually testing the dapp:
1. Connect to Kovan directly
2. Run a local fork of Kovan and connect to that

In both cases we suggest using the [Metamask](https://metamask.io/) browser wallet.
All steps below should work identicially wether you use a locally hosted version of the dapp or the one hosted at [wicked.financial](https://wicked.financial/).

### Connect to Kovan directly

For this option all you have to do is switch your metamask wallet to the Kovan network and start using the dapp.

### Run local Kovan fork

If you want to have unlimited test ETH and extended control over the state of the network (i.e. setting timestamps) you might
want to fork the Kovan network and run a local copy.

You can achieve this by running the following hardhat command replacing `KOVAN_RPC_URL` with the URL of a Kovan RPC provider such as [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/).
```bash
$ yarn hardhat node --fork KOVAN_RPC_URL --show-accounts`
```
We recommend to provide an RPC that allows archive access to avoid unnecessary transaction errors.
The above command should show a number of accounts each of which should contain 10000 ETH on the local network.
To setup your Metamask for this local network you should first conn
1. Add a new network with RPC-URL: `http://localhost:8545` and Chain-ID:`42`
2. Add the first account shown by above hardhat command using its private key.

### Custom Hardhat Tasks







We suggest the following workflow for testing which requires metamask and Kovan node access :

1. Start local network based on kovan fork with:

   `yarn hardhat node --fork KOVAN_RPC_URL --show-accounts`

2. Copy paste the first account in the displayed list and register it in your metamask this is the deployer account which should have 10000 ETH on this network
3. In a separate terminal run the "collateral" task to deposit/mint WETH collateral to your deployer account:

   `yarn hardhat collateral --amount 100 --network localhost `

4. Run the hardhat task to generate 1 pair of Long / Short Tokens (alternatively you can set a different number of synthetic tokens to create using the amount parameter
5. Switch your metamask to the localhost network
6. Open the app connect and navigate to the respective contract, you should see the correct balances for the respective token types

For detailed explanation on how things work, check out the following resources.

## Documentation 📚

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
