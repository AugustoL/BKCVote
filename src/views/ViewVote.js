
import React from 'react';
import {Link} from "react-router";

import * as Actions from "../actions";
import Store from "../Store";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class ViewVote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }

    viewVote() {
        var self = this;
        if (
            self._voterAddress.isValid() && self._voterAccount.isValid() && self._voterPassword.isValid()
        ){
            var voterAddress = self._voterAddress.getValue();
            var voterPassword = self._voterPassword.getValue();
            var voterAccount = self._voterAccount.getValue();
            self.setState({loading: true});
            Actions.Account.call({
                password: voterPassword,
                account: voterAccount,
                from: voterAddress,
                payload: Actions.Ethereum.buildFunctionData([], 'seeVote', Store.contract.ABI),
                functionName: 'seeVote'
            },
            function(err, result){
                if (result[0].toNumber() == 0){
                    if (result[0].toNumber() == 0)
                        err = 'Address not registered as voter';
                    var modalBody =
                        <div class="row modalBody">
                            <div class="col-xs-12 text-center margin-bottom">
                                {err}
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Error', body: modalBody});
                } else {
                    if (result[0].toNumber() == 1){
                        var modalBody =
                            <div class="row modalBody">
                                <div class="col-xs-12 text-center margin-bottom">
                                    <h2>Vote Not Done</h2>
                                </div>
                            </div>;
                        self.setState({loading: false});
                        self._modal.setState({open: true, title: 'Vote Information', body: modalBody});
                    } else {
                        Actions.Ethereum.getPostulant(result[0].toNumber(), function(err, postulantInfo){
                            var modalBody =
                                <div class="row modalBody">
                                    <div class="col-xs-12 text-center margin-bottom">
                                        <h2>Vote Done</h2>
                                    </div>
                                    <div class="col-xs-12 text-center margin-bottom">
                                        Postulant Voted
                                        <br/><strong>{postulantInfo.name}</strong><br></br>
                                    </div>
                                </div>;
                            self.setState({loading: false});
                            self._modal.setState({open: true, title: 'Vote Information', body: modalBody});
                        });
                    }
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
                                <button type="submit" class="btn btn-default" onClick={() => this.viewVote()}>Submit</button>
                            </div>
                        </form>
                        <div class="col-xs-12 text-center">
                            <Link to="voter" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                        <Modal ref={(c) => this._modal = c} />
                    </div>
                }
            </div>
        )
    }

}
