import React from 'react';
import {Link} from "react-router";

export default class Voter extends React.Component {

    constructor() {
        super();
        var self = this;
    }

    render() {
        return(
            <div>
                <div class="col-xs-12 text-center">
                    <h1 class="title">Voter Options</h1>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="createAccount" class="cursor-pointer"><h2 class="margin-top bargin-bottom">Create Account</h2></Link>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="vote" class="cursor-pointer"><h2 class="margin-top bargin-bottom">Vote</h2></Link>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="viewVote" class="cursor-pointer"><h2 class="margin-top bargin-bottom">View my Vote</h2></Link>
                </div>
            </div>
        )
    }

}
