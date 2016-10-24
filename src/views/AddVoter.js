import React from 'react';
import {Link} from "react-router";

import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class AddVoter extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
        }
    }

    addVoter(){
        var self = this;
        if (
            self._voterAddressInput.isValid() && self._voterNameInput.isValid() &&
            self._voterSurenameInput.isValid() && self._voterBirthDateInput.isValid() &&
            self._voterIDInput.isValid() && self._voterPhisicalAddressInput.isValid() &&
            self._adminAddress.isValid() && self._adminAccount.isValid()
            && self._adminPassword.isValid()
        ){
            var voterAddress = self._voterAddressInput.getValue();
            var voterName = self._voterNameInput.getValue()+' '+self._voterSurenameInput.getValue();
            self.setState({loading: true, loadingMessage: 'Adding Voter'});
            var payloadData = Actions.Ethereum.buildFunctionData([
                self._voterAddressInput.getValue(),
                self._voterNameInput.getValue(),
                self._voterSurenameInput.getValue(),
                self._voterBirthDateInput.getValue(),
                self._voterIDInput.getValue(),
                self._voterPhisicalAddressInput.getValue(),
            ], 'addVoter', Store.contract.ABI)
            var addVoterTX = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : self._adminAddress.getValue(),
                data: payloadData
            });
            Actions.Account.sign({
                password: self._adminPassword.getValue(),
                data: self._adminAccount.getValue()
            }, addVoterTX, function(err, txSigned){
                if (err)
                    console.error(err);
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
                                    Address
                                    <br/><strong>{voterAddress}</strong><br></br>
                                </div>
                                <div class="col-xs-12 text-center margin-bottom">
                                    Voter Name
                                    <br/><strong>{voterName}</strong><br></br>
                                </div>
                            </div>;
                        self.setState({loading: false});
                        self._modal.setState({open: true, title: 'Voter Added', body: modalBody});
                    }
                });
            });
        };
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
                            <h1>Add Voter</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <Input
                                ref={(c) => this._voterAddressInput = c}
                                type='address'
                                title='Voter Address'
                                placeholder='Voter Address'
                            />
                            <Input
                                ref={(c) => this._voterNameInput = c}
                                type='text'
                                regex="^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ ]{2,30}$"
                                title='Voter Name'
                                placeholder='Name'
                            />
                            <Input
                                ref={(c) => this._voterSurenameInput = c}
                                type='text'
                                regex="^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ ]{2,30}$"
                                title='Voter Surename'
                                placeholder='Surename'
                            />
                            <Input
                                ref={(c) => this._voterBirthDateInput = c}
                                type='text'
                                regex="^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$"
                                title='Voter Birth Date'
                                placeholder='DD/MM/YYYY'
                            />
                            <Input
                                ref={(c) => this._voterIDInput = c}
                                type='text'
                                regex="^[0-9]{6,}$"
                                title='Voter ID'
                                placeholder='Voter # Personal ID (Six Numbers or more)'
                            />
                            <Input
                                ref={(c) => this._voterPhisicalAddressInput = c}
                                type='text'
                                regex="^[a-zA-Z1-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ,;. ]{5,50}$"
                                title='Voter Phisical Address'
                                placeholder='Phisical Address'
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
                            <div class="row margin-bottom margin-top text-center">
                                <button  class="btn btn-md btn-default" onClick={() => this.addVoter()}>Add Voter</button>
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
