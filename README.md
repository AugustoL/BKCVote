# BKCVote

Blockchain web app, vote safely over a custom ethereum blockchain.

## How it works

In order to work the app needs to be connected to an ethereum node, this node can be mining or not, you need it to be mining or connected with peers if you want to get your transactions processed.
There is an example network that you can use to see the results of a simulated election of 100 persons, for this you will need to run `npm start` and `npm run geth-console-example` commands together.

## Install

`git clone https://github.com/AugustoL/BKCVote --recursive`

`npm install`

##Submodules

### Go-Ethereum

If you need to use the blockchain operations you can build from source the go-ethereum app, follow the instructions here: https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum

### Solcompiler-js

Is an app that runs a script that build teh contracts.json file, for more information go here: https://github.com/AugustoL/solcompiler-js

To use solcompiler-js you will need to set config.json file inside the solcompiler-js folder, specifying the output file and contracts folder, example:

```
{
    "output": "/home/augusto/BKCVote/src/contracts.json",
    "contractsDir": "/home/augusto/BKCVote/contracts/"
}
```
## Blockchain Operations

#### Console

This command will gave you access to the geth console, to run this you need to at least have one account generated.

`npm run geth-console`

#### Init

Run this command only once and before you start mining, this will init the blockchain with you genesis.json.

`npm run bkc-init`

#### Mine

`npm run bkc-mine`

You should be running this command meanwhile the app is running, this will mine the transactions on your private network.

#### Accounts

`npm run bkc-accounts [QUANTITY_TO_GENERATE]`

This task create the amount of accounts requested in the same way it does on the app, all the accounts are saved in the accounts.json file inside the blockchain folder, it will also create an admin account that will be use as admin on the simulation of election on the app.

#### Clean

`npm run bkc-clean`

This command will delete all the blockchain data, use it if you want to start a new blockchain from genesis block, after running this command you will need to init the blockchain before start mining with `npm run bkc-init && npm run bkc-mine`.

## Create Simulated Election

1. Remove all content on blockchain/geth folder, generate the accounts, init the genesis block and start mining:

`npm bkc-clean && npm bkc-accounts 10 && npm bkc-init && npm bkc-mine`

2. Go to the simulate view, you only will be able to add the voters, postulants ans set verifiers when teh stage of the election is 0.

3. Open the console on browser dev tools, deploy the contract, create the accounts, add the voters, postulants and set the verifiers. Simulate the election when the voter as and postulant are added with their verifiers, take in mind you have thange the state of the elction before and after simulate and verify the votes, once the election is done you can view the results.

## Develop

Run `npm start` to develop and enable the hot reloading.

## Build

Run `npm run build` to build the production version.

## TO DO

- [x] Production example using testnet.
- [x] Seed voters and verifiers accounts with the minimum and necessary balance using send() from main contract.
- [ ] Smart Contract for a voter, with restricted access and only able to send founds to a valid contract.
- [ ] Smart Contract to manage the valid contracts of the app and know if the contract address belong to the BKCVote app.
- [ ] Better storage/encryption of the votes, right now they are stored on a private variable inside the contract data.
- [ ] Support more languages.
- [ ] Better documentation.

### Donations

Bictoin:  1Cf3mkzNicq57hqP9jMEGbTfvtJnMfAKe6

Ethereum: 0x089a9b6915f3ddf987010A0a56045469DBaACB2C
