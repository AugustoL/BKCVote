
import React from 'react';
import ReactDOM from "react-dom";
import ReactModal from "react-modal";

export default class Modal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: props.open || false,
            title: props.title || '',
            body: props.body || ''
        }
    }

    open(title, body){
        this.setState({open: true, title: title, body: body});
    }

    render() {
        const customStyles = {
            content : {
                "top": '100px',
                "wordBreak": 'break-all',
                "margin": 'auto',
            }
        };

        return(
            <ReactModal
                isOpen={this.state.open}
                style={customStyles}
            >
                <h2 class="modalTitle text-center">{this.state.title}</h2>
                {this.state.body}
                <div class="row text-center margin-bottom">
                    <button onClick={() => this.setState({open: false})}>Close</button>
                </div>
            </ReactModal>
        )
    }

}
