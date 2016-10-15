import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

export default class AddPostulant extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            postulantAddress: "",
            partyName: "",
            adminAccounutData: "",
            adminPassword: "",
            showQRPostulant: false,
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


    addPostulant(){
        var self = this;
        self.setState({loading: true});
        var payloadData = Actions.Ethereum.buildFunctionData([
            self.state.postulantAddress,
            self.state.partyName
        ], 'addPostulant', Store.contract.ABI)
        var addPOstulantTx = Actions.Ethereum.buildTX({
            to: Store.contract.address,
            from : self.state.adminAddress,
            value: 0,
            data: payloadData,
            nonce: Store.web3.toHex(parseInt( Store.web3.eth.getTransactionCount( self.state.adminAddress ) ))
        });
        Actions.Account.sign({
            password: self.state.adminPassword,
            data: self.state.adminAccounutData
        }, addPOstulantTx, function(err, txSigned){
            Actions.Ethereum.sendTXs([txSigned], function(err){
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
                                Postulant
                                <br/><strong>{self.state.postulantAddress}</strong><br></br>
                            </div>
                            <div class="col-xs-12 text-center margin-bottom">
                                Party Name
                                <br/><strong>{self.state.partyName}</strong><br></br>
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Postulant Added', body: modalBody});
                }
            });
        });
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message="Adding Postulant"/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Add Postulant</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <div class="form-group">
                                <label for="addressInput">Postulant Address</label>
                                <QRReader
                                    showQR={self.state.showQRPostulant}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({postulantAddress: data, showQRPostulant: false});
                                    }}
                                ></QRReader>
                                <Select
                                    name="selectVoterAddress"
                                    value={self.state.postulantAddress}
                                    options={self.state.votersOptions}
                                    onChange={(val) => self.setState({postulantAddress: (val) ? val.value : ''})}
                                />
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.postulantAddress}
                                        onChange={(event) => self.setState({postulantAddress: event.target.value})}
                                        placeholder="Postulant Address"
                                    />
                                    {self.state.showQRPostulant ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRPostulant: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRPostulant: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="nameInput">Party Name</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="nameInput"
                                    value={self.state.partyName}
                                    onChange={(event) => self.setState({partyName: event.target.value})}
                                    placeholder="Party Name"
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
                                <button  class="btn btn-md btn-default" onClick={() => this.addPostulant()}>Add Postulant</button>
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
