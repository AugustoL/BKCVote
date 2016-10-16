
//React ,router and history
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute } from "react-router";
import createHashHistory from 'history/lib/createHashHistory';

//Views
import Layout from "./Layout";
import Home from "./views/Home";

import Admin from "./views/Admin";
import CreateContract from "./views/CreateContract";
import AddVoter from "./views/AddVoter";
import AddPostulant from "./views/AddPostulant";
import setVerifier from "./views/setVerifier";

import Voter from "./views/Voter";
import Vote from "./views/Vote";
import CreateAccount from "./views/CreateAccount";

import Verifier from "./views/Verifier";
import VerifyVote from "./views/VerifyVote";

import Simulator from "./views/Simulator";

import ViewVote from "./views/ViewVote";
import Results from "./views/Results";
import Contact from "./views/Contact";

import Configure from "./views/Configure";
import Accounts from "./views/Accounts";

//Actions
import * as Actions from "./actions";

import Store from "./Store";
var appConfig = JSON.parse(require('./config.json'));

Actions.Config.configure(Store.web3Provider || appConfig.web3Provider);

//CSS
require('../node_modules/bootstrap/dist/css/bootstrap.css');
require('../node_modules/bootstrap/dist/css/bootstrap-theme.css');
require('../node_modules/react-select/dist/react-select.css');
require('font-awesome-webpack');
require('url');
require('./css/all.css');

//Set history
const history = createHashHistory({ queryKey: false })
const app = document.getElementById('app');


//Set router
ReactDOM.render(
  <Router history={history}>
    <Route path="/" component={Layout}>

        <IndexRoute component={Home}></IndexRoute>

        <Route path="/admin" name="admin" component={Admin}></Route>
        <Route path="/createContract" name="createContract" component={CreateContract}></Route>
        <Route path="/addVoter" name="addVoter" component={AddVoter}></Route>
        <Route path="/addPostulant" name="addPostulant" component={AddPostulant}></Route>
        <Route path="/setVerifier" name="setVerifier" component={setVerifier}></Route>

        <Route path="/voter" name="voter" component={Voter}></Route>
        <Route path="/vote" name="vote" component={Vote}></Route>
        <Route path="/createAccount" name="createAccount" component={CreateAccount}></Route>

        <Route path="/verifier" name="verifier" component={Verifier}></Route>
        <Route path="/verifyVote" name="VerifyVote" component={VerifyVote}></Route>

        <Route path="/simulator" name="simulator" component={Simulator}></Route>

        <Route path="/viewVote" name="viewVote" component={ViewVote}></Route>
        <Route path="/results" name="results" component={Results}></Route>
        <Route path="/contact" name="contact" component={Contact}></Route>

        <Route path="/configure" name="configure" component={Configure}></Route>
        <Route path="/accounts" name="accounts" component={Accounts}></Route>

    </Route>
  </Router>,
app);
