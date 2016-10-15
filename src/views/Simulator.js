import React from 'react';
import {Link} from "react-router";

import async from 'async';
import Store from "../Store";
import Chance from 'chance';
var chance = new Chance();

import * as Actions from "../actions";
import Loader from "../components/Loader";

var appAccounts = JSON.parse(require('../../blockchain/accounts.json'));

var contracts = JSON.parse(require('../contracts.json'));

export default class Simulator extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            deployed: (Store.contract.address == "") ? false : true,
            delpoyedAddress: Store.contract.address,
            blockStart: 3500,
            blockEnd: 4000,
            electionName: 'Test Election',
            amountAccounts: 5,
            address: "",
            privateKey: "",
            accounts: Store.accounts || []
        }
    }

    componentWillMount() {
        var self = this;
        self.setState({
            address: appAccounts.admin.address,
            privateKey: appAccounts.admin.privateKey
        });
    }

    deploy(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Deploying Contract'});
        var compiled = Store.web3.eth.compile.solidity(contracts.BKCVote.source)
        Actions.Ethereum.deployContract(
            self.state.privateKey,
            self.state.address,
            compiled.BKCVote.code,
            compiled.BKCVote.info.abiDefinition,
            [
                self.state.electionName,
                self.state.blockStart,
                self.state.blockEnd
            ],
            0,
            function(err, receipt){
                if (err){
                    console.error(err);
                    self.setState({loading: false});
                } else {
                    Actions.Store.setContract(receipt.contractAddress, compiled.BKCVote.info.abiDefinition);
                    if (callback){
                        self.setState({deployed: true, delpoyedAddress: receipt.contractAddress});
                        callback(err);
                    } else {
                        self.setState({loading: false, deployed: true, delpoyedAddress: receipt.contractAddress});
                    }
                }
            }
        );
    }

    createAccounts(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Creating Accounts'});
        console.log('\n Creating '+self.state.amountAccounts+' accounts.. \n');
        var passwords = [];
        for (var i = 0; i < self.state.amountAccounts; i++)
            passwords.push('StrongPassword'+i);
        var newAccounts = [];
        async.eachOfLimit(passwords, 1, function(password, key, accountCallback){
            Actions.Account.createAccount({password: password}, function(err, info){
                newAccounts.push({
                    address: '0x'+info.address,
                    password: password,
                    data: info.data,
                });
                console.log("\n Account 0x"+info.address+" created with password "+password);
                accountCallback(err);
            });
        },
        function(err){
            if (err)
                console.error(err);
            Store.setAccounts(newAccounts);
            if (callback){
                callback(err);
                self.setState({accounts : newAccounts});
            } else {
                self.setState({loading: false, accounts : newAccounts});
            }
        })
    }

    addVoters(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Adding Voters'});
        console.log('\n Populating contract with '+self.state.amountAccounts+' accounts.. \n');
        var txsToSend = [];
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.eachOfLimit(self.state.accounts, 1, function(account, key, accountCallback){
            console.log("\n Adding voter with account 0x"+account.address);
            Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).votersIndex.call(account.address, function(err, pos){
                if (pos == 0) {
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        account.address,
                        chance.first(),
                        chance.last(),
                        chance.birthday({string: true, american: false}),
                        chance.integer({min: 1000000, max: 10000000}).toString(),
                        chance.address()
                    ], 'addVoter', Store.contract.ABI)
                    var addVoterTX = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : self.state.address,
                        value: 0,
                        data: payloadData,
                        nonce: nonce
                    });
                    txsToSend.push(Actions.Ethereum.signTX(addVoterTX, self.state.privateKey));
                    nonce ++;
                }
                if (Store.web3.eth.getBalance(account.address) < Store.web3.toWei('0.005', 'ether')){
                    var sendToVoter = Actions.Ethereum.buildTX({
                        to: account.address,
                        from : self.state.address,
                        value: Store.web3.toWei('0.005', 'ether'),
                        nonce: nonce
                    });
                    nonce ++;
                    txsToSend.push(Actions.Ethereum.signTX(sendToVoter, self.state.privateKey));
                }
                accountCallback(err);
            })
        },
        function(error){
            if (error && callback){
                console.error(error);
                callback(error);
            } else {
                Actions.Ethereum.sendTXs(txsToSend, function(err){
                    if (err)
                        console.error(err);
                    if (callback)
                        callback(err);
                    else
                        self.setState({loading: false});
                });
            }
        })
    }

    addPostulants(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Adding Postulants'});
        console.log('\n Adding first two accounts as postulants.. \n');
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.series([
            function(postulantOneCallback) {
                Actions.Ethereum.getVoterInfo(self.state.accounts[0].address, function(err, info){
                    console.log("\n Adding postulant with party name 'Party Number 1' with address "+self.state.accounts[0].address);
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        self.state.accounts[0].address,
                        'Party Number 1'
                    ], 'addPostulant', Store.contract.ABI)
                    var winnerPostulantTx = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : self.state.address,
                        value: 0,
                        data: payloadData,
                        nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ))
                    });
                    postulantOneCallback(err, Actions.Ethereum.signTX(winnerPostulantTx, self.state.privateKey));
                });
            },
            function(postulantTwoCallback) {
                Actions.Ethereum.getVoterInfo(self.state.accounts[1].address, function(err, info){
                    console.log("\n Adding postulant with party name 'Party Number 2' with address "+self.state.accounts[1].address);
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        self.state.accounts[1].address,
                        'Party Number 2'
                    ], 'addPostulant', Store.contract.ABI)
                    var loserPostulantTx = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : self.state.address,
                        value: 0,
                        data: payloadData,
                        nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) )+1)
                    });
                    postulantTwoCallback(err, Actions.Ethereum.signTX(loserPostulantTx, self.state.privateKey));
                });
            }
        ],
        function(error, results) {
            if (error && callback){
                console.error(error);
                callback(error);
            } else {
                Actions.Ethereum.sendTXs(results, function(err){
                    if (err)
                        console.error(err);
                    if (callback)
                        callback(err);
                    else
                        self.setState({loading: false});
                });
            }
        });
    }

    setVerifier(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Setting Verifiers'});
        console.log('\n Populating contract with '+self.state.amountAccounts+' accounts.. \n');
        var txsToSend = [];
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.eachOfLimit(self.state.accounts, 1, function(account, key, verifierCallback){
            console.log("\n Setting verfifier "+account.address+" on address "+self.state.accounts[0].address);
            var payloadData = Actions.Ethereum.buildFunctionData([
                account.address,
                self.state.accounts[0].address
            ], 'setVerifier', Store.contract.ABI)
            var setVerifierTx = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : self.state.address,
                value: 0,
                data: payloadData,
                nonce: nonce
            });
            txsToSend.push(Actions.Ethereum.signTX(setVerifierTx, self.state.privateKey));
            nonce ++;
            var sendToVerifierTx = Actions.Ethereum.buildTX({
                to: self.state.accounts[0].address,
                from : self.state.address,
                value: Store.web3.toWei('0.005', 'ether'),
                nonce: nonce
            });
            nonce ++;
            txsToSend.push(Actions.Ethereum.signTX(sendToVerifierTx, self.state.privateKey));
            verifierCallback(null);
        },
        function(error){
            if (error && callback){
                console.error(error);
                callback(error);
            } else {
                Actions.Ethereum.sendTXs(txsToSend, function(err){
                    if (err)
                        console.error(err);
                    if (callback)
                        callback(err);
                    else
                        self.setState({loading: false});
                });
            }
        })
    }

    showResults(resultsCallback){
        async.series([
            function(callback) {
                Actions.Ethereum.getVoters(function(err, results){
                    console.log('Voters: ', results);
                    callback(err);
                });
            },
            function(callback) {
                Actions.Ethereum.getPostulants(function(err, results){
                    console.log('Postulants: ', results);
                    callback(err);
                });
            },
            function(callback) {
                Actions.Ethereum.getContractInfo(function(err, info){
                    console.log('Contract info: ', info);
                    callback(err);
                });
            }
        ],
        function(err) {
            if (err)
                console.error(err);
            if (resultsCallback)
                resultsCallback(err);
        });
    }

    simulateVotes(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Simulating Votation'});
        console.log('\n Simulating votes.. \n');
        var txsToSend = [];
        async.eachOfLimit(self.state.accounts, 1, function(account, key, voteCallback){
            console.log("");
            const random = chance.integer({min: 0, max: 10});
            var selected = self.state.accounts[ 0 ].address;
            if (random >= 8)
                selected = self.state.accounts[ 1 ].address;
            var payloadData = Actions.Ethereum.buildFunctionData([
                selected
            ], 'vote', Store.contract.ABI)
            var voteTx = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : account.address,
                value: 0,
                data: payloadData
            });
            Actions.Account.sign({
                password: account.password,
                data: account.data
            },
            voteTx,
            function(err, signedTX){
                txsToSend.push(signedTX);
                voteCallback(err);
            });
        },
        function(error){
            if (error && callback){
                console.error(error);
                callback(error);
            } else {
                Actions.Ethereum.sendTXs(txsToSend, function(err){
                    if (err)
                        console.error(err);
                    if (callback)
                        callback(err);
                    else
                        self.setState({loading: false});
                });
            }
        })
    }

    verifyVotes(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Verifying Votes'});
        console.log('\n Verifying votes.. \n');
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.accounts[0].address ) ));
        var txsToSend = [];
        async.eachOfLimit(self.state.accounts, 1, function(account, key, verifyCallback){
            console.log("");
            var payloadData = Actions.Ethereum.buildFunctionData([
                account.address
            ], 'verify', Store.contract.ABI)
            var verifyTx = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : self.state.accounts[0].address,
                value: 0,
                data: payloadData,
                nonce : nonce
            });
            nonce ++;
            Actions.Account.sign({
                password: self.state.accounts[0].password,
                data: self.state.accounts[0].data
            },
            verifyTx,
            function(err, signedTX){
                txsToSend.push(signedTX);
                verifyCallback(err);
            });
        },
        function(error){
            if (error && callback){
                console.error(error);
                callback(error);
            } else {
                Actions.Ethereum.sendTXs(txsToSend, function(err){
                    if (err)
                        console.error(err);
                    if (callback)
                        callback(err);
                    else
                        self.setState({loading: false});
                });
            }
        })
    }

    viewVotes(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Getting Votes'});
        console.log('\n Getting votes.. \n');
        async.eachOfLimit(self.state.accounts, 1, function(account, key, viewVoteCallback){
            console.log("");
            var payloadData = Actions.Ethereum.buildFunctionData([], 'seeVote', Store.contract.ABI)
            Actions.Account.call({
                password: account.password,
                data: account.data
            },{
                to: Store.contract.address,
                from : account.address,
                data: payloadData,
            },
            function(err, result){
                if (err)
                    console.log(err);
                else {
                    console.log(account.address, ' voted to: ','0x'+result.substring(26,66));
                    console.log((parseInt(result.substring(66)) == 1) ? 'Vote Done' : 'Vote Not Done');
                }
                viewVoteCallback(err);
            });
        },
        function(err){
            if (err)
                console.log(err);
            if (callback)
                callback(err);
            else
                self.setState({loading: false});
        })
    }

    simulateAll(){
        var self = this;
        self.setState({loading: true});
        async.series([
            function(callback) {
                self.deploy(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.createAccounts(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.addVoters(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.addPostulants(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.setVerifier(callback);
            },
            function(callback) {
                self.setState({loadingMessage: 'Waiting for block '+self.state.blockStart});
                console.log('\n Waiting for block '+self.state.blockStart+'\n');
                Actions.Ethereum.waitForBlock(self.state.blockStart, callback);
            },
            function(callback) {
                self.simulateVotes(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.verifyVotes(callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
            },
            function(callback) {
                self.viewVotes(callback);
            },
            function(callback) {
                self.showResults(callback);
            }
        ],
        function(err, results) {
            if (err)
                console.error(err);
            console.log('\n--------------- DONE ---------------\n');
            self.setState({loading: false});
        });
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message={self.state.loadingMessage} />
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Create Election Contract</h1>
                        </div>
                        { self.state.deployed ?
                            <div class="col-xs-12 text-center">
                                <h1>Existing contract deployed on {self.state.address}</h1>
                            </div>
                        : <div/>
                        }
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <h3>Contract Information</h3>
                            <div class="form-group">
                                <label for="electionNameInput">Election Name</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="electionNameInput"
                                    value={self.state.electionName}
                                    onChange={(event) => self.setState({electionName: event.target.value})}
                                    placeholder=""
                                />
                            </div>
                            <div class="form-group">
                                <label for="startBlockInput">Start Block</label>
                                <input
                                    type="number"
                                    class="form-control"
                                    id="startBlockInput"
                                    value={self.state.blockStart}
                                    onChange={(event) => self.setState({blockStart: event.target.value})}
                                    placeholder="The block where the votation is going to start"
                                />
                            </div>
                            <div class="form-group">
                                <label for="endBlockInput">Finish Block</label>
                                <input
                                    type="number"
                                    class="form-control"
                                    id="endBlockInput"
                                    value={self.state.blockEnd}
                                    onChange={(event) => self.setState({blockEnd: event.target.value})}
                                    placeholder="The block where the votation is going to end"
                                />
                            </div>
                            <div class="form-group">
                                <label for="amountOfAccountsInput">Amount of Accounts</label>
                                <input
                                    type="number"
                                    class="form-control"
                                    id="amountOfAccountsInput"
                                    value={self.state.amountAccounts}
                                    onChange={(event) => self.setState({amountAccounts: event.target.value})}
                                    placeholder="The ammount of accounts to generate as voters"
                                />
                            </div>
                            <h3>Admin Account</h3>
                            <div class="form-group">
                                <label for="addressInput">Address</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="addressInput"
                                    value={self.state.address}
                                    onChange={(event) => self.setState({address: event.target.value})}
                                    placeholder="Your address"
                                />
                            </div>
                            <div class="form-group">
                                <label for="privateKeyInput">Private Key</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="privateKeyInput"
                                    value={self.state.privateKey}
                                    onChange={(event) => self.setState({privateKey: event.target.value})}
                                    placeholder="Your private key"
                                />
                            </div>
                            <div class="row">
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.simulateAll()}>Simulate All</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.deploy()}>Deploy</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.createAccounts()}>Create Accounts</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.addVoters()}>Add Voters</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.addPostulants()}>Add Postulants</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.setVerifier()}>Set Verifier</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.simulateVotes()}>Simulate Election</button>
                                </div>
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.verifyVotes()}>Verify Votes</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.showResults()}>Show Results</button>
                                </div>
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => this.viewVotes()}>View Votes</button>
                                </div>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="/" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                    </div>
                }
            </div>
        )
    }

}
