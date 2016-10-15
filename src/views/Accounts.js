import React from 'react';
import {Link} from "react-router";

import async from 'async';

import * as Actions from "../actions";
import Store from "../Store";

var appAccounts = JSON.parse(require('../../blockchain/accounts.json'));

export default class Accounts extends React.Component {

    constructor() {
        super();
        this.state = {
            contract: Store.contract || {
                address: "",
                ABI: []
            },
            storageAccounts: Store.accounts || [],
            adminAccount: appAccounts.admin,
            appAccounts: appAccounts.users
        }
        console.log(appAccounts)
    }

    render() {
        var self = this;
        return(
            <div>
                <div class="col-xs-12 text-center">
                    <h2>Admin Account</h2>
                </div>
                <div class="col-xs-12 text-center">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-center">Address</th>
                                <th class="text-center">Password</th>
                                <th class="text-center">Account Data</th>
                            </tr>
                        </thead>
                            <tbody>
                            <tr>
                                <th>0</th>
                                <td><small>{self.state.adminAccount.address}</small></td>
                                <td>{self.state.adminAccount.password}</td>
                                <td><p style={{maxWidth:"200px", wordBreak: "break-all"}}><small>{self.state.adminAccount.data}</small></p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-xs-12 text-center">
                    <h2>Accounts on Local Storage</h2>
                </div>
                <div class="col-xs-12 text-center">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-center">Address</th>
                                <th class="text-center">Password</th>
                                <th class="text-center">Account Data</th>
                            </tr>
                        </thead>
                            <tbody>
                            {self.state.storageAccounts.map(function(account, index){
                                return (
                                    <tr key={index}>
                                        <th>{index}</th>
                                        <td><small>{account.address}</small></td>
                                        <td>{account.password}</td>
                                        <td><p style={{maxWidth:"200px", wordBreak: "break-all"}}><small>{account.data}</small></p></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div class="col-xs-12 text-center">
                    <h2>Accounts on blockchain/accounts.json</h2>
                </div>
                <div class="col-xs-12 text-center">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-center">Address</th>
                                <th class="text-center">Password</th>
                                <th class="text-center">Account Data</th>
                            </tr>
                        </thead>
                            <tbody>
                            {self.state.appAccounts.map(function(account, index){
                                return (
                                    <tr key={index}>
                                        <th>{index}</th>
                                        <td><small>{account.address}</small></td>
                                        <td>{account.password}</td>
                                        <td><p style={{maxWidth:"200px", wordBreak: "break-all"}}><small>{account.data}</small></p></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

}
