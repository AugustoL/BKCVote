import React from 'react';
import {Link} from "react-router";

import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

var contracts = JSON.parse(require('../contracts.json'));

export default class CreateContract extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            delpoyedAddress: Store.contract.address
        }
    }

    deploy(){
        var self = this;
        if (
            self._electionName.isValid() && self._adminAddress.isValid() &&
            self._adminAccount.isValid() && self._adminPassword.isValid()
        ){
            var adminAddress = self._adminAddress.getValue();
            var adminPassword = self._adminPassword.getValue();
            var adminAccount = self._adminAccount.getValue();
            var electionName = self._electionName.getValue();
            self.setState({loading: true, loadingMessage: 'Deploying Contract'});
            Actions.Account.unlockAccount({
                password: adminPassword,
                data: adminAccount
            },
            function(err, info){
                Actions.Ethereum.deployContract(
                    info.privateKey,
                    adminAddress,
                    '0x'+contracts.BKCVote.bytecode,
                    JSON.parse(contracts.BKCVote.interface),
                    [
                        electionName
                    ],
                    Store.web3.toWei('1', 'ether'),
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
                            Actions.Store.setContract(receipt.contractAddress, JSON.parse(contracts.BKCVote.interface));
                            self.setState({loading: false, delpoyedAddress: receipt.contractAddress});
                            self._modal.setState({open: true, title: 'Contract Deployed', body: modalBody});
                        }
                    }
                );
            });
        }
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message={self.state.loadingMessage || ''}/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Create Election Contract</h1>
                        </div>
                        { self.state.delpoyedAddress != "" ?
                            <div class="col-xs-12 text-center">
                                <h1>Existing contract deployed on {self.state.delpoyedAddress}</h1>
                            </div>
                        : <div/>
                        }
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <h3>Contract Information</h3>
                            <Input
                                ref={(c) => this._electionName = c}
                                type='text'
                                regex="^[a-zA-Z1-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ ]{2,30}$"
                                title='Election Name'
                                placeholder='Election Name'
                            />
                            <h3>Admin Info</h3>
                            <Input
                                ref={(c) => this._adminAddress = c}
                                type='address'
                                title='Admin Address'
                                placeholder='Address'
                            />
                            <Input
                                ref={(c) => this._adminAccount = c}
                                type='account'
                                regex="^[a-zA-Z0-9+/\r\n]+={0,2}$"
                                title='Admin Account'
                                placeholder='Account'
                            />
                            <Input
                                ref={(c) => this._adminPassword = c}
                                regex="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#_~])[A-Za-z0-9$@$!%*?&#_~]{8,}"
                                type='password'
                                title='Admin Password'
                                placeholder='Password'
                            />
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
