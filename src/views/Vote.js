import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class Vote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            postulantSelected: "",
            postulants: [],
            postulantsOptions : []
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
                        postulantsOptions.push({ value: postulants[i].id, label: postulants[i].party+' - '+postulants[i].name});
                    self.setState({postulants: postulants, postulantsOptions : postulantsOptions});
                }
            });
        }
    }

    submitVote(){
        var self = this;
        if (
            self._voterAddress.isValid() && self._voterAccount.isValid()
            && self._voterPassword.isValid() && (self.state.postulantSelected != "")
        ){
            var voterAddress = self._voterAddress.getValue();
            var voterPassword = self._voterPassword.getValue();
            var voterAccount = self._voterAccount.getValue();
            self.setState({loading: true});
            Actions.Ethereum.getVoterInfo(voterAddress, function(err, info){
                if (!info.voted && info.verifier != '0x0000000000000000000000000000000000000000'){
                    var payloadData = Actions.Ethereum.buildFunctionData([
                        self.state.postulantSelected
                    ], 'vote', Store.contract.ABI)
                    var voteTx = Actions.Ethereum.buildTX({
                        to: Store.contract.address,
                        from : voterAddress,
                        data: payloadData
                    });
                    Actions.Account.sign({
                        password: voterPassword,
                        data: voterAccount
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
                                            Postulant Selected
                                            <br/><strong>{self.state.postulantSelected}</strong><br></br>
                                        </div>
                                    </div>;
                                self.setState({loading: false});
                                self._modal.setState({open: true, title: 'Vote Done', body: modalBody});
                            }
                        });
                    });
                } else {
                    var modalBody =
                        <div class="row modalBody">
                            { info.voted ?
                                <div class="col-xs-12 text-center margin-bottom">
                                    Vote already done.
                                </div>
                                : <div/>
                            }
                            { info.verifier == '0x0000000000000000000000000000000000000000' ?
                                <div class="col-xs-12 text-center margin-bottom">
                                    Verifier not set.
                                </div>
                                : <div/>
                            }
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
                        <h1 class="title">Vote</h1>
                    </div>
                    <form class="col-xs-8 col-xs-offset-2">
                        <h3>Vote Information</h3>
                        <div class="form-group">
                            <label for="voteAddressInput">Postulant to vote</label>
                            <Select
                                name="selectVoterAddress"
                                value={self.state.postulantSelected}
                                options={self.state.postulantsOptions}
                                onChange={(val) => self.setState({postulantSelected: (val) ? val.value : ''})}
                            />
                            <div class="form-group">
                                <input
                                    type="text"
                                    class="form-control"
                                    value={self.state.postulantSelected}
                                    onChange={(event) => self.setState({postulantSelected: event.target.value})}
                                    placeholder="ID you want to vote"
                                />
                            </div>
                        </div>
                        <h3>Voter Info</h3>
                        <Input
                            ref={(c) => this._voterAddress = c}
                            type='address'
                            title='Voter Address'
                            placeholder='Voter Address'
                        />
                        <Input
                            ref={(c) => this._voterAccount = c}
                            type='account'
                            regex="^[a-zA-Z0-9+/\r\n]+={0,2}$"
                            title='Voter Account'
                            placeholder='Account'
                        />
                        <Input
                            ref={(c) => this._voterPassword = c}
                            regex="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#_~])[A-Za-z0-9$@$!%*?&#_~]{8,}"
                            type='password'
                            title='Voter Password'
                            placeholder='Password'
                        />
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
