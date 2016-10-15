import React from 'react';
import {Link} from "react-router";

import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

var contracts = JSON.parse(require('../contracts.json'));

export default class CreateContract extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            deployed: (Store.contract.address == "") ? false : true,
            delpoyedAddress: Store.contract.address,
            electionName: 'Test Election',
            blockStart: 1000,
            blockEnd: 10000,
            adminAddress: "",
            adminAccountData: "",
            adminPassword: "",
            showQRAddress: false,
            showQRAccount: false,
            hidePassword: true
        }
    }

    deploy(){
        var self = this;
        self.setState({loading: true, loadingMessage: 'Deploying Contract'});
        var compiled = Store.web3.eth.compile.solidity(contracts.BKCVote.source);
        Actions.Account.unlockAccount({
            password: self.state.adminPassword,
            data: self.state.adminAccountData
        },
        function(err, info){
            Actions.Ethereum.deployContract(
                info.privateKey,
                self.state.adminAddress,
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
                                    Contract Address
                                    <br/><strong>{receipt.contractAddress}</strong><br></br>
                                </div>
                                <div class="col-xs-12 text-center margin-bottom">
                                    Transaction Hash
                                    <br/><strong>{receipt.transactionHash}</strong><br></br>
                                </div>
                            </div>;
                        Actions.Store.setContract(receipt.contractAddress, compiled.BKCVote.info.abiDefinition);
                        self.setState({loading: false, deployed: true, delpoyedAddress: receipt.contractAddress});
                        self._modal.setState({open: true, title: 'Contract Deployed', body: modalBody});
                    }
                }
            );
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
                            <h1>Create Election Contract</h1>
                        </div>
                        { self.state.deployed ?
                            <div class="col-xs-12 text-center">
                                <h1>Existing contract deployed on {self.state.delpoyedAddress}</h1>
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
                                        self.setState({adminAccountData: data, showQRAccount: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="adminAccountInput"
                                        value={self.state.adminAccountData}
                                        onChange={(event) => self.setState({adminAccountData: event.target.value})}
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
                            <div class="col-xs-6 col-xs-offset-3 text-center">
                                <button type="submit" class="btn btn-md btn-default" onClick={() => this.deploy()}>Deploy</button>
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
