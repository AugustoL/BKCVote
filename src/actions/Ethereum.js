
import * as Tx from "ethereumjs-tx";
import * as lodash from "lodash";
import * as web3Func from "../../node_modules/web3/lib/web3/function";
import * as coder from '../../node_modules/web3/lib/solidity/coder';
import async from 'async';
import ethLightwallet from 'eth-lightwallet';
import moreEntropy from 'more-entropy'
var keyStore = ethLightwallet.keyStore;

import Store from "../Store";

var accountKeys = JSON.parse(require('../../blockchain/accounts.json'));

export function getAccounts(callback) {
    Store.web3.eth.getAccounts(callback);
}

export function getNodeInfo(){
    try {
        return {
            block: Store.web3.eth.blockNumber,
            connected: Store.web3.isConnected(),
            network: Store.web3.version.network,
            version: Store.web3.version.ethereum,
            hashrate: Store.web3.eth.hashrate,
            peers: Store.web3.net.peerCount,
            syncing: Store.web3.eth.syncing
        }
    } catch (e) {
        console.error(e);
        return {
            block: 0,
            connected: false,
            network: '',
            version: '',
            hashrate: 0,
            peers: 0,
            syncing: false
        }
    }
}

export function waitForBlock(block, callback) {
    var wait = setInterval( function() {
        if (Store.web3.eth.blockNumber >= block) {
            clearInterval(wait);
            callback();
        }
    }, 1000 );
}

export function getBalance(address){
    return parseFloat(Store.web3.eth.getBalance(address))/1000000000000000000;
}

function waitForTX(tx, callback) {
    var wait = setInterval( function() {
        try{
            if ( isTXMined(tx)) {
                clearInterval(wait);
                callback();
            }
        } catch(e){};
    }, 1000 );
}

function isTXMined(tx){
    if (!Store.web3.eth.getTransaction(tx))
        return false;
    var txBlock = Store.web3.eth.getTransaction(tx).blockNumber;
    if ((txBlock != null) && (parseInt(txBlock) <= parseInt(Store.web3.eth.blockNumber)))
        return true;
    else
        return false;
}

function parseInfoVoter(info){
    return {
        address: info[0],
        balance: parseFloat(Store.web3.eth.getBalance(info[0])),
        name : Store.web3.toAscii(info[1]).replace(/[^\w\s]/gi, ''),
        surename : Store.web3.toAscii(info[2]).replace(/[^\w\s]/gi, ''),
        birth : Store.web3.toAscii(info[3]).replace(/[^\w\s]/gi, ''),
        id : parseInt(info[4]),
        phisical_address: Store.web3.toAscii(info[5]).replace(/[^\w\s]/gi, ''),
        verifier : info[6],
        verified : info[7],
        voted : info[8]
    }
}

function parsePostulantInfo(info){
    return {
        id : parseInt(info[0]),
        name : Store.web3.toAscii(info[1]).replace(/[^\w\s]/gi, ''),
        party : Store.web3.toAscii(info[2]).replace(/[^\w\s]/gi, ''),
        votes : parseInt(info[3])
    }
}

export function getContractInfo(callback) {
    try {
        async.series([
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).stage.call(callback)
            },
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).electionName.call(callback)
            },
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).getVotersCount.call(callback)
            },
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).votesDone.call(callback)
            },
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).votesToVerify.call(callback)
            },
            function(callback) {
                Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).owner.call(callback)
            },
            function(callback) {
                callback(null, Store.web3.eth.getBalance(Store.contract.address));
            }
        ],
        function(err, results) {
            if (err)
                callback(err, null);
            else {
                callback(null, {
                    stage: parseInt(results[0]),
                    electionName: results[1],
                    totalVoters: parseInt(results[2])-1,
                    votesToBeDone: parseInt(results[2])-1-parseInt(results[3]),
                    votesDone: parseInt(results[3]),
                    votesToVerify: parseInt(results[4]),
                    owner: results[5],
                    balance: parseInt(results[6])
                })
            }
        });
    } catch(e){
        callback(null, null);
    }
}

export function getContractEvents(callback){
    Store.web3.eth.filter({fromBlock:0, toBlock: 'latest', address: Store.contract.address, topics: []}).get(function(err, result) {
        if (err)
            console.error(err)
        for (var i = 0; i < result.length; i++)
            console.log(result[i]);
        callback(err, result);
    })
}

export function getVoterInfo(address, callback) {
    Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).votersIndex.call(address, function(err, pos){
        if (err)
            callback(err, null);
        else
            Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).voters.call(parseInt(pos), function(err, info){
                callback(err, parseInfoVoter(info));
            })
    })
}

export function getVoters(callback) {
    var voters = [];
    Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).getVotersCount.call(function(err, totalVoters){
        var votersIndex = [];
        for (var i = 1; i < totalVoters; i++)
            votersIndex.push(i);
        async.eachOfLimit(votersIndex, 5, function(number, key, infoCallback){
            Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).voters.call(parseInt(number), function(err, info){
                voters.push(parseInfoVoter(info));
                infoCallback(null);
            })
        }, function(err){
            voters = voters.sort(function(a, b){return a.id-b.id});
            callback(err, voters);
        });
    })
}

export function getPostulants(callback) {
    var positions = [];
    Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).getPostulantsCount.call(function(err, totalPostulants){
        var postulantsIndex = [];
        for (var i = 1; i < totalPostulants; i++)
            postulantsIndex.push(i);
        async.eachOfLimit(postulantsIndex, 5, function(number, key, infoCallback){
            Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).postulants.call(parseInt(number), function(err, info){
                positions.push(parsePostulantInfo(info));
                infoCallback(null);
            })
        }, function(err){
            positions.sort(function(a, b){return b.votes-a.votes});
            callback(err, positions);
        });
    })
}

export function getPostulant(id, callback) {
    Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).postulantsIndex.call(id, function(err, pos){
        if (err)
            callback(err, null);
        else
            Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address).postulants.call(pos, function(err, info){
                if (err)
                    callback(err, null);
                else
                    callback(err, parsePostulantInfo(info));
            });
    });
}

export function sendContractTX(pvKey, from, to, ABI, functionName, args, value, callback) {
    var payloadData = buildFunctionData(args, functionName, ABI)
    var tx = buildTX({
        to: to,
        from : from,
        value: value,
        data: payloadData
    });
    var serializedTx = signTX(tx, pvKey);
    sendTXs([serializedTx], callback);
}

export function sendToAddress(pvKey, from, to, value, callback) {
    var tx = buildTX({
        to: to,
        from : from,
        value: value,
    });
    var serializedTx = signTX(tx, pvKey);
    sendTXs([serializedTx], callback);
}

export function buildFunctionData(args, functionName, ABI){
    for (var i = 0; i < args.length; i++)
        args[i] = Store.web3.toHex(args[i]);
    var solidityFunction = new web3Func.default('', lodash.default.find(ABI, { name: functionName }), '');
    var payloadData = solidityFunction.toPayload(args).data;
    return payloadData;
}

export function buildTX(data){
    var estimatedGas = Store.web3.eth.estimateGas({
        nonce: data.nonce ? Store.web3.toHex(data.nonce) : Store.web3.toHex(parseInt(Store.web3.eth.getTransactionCount(data.from))),
        gasPrice: Store.web3.toHex(Store.web3.eth.gasPrice),
        to: data.to || '0x0000000000000000000000000000000000000000',
        from: data.from,
        value: data.value ? Store.web3.toHex(data.value) : '0x0',
        data: data.data ? Store.web3.toHex(data.data) : '0x'
    }) + 50000;
    var rawTx = {
        nonce: data.nonce ? Store.web3.toHex(data.nonce) : Store.web3.toHex(parseInt(Store.web3.eth.getTransactionCount(data.from))),
        gasPrice: Store.web3.toHex(Store.web3.eth.gasPrice),
        gasLimit: Store.web3.toHex(estimatedGas),
        to: data.to || '0x0000000000000000000000000000000000000000',
        from: data.from,
        value: data.value ? Store.web3.toHex(data.value) : '0x0',
        data: data.data ? Store.web3.toHex(data.data) : '0x'
    };
    console.log('TX:',rawTx);
    var tx = new Tx.default(rawTx);
    return tx;
}

export function signTX(tx, pvKey){
    tx.sign(new Buffer(pvKey, 'hex'));
    var serializedTx = '0x'+tx.serialize().toString('hex');
    console.log('Serialized TX:',serializedTx);
    return serializedTx;
}

export function sendTXs(txs, callback){
    async.eachOfLimit(txs, 50, function(tx, key, sendCallback){
        Store.web3.eth.sendRawTransaction(tx, function(err, hash){
            if (err){
                console.error(err);
                sendCallback(err, null);
            } else {
                console.log('Hash:', hash);
                waitForTX(hash, function(){
                    Store.web3.eth.getTransactionReceipt(hash, function(err, receipt){
                        console.log('Receipt:', receipt);
                        if ((receipt.logs.length > 0) && (receipt.logs[0].topics[0] == '0xb48fb6cf86d9c47e2268650bac422c18104332e413943278776f488788b991da'))
                            switch (receipt.logs[0].data) {
                                case '0x0000000000000000000000000000000000000000000000000000000000000000':
                                    sendCallback('Unauthorized Access', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000001':
                                    sendCallback('Invalid Block Status', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000002':
                                    sendCallback('Invalid Address', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000003':
                                    sendCallback('Insufficent Balance', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000004':
                                    sendCallback('Vote aldready done', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000005':
                                    sendCallback('Vote already verified', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000006':
                                    sendCallback('Vote not done', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000007':
                                    sendCallback('Verifier not set', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000008':
                                    sendCallback('Postulant already added', receipt);
                                break;
                                case '0x0000000000000000000000000000000000000000000000000000000000000009':
                                    sendCallback('Invalid new stage', receipt);
                                break;
                                default:
                                    sendCallback(null, receipt);
                                break;
                            }
                        else
                            sendCallback(null, receipt);
                    })
                })
            }
        });
    },
    callback);
}

export function callTX(tx, callback){
    Store.web3.eth.call(tx, function(err, output){
        if (!output) {
            callback(err, '');
        } else {
            console.log(output);
            output = output.length >= 2 ? output.slice(2) : output;
            var outputTypes = lodash.default.find(contract.ABI || Store.contract.ABI, { name: contract.functionName }).outputs.map(function (i) {
                return i.type;
            });
            if (output.length > 2){
                var result = coder.default.decodeParams(outputTypes, output);
                callback(err, result);
            } else {
                callback(err, []);
            }
        }
    });
}


export function deployContract(pvKey, from, contractData, abi, params, value, callback) {
    var bytes = abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
    }).map(function (json) {
        return json.inputs.map(function (input) {
            return input.type;
        });
    }).map(function (types) {
        return coder.default.encodeParams(types, params);
    })[0] || '';
    contractData += bytes;
    var estimatedGas = Store.web3.eth.estimateGas({
        data : contractData
    }) + 50000;
    var rawTx = {
        nonce: Store.web3.toHex(parseInt(Store.web3.eth.getTransactionCount(from))),
        gasPrice: Store.web3.toHex(Store.web3.eth.gasPrice),
        gasLimit: Store.web3.toHex(estimatedGas),
        from: from,
        value: Store.web3.toHex(value),
        data: contractData
    };
    console.log('TX:',rawTx);
    var tx = new Tx.default(rawTx);
    var serializedTx = signTX(tx, pvKey);
    Store.web3.eth.sendRawTransaction(serializedTx, function(err, hash){
        if (err){
            console.error(err);
            callback(err, null);
        } else {
            console.log('Hash:', hash);
            waitForTX(hash, function(){
                Store.web3.eth.getTransactionReceipt(hash, function(err, receipt){
                    console.log('Receipt:', receipt);
                    callback(err, receipt);
                })
            })
        }
    });
}
