import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

export default class Vote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            voteToAddress: "",
            voterAddress: "",
            voterData: "",
            voterPassword: "",
            postulants: [],
            postulantsOptions : [],
            showQRToVote: false,
            showQRVoterAddress: false,
            showQRVoterData: false,
            hidePassword: true
        }
    }

    componentWillMount() {
        var self = this;
        if (Store.contract.address != ""){
            Actions.Ethereum.getPostulants(function(err, postulants){
                if (err)
                    console.error(err);
                else {
                    var postulantsOptions = [];
                    for (var i = 0; i < postulants.length; i++)
                        postulantsOptions.push({ value: postulants[i].address, label: postulants[i].party});
                    self.setState({postulants: postulants, postulantsOptions : postulantsOptions});
                }
            });
        }
    }

    submitVote(){
        var self = this;
        self.setState({loading: true});
        var payloadData = Actions.Ethereum.buildFunctionData([
            self.state.voteToAddress
        ], 'vote', Store.contract.ABI)
        var voteTx = Actions.Ethereum.buildTX({
            to: Store.contract.address,
            from : self.state.voterAddress,
            value: 0,
            data: payloadData
        });
        Actions.Account.sign({
            password: self.state.voterPassword,
            data: self.state.voterData
        },
        voteTx,
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
                                Address Voted
                                <br/><strong>{self.state.voteToAddress}</strong><br></br>
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Vote Done', body: modalBody});
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
                        <h1 class="title">Vote</h1>
                    </div>
                    <form class="col-xs-8 col-xs-offset-2">
                        <h3>Vote Information</h3>
                        <div class="form-group">
                            <label for="voteAddressInput">Vote Address</label>
                            <QRReader
                                showQR={self.state.showQRToVote}
                                onError={(e) => console.error(e)}
                                onScan={(data) => {
                                    self.setState({voteToAddress: data, showQRToVote: false});
                                }}
                            ></QRReader>
                            <Select
                                name="selectVoterAddress"
                                value={self.state.voteToAddress}
                                options={self.state.postulantsOptions}
                                onChange={(val) => self.setState({voteToAddress: (val) ? val.value : ''})}
                            />
                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="toAddressInput"
                                    value={self.state.voteToAddress}
                                    onChange={(event) => self.setState({voteToAddress: event.target.value})}
                                    placeholder="Address you want to vote"
                                />
                                {self.state.showQRToVote ?
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRToVote: false})}
                                    >
                                        Close <span class="fa fa-camera"></span>
                                    </span>
                                :
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRToVote: true})}
                                    >
                                        Open <span class="fa fa-camera"></span>
                                    </span>
                                }
                            </div>
                        </div>
                        <h3>Voter Information</h3>
                        <div class="form-group">
                            <label for="addressInput">Address</label>
                            <QRReader
                                showQR={self.state.showQRVoterAddress}
                                onError={(e) => console.error(e)}
                                onScan={(data) => {
                                    self.setState({voterAddress: data, showQRVoterAddress: false});
                                }}
                            ></QRReader>
                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="addressInput"
                                    value={self.state.voterAddress}
                                    onChange={(event) => self.setState({voterAddress: event.target.value})}
                                    placeholder="Your address"
                                />
                                {self.state.showQRVoterAddress ?
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRVoterAddress: false})}
                                    >
                                        Close <span class="fa fa-camera"></span>
                                    </span>
                                :
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRVoterAddress: true})}
                                    >
                                        Open <span class="fa fa-camera"></span>
                                    </span>
                                }
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="voterDataInput">Account</label>
                            <QRReader
                                showQR={self.state.showQRVoterData}
                                onError={(e) => console.error(e)}
                                onScan={(data) => {
                                    self.setState({voterData: data, showQRVoterData: false});
                                }}
                            ></QRReader>
                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="voterDataInput"
                                    value={self.state.voterData}
                                    onChange={(event) => self.setState({voterData: event.target.value})}
                                    placeholder="Your account data"
                                />
                                {self.state.showQRVoterData ?
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRVoterData: false})}
                                    >
                                        Close <span class="fa fa-camera"></span>
                                    </span>
                                :
                                    <span
                                        class="input-group-addon cursor-pointer"
                                        onClick={() => self.setState({showQRVoterData: true})}
                                    >
                                        Open <span class="fa fa-camera"></span>
                                    </span>
                                }
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="voterpasswordInput">Password</label>
                            <div class="input-group">
                                <input
                                    type={self.state.hidePassword ? 'password': 'text'}
                                    class="form-control"
                                    id="voterpasswordInput"
                                    value={self.state.voterPassword}
                                    onChange={(event) => self.setState({voterPassword: event.target.value})}
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
                            <button type="submit" class="btn btn-default" onClick={() => this.submitVote()}>Submit</button>
                        </div>
                    </form>
                    <div class="col-xs-12 text-center">
                        <Link to="voter" class="cursor-pointer"><h4>Go Back</h4></Link>
                    </div>
                    <Modal ref={(c) => this._modal = c} />
                </div>}
            </div>
        )
    }

}
