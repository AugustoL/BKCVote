import React from 'react';
import {Link} from "react-router";

import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

var appConfig = JSON.parse(require('../config.json'));

var contracts = JSON.parse(require('../contracts.json'));

export default class Configure extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            contractAddress: Store.contract.address || appConfig.contractAddress || '',
            web3Provider: Store.web3Provider || appConfig.web3Provider || '',
        }
    }

    componentWillMount() {
        var self = this;
        console.log(Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address))
        if (Store.web3.eth.contract(Store.contract.ABI).at(Store.contract.address)){
            Actions.Ethereum.getContractInfo(function(err, info){
                if (err)
                    console.error(err);
                else
                    self.setState({contractInfo: info});
            })
        }
    }

    configure(){
        var self = this;
        Actions.Config.configure(self.state.web3Provider);
        Actions.Store.setContract(self.state.contractAddress, JSON.parse(contracts.BKCVote.interface));
        window.location.reload();
    }

    clearStorage(){
        window.localStorage.clear();
        window.location.reload();
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
                            <h1>Configuration</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <div class="form-group">
                                <label for="addressInput">Contact Address</label>
                                <QRReader
                                    showQR={self.state.showQRAddress}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({contractAddress: data, showQRAddress: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.contractAddress}
                                        onChange={(event) => self.setState({contractAddress: event.target.value})}
                                        placeholder="Contract Address"
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
                                <label for="web3HostINput">Web3 Provider</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="web3HostINput"
                                    value={self.state.web3Provider}
                                    onChange={(event) => self.setState({web3Provider: event.target.value})}
                                    placeholder="http://localhost:8545"
                                />
                            </div>
                            <div class="row margin-bottom margin-top text-center">
                                <button type='submit' class="btn btn-md btn-default" onClick={() => this.configure()}>Configure</button>
                            </div>
                            <div class="row margin-bottom margin-top text-center">
                                <button class="btn btn-md btn-default" onClick={() => {this.clearStorage()}}>Clear Storage</button>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="/" class="cursor-pointer"><h4 class="title">Go Back</h4></Link>
                        </div>
                    </div>
                }
            </div>
        )
    }

}
