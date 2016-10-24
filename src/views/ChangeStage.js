import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class ChangeStage extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }

    setStage(newStage){
        var self = this;
        if (
            self._adminAddress.isValid() &&self._adminAccount.isValid() && self._adminPassword.isValid()
        ){
            self.setState({loading: true});
            var txsToSend = [];
            var payloadData = Actions.Ethereum.buildFunctionData([
                newStage,
            ], 'setStage', Store.contract.ABI)
            var setVerifierTx = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : self._adminAddress.getValue(),
                data: payloadData
            });
            Actions.Account.sign({
                password: self._adminPassword.getValue(),
                data: self._adminAccount.getValue()
            }, setVerifierTx, function(err, txSigned){
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
                                    <br/><strong>New Stage {newStage}</strong><br></br>
                                </div>
                            </div>;
                        self.setState({loading: false});
                        self._modal.setState({open: true, title: 'Stage Changed', body: modalBody});
                    }
                });
            });
        }
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message="Changing Election Stage"/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Set Stage</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
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
                            <div class="row margin-bottom margin-top">
                                <div class="col-xs-6 text-center">
                                    <button class="btn btn-md btn-default" onClick={() => this.setStage(1)}>Start Election</button>
                                </div>
                                <div class="col-xs-6 text-center">
                                    <button class="btn btn-md btn-default" onClick={() => this.setStage(2)}>End Election</button>
                                </div>
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
