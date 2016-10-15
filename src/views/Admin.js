import React from 'react';
import {Link} from "react-router";

export default class Admin extends React.Component {

    constructor() {
        super();
        var self = this;
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

	componentDidUpdate(){
	}

    updateInfo(callback){
        Actions.Ethereum.getVoters(function(err, results){
            console.log('Voters: ', results);
        });
        Actions.Ethereum.getPostulants(function(err, results){
            console.log('Postulants: ', results);
        });
    }

    render() {
        return(
            <div>
                <div class="col-xs-12 text-center">
                    <h1 class="title">Admin Options</h1>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="createContract" class="cursor-pointer"><h2 class="title">Create Contract</h2></Link>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="addVoter" class="cursor-pointer"><h2 class="title">Add Voter</h2></Link>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="setVerifier" class="cursor-pointer"><h2 class="title">Set Verifier</h2></Link>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="addPostulant" class="cursor-pointer"><h2 class="title">Add Postulant</h2></Link>
                </div>
            </div>
        )
    }

}
