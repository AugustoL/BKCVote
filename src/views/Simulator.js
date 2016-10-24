import React from 'react';
import {Link} from "react-router";

import async from 'async';
import Store from "../Store";
import Chance from 'chance';
var chance = new Chance();
var Web3 = require('web3');

import * as Actions from "../actions";
import Loader from "../components/Loader";

var accounts = JSON.parse(require('../accounts.json'));

var contracts = JSON.parse(require('../contracts.json'));

export default class Simulator extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            electionName: 'Test Election',
            amountAccounts: 10,
            address: "",
            privateKey: "",
            accounts: accounts.users || []
        }
    }

    componentWillMount() {
        var self = this;
        self.setState({
            address: accounts.admin.address,
            privateKey: accounts.admin.privateKey
        });
        Actions.Ethereum.getContractInfo(function(err, info){
            console.log('Contract info:',info);
        });
    }

    deploy(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Deploying Contract'});
        Actions.Ethereum.deployContract(
            self.state.privateKey,
            self.state.address,
            '0x'+contracts.BKCVote.bytecode,
            JSON.parse(contracts.BKCVote.interface),
            [
                self.state.electionName
            ],
            Store.web3.toWei('0.01', 'ether')*parseInt(self.state.amountAccounts),
            function(err, receipt){
                if (err){
                    console.error(err);
                    self.setState({loading: false});
                } else {
                    Actions.Store.setContract(receipt.contractAddress, JSON.parse(contracts.BKCVote.interface));
                    if (callback){
                        callback(err);
                    } else {
                        self.setState({loading: false});
                    }
                }
            }
        );
    }

    addVoters(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Adding Voters'});

        console.log('\n Populating contract with '+self.state.accounts.slice(0,self.state.amountAccounts).length+' accounts.. \n');
        var txsToSend = [];
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.eachOfLimit(self.state.accounts.slice(0,self.state.amountAccounts), 1, function(account, key, accountCallback){
            console.log("\n Adding voter with account "+account.address);
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
        console.log('\n Adding postulants.. \n');
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.series([
            function(postulantOneCallback) {
                const postulantOneName = chance.first()+' '+chance.last();
                console.log("\n Adding postulant "+postulantOneName+" with party name 'Party Number 1'");
                var payloadData = Actions.Ethereum.buildFunctionData([
                    chance.integer({min: 10000, max: 100000}).toString(),
                    postulantOneName,
                    'Party Number 1'
                ], 'addPostulant', Store.contract.ABI)
                var winnerPostulantTx = Actions.Ethereum.buildTX({
                    to: Store.contract.address,
                    from : self.state.address,
                    value: 0,
                    data: payloadData,
                    nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ))
                });
                postulantOneCallback(null, Actions.Ethereum.signTX(winnerPostulantTx, self.state.privateKey));
            },
            function(postulantTwoCallback) {
                const postulantTwoName = chance.first()+' '+chance.last();
                console.log("\n Adding postulant "+postulantTwoName+" with party name 'Party Number 2'");
                var payloadData = Actions.Ethereum.buildFunctionData([
                    chance.integer({min: 10000, max: 100000}).toString(),
                    postulantTwoName,
                    'Party Number 2'
                ], 'addPostulant', Store.contract.ABI)
                var loserPostulantTx = Actions.Ethereum.buildTX({
                    to: Store.contract.address,
                    from : self.state.address,
                    value: 0,
                    data: payloadData,
                    nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) )+1)
                });
                postulantTwoCallback(null, Actions.Ethereum.signTX(loserPostulantTx, self.state.privateKey));
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

    setStage(newStage, callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Changing Election Stage'});
        console.log('\n Changing election stage to '+newStage+' .. \n');
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        var payloadData = Actions.Ethereum.buildFunctionData([
            newStage
        ], 'setStage', Store.contract.ABI)
        var setStageTX = Actions.Ethereum.buildTX({
            to: Store.contract.address,
            from : self.state.address,
            value: 0,
            data: payloadData,
            nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ))
        });
        Actions.Ethereum.sendTXs([ Actions.Ethereum.signTX(setStageTX, self.state.privateKey) ], function(err){
            if (err)
                console.error(err);
            if (callback)
                callback(err);
            else
                self.setState({loading: false});
        });
    }

    setVerifiers(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Setting Verifiers'});
        console.log('\n Setting verfiers.. \n');
        var txsToSend = [];
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.address ) ));
        async.eachOfLimit(self.state.accounts.slice(0,self.state.amountAccounts), 1, function(account, key, verifierCallback){
            Actions.Ethereum.getVoterInfo(account.address, function(err, info){
                if (info.verifier == '0x0000000000000000000000000000000000000000'){
                    console.log("\n Setting verifier "+account.address+" on address "+self.state.accounts[0].address);
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
                    nonce ++;
                    txsToSend.push(Actions.Ethereum.signTX(setVerifierTx, self.state.privateKey));
                    verifierCallback(null);
                } else {
                    console.log('\n Account '+account.address+' verifier already set.');
                    verifierCallback(null);
                }
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

    simulateVotes(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Simulating Election'});
        console.log('\n Simulating election.. \n');
        var txsToSend = [];
        Actions.Ethereum.getPostulants(function(err, postulants){
            async.eachOfLimit(self.state.accounts.slice(0,self.state.amountAccounts), 1, function(account, key, voteCallback){
                Actions.Ethereum.getVoterInfo(account.address, function(err, info){
                    if (!info.voted){
                        console.log("");
                        const random = chance.integer({min: 0, max: 10});
                        var selected = postulants[0].id;
                        if (random >= 8)
                            selected = postulants[1].id;
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
                    } else {
                        console.log('\n Account '+account.address+' already voted.');
                        voteCallback(null);
                    }
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
            });
        });
    }

    verifyVotes(callback){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Verifying Votes'});
        console.log('\n Verifying votes.. \n');
        var txsToSend = [];
        var nonce = Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.accounts[0].address ) ));
        async.eachOfLimit(self.state.accounts.slice(0,self.state.amountAccounts), 1, function(account, key, verifyCallback){
            Actions.Ethereum.getVoterInfo(account.address, function(err, info){
                if (info.voted || (info.verifier == '0x0000000000000000000000000000000000000000')){
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
                } else {
                    if (!info.voted)
                        console.log('\n Account '+account.address+' didnt vote yet.');
                    if (info.verifier == '0x0000000000000000000000000000000000000000')
                        console.log('\n Account '+account.address+' no verifier set.');
                    verifyCallback(null);
                }
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
        async.eachOfLimit(self.state.accounts.slice(0,self.state.amountAccounts), 1, function(account, key, viewVoteCallback){
            console.log("");
            Actions.Account.call({
                password: account.password,
                account: account.data,
                from: account.address,
                payload: Actions.Ethereum.buildFunctionData([], 'seeVote', Store.contract.ABI),
                functionName: 'seeVote'
            },
            function(err, result){
                if (result[0].toNumber() == 0){
                    console.log('Voter not registered.');
                    viewVoteCallback(err);
                } else if (result[0].toNumber() == 1){
                    console.log('Voter didnt vote yet.');
                    viewVoteCallback(err);
                } else {
                    Actions.Ethereum.getPostulant(result[0].toNumber(), function(err, postulantInfo){
                        console.log(account.address, 'voted to', postulantInfo.name);
                        viewVoteCallback(err);
                    });
                }
            });
        },
        function(err){
            if (err)
                console.error(err);
            if (callback)
                callback(err);
            else
                self.setState({loading: false});
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
                self.setVerifiers(callback);
            },
            function(callback) {
                self.setStage(1, callback);
            },
            function(callback) {
                console.log('\n Waiting for 5 blocks \n');
                Actions.Ethereum.waitForBlock(Store.web3.eth.blockNumber+5, callback);
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
                self.setStage(2, callback);
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
                        { (Store.contract.address != "") ?
                            <div class="col-xs-12 text-center">
                                <h1>Existing contract deployed on {Store.contract.address}</h1>
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
                                <div class="col-xs-12 text-center">
                                    <button type="submit" class="btn btn-lg btn-default" onClick={() => self.simulateAll()}>Simulate All</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-12 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.deploy()}>Deploy</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.addVoters()}>Add Voters</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.addPostulants()}>Add Postulants</button>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.setVerifiers()}>Set Verifiers</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-12 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.setStage(1)}>Start Election</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.simulateVotes()}>Simulate Election</button>
                                </div>
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.verifyVotes()}>Verify Votes</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-12 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.setStage(2)}>Finish Election</button>
                                </div>
                            </div>
                            <div class="row margin-top">
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.showResults()}>Show Results</button>
                                </div>
                                <div class="col-xs-6 text-center">
                                    <button type="submit" class="btn btn-md btn-default" onClick={() => self.viewVotes()}>View Votes</button>
                                </div>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="admin" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                    </div>
                }
            </div>
        )
    }

}
