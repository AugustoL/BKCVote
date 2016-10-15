import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

export default class VerifyVote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            voterAddress: "",
            verfifierAddress: "",
            verifierData: "",
            verifierPassword: "",
            voters: [],
            votersOptions : [],
            showQRToVerify: false,
            showQRVerifierAddress: false,
            showQRAccount: false,
            hidePassword: true
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

    verifyVote(){
        var self = this;
        self.setState({loading: true});
        var payloadData = Actions.Ethereum.buildFunctionData([
            self.state.voterAddress
        ], 'verify', Store.contract.ABI)
        var verifyTx = Actions.Ethereum.buildTX({
            to: Store.contract.address,
            from : self.state.verfifierAddress,
            value: 0,
            data: payloadData,
            nonce : nonce
        });
        nonce ++;
        Actions.Account.sign({
            password: self.state.verifierPassword,
            data: self.state.verifierData
        },
        verifyTx,
        function(err, signedTX){
            Actions.Ethereum.sendTXs([signedTX], function(err){
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
                                <h2>Verified vote of address {self.state.voterAddress}</h2>
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Vote Verified', body: modalBody});
                }
            });
        });
    }

    render() {
        var self = this;

        return(
            <div>
                { self.state.loading ?
                    <Loader />
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Verify Vote</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <div class="form-group">
                                <label for="addressInput">Voter Address</label>
                                <QRReader
                                    showQR={self.state.showQRToVerify}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({voterAddress: data, showQRToVerify: false});
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
                                    {self.state.showQRToVerify ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRToVerify: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRToVerify: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <h3>Verifier Info</h3>
                            <div class="form-group">
                                <label for="addressInput">Address</label>
                                <QRReader
                                    showQR={self.state.showQRVerifierAddress}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({verifierAddress: data, showQRVerifierAddress: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.verifierAddress}
                                        onChange={(event) => self.setState({verifierAddress: event.target.value})}
                                        placeholder="Your address"
                                    />
                                    {self.state.showQRVerifierAddress ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVerifierAddress: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVerifierAddress: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="verifierDataInput">Account</label>
                                <QRReader
                                    showQR={self.state.showQRAccount}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({verifierData: data, showQRAccount: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="verifierDataInput"
                                        value={self.state.verifierData}
                                        onChange={(event) => self.setState({verifierData: event.target.value})}
                                        placeholder="Your account data"
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
                                <label for="verifierPasswordInput">Password</label>
                                <div class="input-group">
                                    <input
                                        type={self.state.hidePassword ? 'password': 'text'}
                                        class="form-control"
                                        id="verifierPasswordInput"
                                        value={self.state.verifierPassword}
                                        onChange={(event) => self.setState({verifierPassword: event.target.value})}
                                        placeholder="Your password"
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
                            <div class="row text-center">
                                <button type="submit" class="btn btn-md btn-default" onClick={() => this.verifyVote()}>Verify Vote</button>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="verifier" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                        <Modal ref={(c) => this._modal = c} />
                    </div>
                }
            </div>
        )
    }

}
