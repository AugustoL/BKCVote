
import React from 'react';
import {Link} from "react-router";

import * as Actions from "../actions";
import Store from "../Store";

export default class Navbar extends React.Component {

    constructor() {
        super();
        this.state = {
            info: Actions.Ethereum.getNodeInfo(),
        }
    }

    componentWillMount() {
        var self = this;
        setInterval( () => {
            this.setState({info: Actions.Ethereum.getNodeInfo()});
        }, 5000 );
    }

    render() {
        const path = window.location.hash;
        return(
            <nav class="navbar navbar-default navbar-static-top">
                <div class="container">
                    <div class="navbar-header">
                        <Link class="navbar-brand" to="/">BKCVote</Link>
                    </div>
                    <div id="navbar" class="navbar-collapse collapse">
                        <ul class="nav navbar-nav">
                            <li class={(path.match(/^\#\/voter/) || path.match(/^\#\/viewVote/) || path.match(/^\#\/createVoter/)) ? "active" : ""}><Link to="voter" class="cursor-pointer">Voter</Link></li>
                            <li class={path.match(/^\#\/verifier/) ? "active" : ""}><Link to="verifier" class="cursor-pointer">Verifier</Link></li>
                            <li class={path.match(/^\#\/admin/) ? "active" : ""}><Link to="admin" class="cursor-pointer">Admin</Link></li>
                            <li class={path.match(/^\#\/simulator/) ? "active" : ""}><Link to="simulator" class="cursor-pointer">Simulator</Link></li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right">
                            <li><Link class="navbar-brand" to="accounts"><span class="fa fa-bars"></span></Link></li>
                            <li><Link class="navbar-brand" to="configure"><span class="fa fa-cog"></span></Link></li>
                            <li><a class="cursor-pointer">Block #{this.state.info.block}</a></li>
                            <li><a class="cursor-pointer"><span class={this.state.info.connected ? "fa fa-circle green" : "fa fa-circle"}></span></a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }

}
