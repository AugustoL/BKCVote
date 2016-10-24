import React from 'react';
import {Link} from "react-router";
import QRCode from "react-qr";

import * as Actions from "../actions";
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Input from '../components/Input';

export default class createAccount extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : false
        }
    }

    createAccount(){
        var self = this;
        if (self._newAccountPassword.isValid()){
            var password = self._newAccountPassword.getValue();
            this.setState({loading: true});
            Actions.Account.createAccount({password: password}, function(err, info){
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
                                Your address
                                <br/><strong>0x{info.address}</strong><br></br>
                            </div>
                            <div class="col-xs-12 text-center margin-bottom">
                                Your seed phrase
                                <br/><strong>{info.private.seed}</strong><br></br>
                            </div>
                            <div class="col-xs-12 text-center margin-bottom">
                                Your password
                                <br/><strong>{info.private.password}</strong><br></br>
                            </div>
                            <div class="col-xs-12 col-md-6 margin-bottom text-center">
                                <h3><strong> Address QR </strong></h3>
                                <QRCode text={info.address}/>
                            </div>
                            <div class="col-xs-12 col-md-6 margin-bottom text-center">
                                <h3><strong> Account Data QR </strong></h3>
                                <QRCode text={info.data}/>
                            </div>
                            <div class="row margin-bottom text-center">
                                <a class="btn btn-default" download="account.html" href={info.file}>Download Account File</a>
                            </div>
                        </div>;
                    self.setState({loading: false});
                    self._modal.setState({open: true, title: 'Accunt Created', body: modalBody});
                }
            })
        }
    }

    render() {
        var self = this;
        return(
            <div>
                { self.state.loading ?
                    <Loader message="Creating Account"/>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h1 class="title">Create Account</h1>
                        </div>
                        <div class="row">
                            <div class="col-xs-6 cols-xs-offset-2 col-md-4 col-md-offset-4">
                                <Input
                                    ref={(c) => this._newAccountPassword = c}
                                    regex="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#_~])[A-Za-z0-9$@$!%*?&#_~]{8,}"
                                    type='password'
                                    title='Password'
                                    placeholder='Password (Uppercase and lowercase letters with a number and symbol with minimun length of eight)'
                                />
                            </div>
                        </div>
                        <div class="col-xs-12 text-center margin-top">
                            <button type="submit" class="btn btn-default" onClick={() => this.createAccount()}>Create Account</button>
                        </div>
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
