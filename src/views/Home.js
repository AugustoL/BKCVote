import React from 'react';
import {Link} from "react-router";

import async from 'async';

import * as Actions from "../actions";
import Store from "../Store";
import Loader from "../components/Loader";

export default class Home extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            info: Actions.Ethereum.getNodeInfo(),
            voters: [],
            postulants: [],
            contractInfo: null,
        }
    }

    componentWillMount() {
        if (Store.contract.address != ""){
            this.updateInfo();
        } else {
            this.setState({loading: false});
        }
    }

    updateInfo(){
        var self = this;
        async.series([
            function(callback) {
                Actions.Ethereum.getVoters(function(err, voters){
                    console.log('Voters: ', voters);
                    callback(err, voters);
                });
            },
            function(callback) {
                Actions.Ethereum.getPostulants(function(err, postulants){
                    console.log('Postulants: ', postulants);
                    callback(err, postulants);
                });
            },
            function(callback) {
                Actions.Ethereum.getContractInfo(function(err, info){
                    console.log('Contract info: ', info);
                    callback(err, info);
                });
            }
        ],
        function(err, results) {
            if (err)
                console.error(err);
            self.setState({
                loading: false,
                voters: results[0],
                postulants: results[1],
                contractInfo: results[2],
                info: Actions.Ethereum.getNodeInfo()
            });
        });
    }

    render() {
        var self = this;
        return(
            <div>
                <div class="col-xs-12 text-center">
                    <h1>Blockchain Vote App</h1>
                </div>
                { self.state.loading ?
                    <div class="row text-center">
                        <h1 class="loading">Loading</h1>
                        <h1><i class="fa fa-refresh fa-spin"></i></h1>
                    </div>
                : !self.state.info.connected ?
                    <div>
                        <div class="col-xs-12 text-center">
                            <h2>Not connected to blockchain</h2>
                        </div>
                    </div>
                : !self.state.contractInfo ?
                <div>
                    <div class="col-xs-12 text-center">
                        <h2>Couldnt get election information</h2>
                    </div>
                </div>
                :
                    <div>
                        <div class="col-xs-12 text-center">
                            <h3>{self.state.contractInfo.electionName}</h3>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h4>{self.state.info.hashrate} Hashrate</h4>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h4>{self.state.info.peers} Peers</h4>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h4>Election Stage {self.state.contractInfo.stage}</h4>
                        </div>
                        <div class="col-xs-6 text-center">
                            <h3>{self.state.contractInfo.totalVoters} Voters</h3>
                        </div>
                        <div class="col-xs-6 text-center">
                            <h3>{self.state.postulants.length} Postulants</h3>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h3>{self.state.contractInfo.votesToBeDone} Votes To Be Done</h3>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h3>{self.state.contractInfo.votesDone} Votes Done</h3>
                        </div>
                        <div class="col-xs-4 text-center">
                            <h3>{self.state.contractInfo.votesToVerify} Votes To Be Verified</h3>
                        </div>
                        <div class="col-xs-12 text-center">
                            <h2>Results</h2>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th class="text-center">Postulant</th>
                                        <th class="text-center">Party Name</th>
                                        <th class="text-center">Votes</th>
                                    </tr>
                                </thead>
                                    <tbody>
                                    {(self.state.postulants.length > 0) ? self.state.postulants.map(function(postulant, index){
                                        return (
                                            <tr key={index}>
                                                <th>{index+1}</th>
                                                <td>{postulant.name} {postulant.surename}</td>
                                                <td>{postulant.party}</td>
                                                <td>{postulant.votes}</td>
                                            </tr>
                                        );
                                    }) : <div/>}
                                </tbody>
                            </table>
                        </div>
                        <div class="col-xs-12 text-center">
                            <h2>Voters</h2>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th># ID</th>
                                        <th class="text-center">First Name</th>
                                        <th class="text-center">Last Name</th>
                                        <th class="text-center">Vote Status</th>
                                    </tr>
                                </thead>
                                    <tbody>
                                    {(self.state.voters.length > 0) ? self.state.voters.map(function(voter, index){
                                        return (
                                            <tr key={index}>
                                                <th>{voter.id}</th>
                                                <td>{voter.name}</td>
                                                <td>{voter.surename}</td>
                                                <td>{(!voter.voted) ? "Not Voted" : (!voter.verified) ? "Not Verified" : "Voted"}</td>
                                            </tr>
                                        );
                                    }) : <div/>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>
        )
    }

}
