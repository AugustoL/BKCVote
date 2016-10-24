import React from 'react';
import {Link} from "react-router";

import Select from 'react-select';
import async from 'async';

import Store from "../Store";
import * as Actions from "../actions";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import Input from "../components/Input";

export default class AddPostulant extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }


    addPostulant(){
        var self = this;
        if (
            self._postulantID.isValid() && self._postulantName.isValid() &&
            self._partyName.isValid() && self._adminAddress.isValid() &&
            self._adminAccount.isValid() && self._adminPassword.isValid()
        ){
            var postulantID = self._postulantID.getValue();
            var postulantName = self._postulantName.getValue();
            var partyName = self._partyName.getValue();
            var adminAddress = self._adminAddress.getValue();
            var adminPassword = self._adminPassword.getValue();
            var adminAccount = self._adminAccount.getValue();
            self.setState({loading: true});
            var payloadData = Actions.Ethereum.buildFunctionData([
                postulantID,
                postulantName,
                partyName
            ], 'addPostulant', Store.contract.ABI)
            var addPOstulantTx = Actions.Ethereum.buildTX({
                to: Store.contract.address,
                from : adminAddress,
                data: payloadData
            });
            Actions.Account.sign({
                password: adminPassword,
                data: adminAccount
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
                                    <strong>Postulant #{postulantID}</strong>
                                    <br/>Name
                                    <br/>{postulantName}<br/>
                                </div>
                                <div class="col-xs-12 text-center margin-bottom">
                                    Party Name
                                    <br/><strong>{partyName}</strong><br/>
                                </div>
                            </div>;
                        self.setState({loading: false});
                        self._modal.setState({open: true, title: 'Postulant Added', body: modalBody});
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
                    <Loader message="Adding Postulant"/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1>Add Postulant</h1>
                        </div>
                        <form class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3">
                            <Input
                                ref={(c) => this._postulantID = c}
                                type='text'
                                regex="^[0-9]{6,}$"
                                title='Postulant ID'
                                placeholder='# Postulant ID (Six Numbers or more)'
                            />
                            <Input
                                ref={(c) => this._postulantName = c}
                                type='text'
                                regex="^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ ]{2,30}$"
                                title='Postulant Name'
                                placeholder='Postulant Name'
                            />
                            <Input
                                ref={(c) => this._partyName = c}
                                type='text'
                                regex="^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœñÑ ]{2,30}$"
                                title='Party Name'
                                placeholder='Party Name'
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
