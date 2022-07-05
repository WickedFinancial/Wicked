# Wicked

This is the repo of the [wicked.financial](https://wickedfinancial.netlify.app/) dapp for
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

### Set RPC Url and Wallet Mnemonic

Some of the tasks / tests described below will require hardhat to access a kovan RPC-node and / or a wallet using the first account
in the wallet for various test / deployment tasks.

For these purposes you will have to save the url of a Kovan RPC-Node as well as a wallet mnemonic in `url.txt` and `mnemonic.txt` files at the root level of the repository.
Note that these files are added to the `.gitignore` file but you should be extra careful to NEVER commit / push these files to the repository.

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
Therefore you have to options when using the dapp:

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

While using the local network you might get errors in Metamask saying something like `Transaction Nonce too high`, in this case you will need to reset the respective
account using the button in the settings.

### Custom Hardhat Tasks

To speed up testing and allow the user to interactively step through the different phases of the contract lifecycle we
have implemented a number of custom hardhat tasks.
Note that the parameter `--network localhost` runs all of these commands on the local kovan fork but you can also run them directly on
kovan by adjusting this parameter accordingly.
However this might result in spending significant amount of ETH from the wallet whose mnemonic you have provided.

#### Generate Collateral

Creating / Minting synthetic tokens for a given contract will require you to provide the configured collateral.
To generate collateral of the respective Token (in this case LUSD) you can visit a liquity front-end on kovan:
```
### Some liquity front-ends to get some LUSD
### Remember that we are currently only on Kovan

https://eth.liquity.fi/
https://liquityapp.com/
https://app.liquity.gg/#/
```


#### Fast Forward to Expiry time (only on local network)

To forward the block timestamp to the expiry date of a contract identified by its `synthetic-name` run:

```bash
$ yarn hardhat time:expiry --synthetic-name EURUSD-210701 --network localhost
```

#### Propose Price to Optimistc Oracle

To propose a settlement price for the price feed of a given contract to the Optimistic Oracle run:

```bash
$ yarn hardhat propose --synthetic-name EURUSD-210701 --proposed-price 1.25 --network localhost
```

#### Fast Forward past Dispute Liveness (only on local network)

To fast forward the block timestamp by the default dispute liveness period of the Optimistic Oracle run:

```bash
$ yarn hardhat time:dispute --network localhost
```

#### Settle LSP Tokens (also possible in UI)

If a price has been proposed (and not disputed) and the liveness period has past you can settle synthetic tokens that you have created before

```bash
$ yarn hardhat settle:lsp --synthetic-name EURUSD-210701 --long-tokens 0 --short-tokens 0 --network localhost
```

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
