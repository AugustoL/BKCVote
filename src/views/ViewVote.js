
import React from 'react';
import {Link} from "react-router";

import * as Actions from "../actions";
import Store from "../Store";
import Loader from "../components/Loader";
import Modal from '../components/Modal';
import QRReader from "../components/QRReader";

export default class ViewVote extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            voterAddress: "",
            voterData: "",
            voterPassword: "",
            showQRVoterAddress: false,
            showQRVoterData: false,
            hidePassword: true
        }
    }

    viewVote() {
        var self = this;
        self.setState({loading: true});
        var payloadData = Actions.Ethereum.buildFunctionData([], 'seeVote', Store.contract.ABI)
        Actions.Account.call({
            password: self.state.voterPassword,
            data: self.state.voterData
        },{
            to: Store.contract.address,
            from : self.state.voterAddress,
            data: payloadData,
        },
        function(err, result){
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
                            <h2>{(parseInt(result.substring(66)) == 1) ? 'Vote Done' : 'Vote Not Done'}</h2>
                        </div>
                        {(parseInt(result.substring(66)) == 1) ?
                            <div class="col-xs-12 text-center margin-bottom">
                                Address Voted
                                <br/><strong>{'0x'+result.substring(26,66)}</strong><br></br>
                            </div>
                        : <div/>}
                    </div>;
                self.setState({loading: false});
                self._modal.setState({open: true, title: 'Vote Information', body: modalBody});
            }
            self.setState({loading: false});
        });
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
                            <h3>Your Information</h3>
                            <div class="form-group">
                                <label for="addressInput">Address</label>
                                <QRReader
                                    showQR={self.state.showQRVoterAddress}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({voterAddress: data, showQRVoterAddress: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="addressInput"
                                        value={self.state.voterAddress}
                                        onChange={(event) => self.setState({voterAddress: event.target.value})}
                                        placeholder="Your address"
                                    />
                                    {self.state.showQRVoterAddress ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoterAddress: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoterAddress: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="voterDataInput">Account</label>
                                <QRReader
                                    showQR={self.state.showQRVoterData}
                                    onError={(e) => console.error(e)}
                                    onScan={(data) => {
                                        self.setState({voterData: data, showQRVoterData: false});
                                    }}
                                ></QRReader>
                                <div class="input-group">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="voterDataInput"
                                        value={self.state.voterData}
                                        onChange={(event) => self.setState({voterData: event.target.value})}
                                        placeholder="Your account data"
                                    />
                                    {self.state.showQRVoterData ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoterData: false})}
                                        >
                                            Close <span class="fa fa-camera"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({showQRVoterData: true})}
                                        >
                                            Open <span class="fa fa-camera"></span>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="voterpasswordInput">Password</label>
                                <div class="input-group">
                                    <input
                                        type={self.state.hidePassword ? 'password': 'text'}
                                        class="form-control"
                                        id="voterpasswordInput"
                                        value={self.state.voterPassword}
                                        onChange={(event) => self.setState({voterPassword: event.target.value})}
                                        placeholder="Your password"
                                    />
                                    {self.state.hidePassword ?
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({hidePassword: false})}
                                        >
                                            <span class="fa fa-eye"></span>
                                        </span>
                                    :
                                        <span
                                            class="input-group-addon cursor-pointer"
                                            onClick={() => self.setState({hidePassword: true})}
                                        >
                                            <span class="fa fa-eye-slash"></span>
                                        </span>
                                    }
                                </div>
                            </div>
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
