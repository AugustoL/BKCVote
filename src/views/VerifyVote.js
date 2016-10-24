import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class VerifyVote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }

    verifyVote(){
        var self = this;
        if (
            self._voterAddress.isValid() && self._verifierAddress.isValid() &&
            self._verifierAccount.isValid() && self._verifierPassword.isValid()
        ){
            var voterAddress = self._voterAddress.getValue();
            var verifierAddress = self._verifierAddress.getValue();
            var verifierPassword = self._verifierPassword.getValue();
            var verifierAccount = self._verifierAccount.getValue();
            self.setState({loading: true});
            Actions.Ethereum.getVoterInfo(voterAddress, function(err, info){
                if (info.voted || (info.verifier != verifierAddress)){
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        voterAddress
                    ], 'verify', Store.contract.ABI)
                    var verifyTx = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : verifierAddress,
                        data: payloadData
                    });
                    Actions.Account.sign({
                        password: verifierPassword,
                        data: verifierAccount
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
                                            <h2>Verified vote of address {voterAddress}</h2>
                                        </div>
                                    </div>;
                                self.setState({loading: false});
                                self._modal.setState({open: true, title: 'Vote Verified', body: modalBody});
                            }
                        });
                    });
                } else {
                    var modalBody =
                        <div class="row modalBody">
                            <div class="col-xs-12 text-center margin-bottom">
                                Cant verify the address.
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
                    <Loader />
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Verify Vote</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <Input
                                ref={(c) => this._voterAddress = c}
                                type='address'
                                title='Voter Address'
                                placeholder='Voter Address'
                            />
                            <h3>Verifier Info</h3>
                            <Input
                                ref={(c) => this._verifierAddress = c}
                                type='address'
                                title='Verifier Address'
                                placeholder='Verifier Address'
                            />
                            <Input
                                ref={(c) => this._verifierAccount = c}
                                type='account'
                                regex="^[a-zA-Z0-9+/\r\n]+={0,2}$"
                                title='Verifier Account'
                                placeholder='Account'
                            />
                            <Input
                                ref={(c) => this._verifierPassword = c}
                                regex="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#_~])[A-Za-z0-9$@$!%*?&#_~]{8,}"
                                type='password'
                                title='Verifier Password'
                                placeholder='Password'
                            />
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
