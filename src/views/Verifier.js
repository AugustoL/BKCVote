import React from 'react';
import {Link} from "react-router";

export default class Verifier extends React.Component {

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

    render() {
        return(
            <div>
                <div class="col-xs-12 text-center">
                    <h1 class="title">Verifier Options</h1>
                </div>
                <div class="col-xs-12 text-center">
                    <Link to="verifyVote" class="cursor-pointer"><h2 class="title">Verify Vote</h2></Link>
                </div>
            </div>
        )
    }
}
