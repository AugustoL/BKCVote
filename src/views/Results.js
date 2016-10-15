import React from 'react';
import {Link} from "react-router";

import * as Actions from "../actions";
import Store from "../Store";

export default class Results extends React.Component {

    constructor() {
        super();
        var self = this;
        this.state = {
            loading: false,
            deployed: (Store.contract.address == "") ? false : true,
            delpoyedAddress: Store.contract.address,
            results: []
        }
    }

    componentWillMount() {
        Actions.Ethereum.getResults();
    }

    componentWillUnmount() {
    }

	componentDidUpdate(){
	}

    seeResults(){

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
                            <h1>Election Results</h1>
                        </div>
                        { self.state.deployed ?
                            <div class="col-xs-12 text-center">
                                <h1>Existing contract deployed on {self.state.delpoyedAddress}</h1>
                            </div>
                        : <div/>
                        }
                        <div class="col-xs-12 text-center">
                            <Link to="/" class="cursor-pointer"><h4>Go Back</h4></Link>
                        </div>
                    </div>
                }
            </div>
        )
    }

}
