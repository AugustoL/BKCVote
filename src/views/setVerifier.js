import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

export default class SetVerifier extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            voterAddress: "",
            verifierAddress: "",
            adminAccounutData: "",
            adminPassword: "",
            showQRAddress: false,
            showQRAccount: false,
            hidePassword: true,
            voters: [],
            votersOptions : []
        }
    }

    componentWillMount() {
        var self = this;
        if (Store.contract.address != ""){
            Actions.Ethereum.getVoters(function(err, voters){
                if (err)
                    console.error(err);
                else {
                    var votersOptions = [];
                    for (var i = 0; i < voters.length; i++)
                        votersOptions.push({ value: voters[i].address, label: voters[i].name+" "+voters[i].surename});
                    self.setState({voters: voters, votersOptions : votersOptions});
                }
            });
        }
    }

    setVerifier(){
        var self = this;
        self.setState({loading: true});
        var txsToSend = []
        async.series([
            function(callback){
                var payloadData = Actions.Ethereum.buildFunctionData([
                    self.state.voterAddress,
                    self.state.verifierAddress
                ], 'setVerifier', Store.contract.ABI)
                var setVerifierTx = Actions.Ethereum.buildTX({
                    to: Store.contract.address,
                    from : self.state.adminAddress,
                    value: 0,
                    data: payloadData,
                    nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.adminAddress ) ))
                });
                Actions.Account.sign({
                    password: self.state.adminPassword,
                    data: self.state.adminAccounutData
                }, setVerifierTx, function(err, txSigned){
                    txsToSend.push(txSigned);
                    callback(err);
                });
            },
            function(callback){
                var sendToVoter = Actions.Ethereum.buildTX({
                    to: self.state.verifierAddress,
                    from : self.state.adminAddress,
                    value: Store.web3.toWei('0.005', 'ether'),
                    nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.adminAddress ) )+1)
                });
                Actions.Account.sign({
                    password: self.state.adminPassword,
                    data: self.state.adminAccounutData
                }, sendToVoter, function(err, txSigned){
                    txsToSend.push(txSigned);
                    callback(err);
                });
            }
        ], function(error){
            if (error)
                console.error(error);
            Actions.Ethereum.sendTXs(txsToSend, function(err){
                if (err){
                    var modalBody =
                        <div class="row modalBody">
                            <div class="col-xs-12 text-center margin-bottom">
                                {err}
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Error', body: modalBody});
                } else {
                    var modalBody =
                        <div class="row modalBody">
                            <div class="col-xs-12 text-center margin-bottom">
                                Verifier
                                <br/><strong>{self.state.verifierAddress}</strong><br></br>
                            </div>
                            <div class="col-xs-12 text-center margin-bottom">
                                Voter
                                <br/><strong>{self.state.voterAddress}</strong><br></br>
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Verifier Set', body: modalBody});
                }
            });
        })
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message="Setting Verifier"/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Set Verifier</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <div class="form-group">
                                <label for="addressInput">Voter Address</label>
                                <QRReader
                                    showQR={self.state.showQRVoter}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({voterAddress: data, showQRVoter: false});
                                    }}
                                ></QRReader>
                                <Select
                                    name="selectVoterAddress"
                                    value={self.state.voterAddress}
                                    options={self.state.votersOptions}
                                    onChange={(val) => self.setState({voterAddress: (val) ? val.value : ''})}
                                />
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.voterAddress}
                                        onChange={(event) => self.setState({voterAddress: event.target.value})}
                                        placeholder="Voter Address"
                                    />
                                    {self.state.showQRVoter ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoter: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoter: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="verifierAddressInput">Verifier Address</label>
                                <QRReader
                                    showQR={self.state.showQRVerifier}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({verifierAddress: data, showQRVerifier: false});
                                    }}
                                ></QRReader>
                                <Select
                                    name="selectVoterAddress"
                                    value={self.state.verifierAddress}
                                    options={self.state.votersOptions}
                                    onChange={(val) => self.setState({verifierAddress: (val) ? val.value : ''})}
                                />
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="verifierAddressInput"
                                        value={self.state.verifierAddress}
                                        onChange={(event) => self.setState({verifierAddress: event.target.value})}
                                        placeholder="Verifier Address"
                                    />
                                    {self.state.showQRVerifier ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVerifier: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVerifier: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <h3>Admin Info</h3>
                            <div class="form-group">
                                <label for="addressInput">Address</label>
                                <QRReader
                                    showQR={self.state.showQRAddress}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({adminAddress: data, showQRAddress: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.adminAddress}
                                        onChange={(event) => self.setState({adminAddress: event.target.value})}
                                        placeholder="Admin Address"
                                    />
                                    {self.state.showQRAddress ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRAddress: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRAddress: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="adminAccountInput">Account</label>
                                <QRReader
                                    showQR={self.state.showQRAccount}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({adminAccounutData: data, showQRAccount: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="adminAccountInput"
                                        value={self.state.adminAccounutData}
                                        onChange={(event) => self.setState({adminAccounutData: event.target.value})}
                                        placeholder="Admin Account"
                                    />
                                    {self.state.showQRAccount ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRAccount: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRAccount: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="passwordInput">Password</label>
                                <div class="input-group">
                                    <input
                                        type={self.state.hidePassword ? 'password': 'text'}
                                        class="form-control"
                                        id="passwordInput"
                                        value={self.state.adminPassword}
                                        onChange={(event) => self.setState({adminPassword: event.target.value})}
                                        placeholder="Admin Password"
                                    />
                                    {self.state.hidePassword ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({hidePassword: false})}
                                        >
                                            <span class="fa fa-eye"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({hidePassword: true})}
                                        >
                                            <span class="fa fa-eye-slash"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="row margin-bottom margin-top text-center">
                                <button  class="btn btn-md btn-default" onClick={() => this.setVerifier()}>Set Verifier</button>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="admin" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                        <Modal ref={(c) => this._modal = c} />
                    </div>
                }
            </div>
        )
    }

}
