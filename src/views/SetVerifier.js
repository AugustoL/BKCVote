import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class SetVerifier extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }

    componentWillMount() {
    }

    setVerifier(){
        var self = this;
        if (
            self._voterAddress.isValid() && self._verifierAddress.isValid() &&
            self._adminAddress.isValid() && self._adminAccount.isValid() &&
            self._adminPassword.isValid()
        ){
            self.setState({loading: true});
            var voterAddress = self._voterAddress.getValue();
            var verifierAddress = self._verifierAddress.getValue();
            var adminAddress = self._adminAddress.getValue();
            var adminPassword = self._adminPassword.getValue();
            var adminAccount = self._adminAccount.getValue();
            Actions.Ethereum.getVoterInfo(voterAddress, function(err, info){
                if (info.voted || (info.verifier == '0x0000000000000000000000000000000000000000')){
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        voterAddress,
                        verifierAddress
                    ], 'setVerifier', Store.contract.ABI)
                    var setVerifierTx = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : adminAddress,
                        data: payloadData
                    });
                    Actions.Account.sign({
                        password: adminPassword,
                        data: adminAccount
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
                                            Verifier
                                            <br/><strong>{verifierAddress}</strong><br></br>
                                        </div>
                                        <div class="col-xs-12 text-center margin-bottom">
                                            Voter
                                            <br/><strong>{voterAddress}</strong><br></br>
                                        </div>
                                    </div>;
                                self.setState({loading: false});
                                self._modal.setState({open: true, title: 'Verifier Set', body: modalBody});
                            }
                        });
                    });
                } else {
                    var modalBody =
                        <div class="row modalBody">
                            <div class="col-xs-12 text-center margin-bottom">
                                Verifier already set.
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Error', body: modalBody});
                }
            });
        }
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
                            <Input
                                ref={(c) => this._voterAddress = c}
                                type='address'
                                title='Voter Address'
                                placeholder='Voter Address'
                            />
                            <Input
                                ref={(c) => this._verifierAddress = c}
                                type='address'
                                title='Verifier Address'
                                placeholder='Verifier Address'
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
