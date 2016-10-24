
import React from 'react';
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import QRReader from "./QRReader";

import Store from "../Store";

export default class Input extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: props.initialValue || '',
            title: props.title || '',
            type: props.type,
            valid: true,
            regex: props.regex || '',
            placeholder: props.placeholder || '',
            showQRVoter: false,
            hidePassword: true
        }
    }

    getValue(){
        return (this.state.value);
    }

    addressValid(address){
        return (Store.web3.isAddress(address));
    }

    textValid(text){
        if (this.state.regex != ''){
            var regex = new RegExp(this.state.regex);
            return regex.test(text);
        } else
            return true;
    }

    isValid(){
        if (this.state.value.length == 0)
            return false;
        else
            return this.state.valid;
    }

    render() {
        var self = this;
        switch (self.state.type) {
            case 'address':
                return(
                    <div class={self.state.valid ? "form-group" : "form-group has-error"}>
                        <label>{self.state.title}</label>
                        <QRReader
                            showQR={self.state.showQRVoter}
                            onError={(e) => console.error(e)}
                            onScan={(data) => {
                                self.setState({value: data, showQRVoter: false});
                            }}
                        ></QRReader>
                        <div class="input-group">
                            <input
                                type="text"
                                class="form-control"
                                value={self.state.value}
                                onChange={(event) => self.setState({
                                    value: event.target.value,
                                    valid: self.addressValid(event.target.value)
                                })}
                                placeholder={self.state.placeholder || ''}
                            />
                            {self.state.showQRVoter ?
                                <span
                                    class="input-group-addon cursor-pointer"
                                    onClick={() => self.setState({showQRVoter: false})}
                                >
                                    Close <span class="fa fa-camera"></span>
                                </span>
                            :
                                <span
                                    class="input-group-addon cursor-pointer"
                                    onClick={() => self.setState({showQRVoter: true})}
                                >
                                    Open <span class="fa fa-camera"></span>
                                </span>
                            }
                        </div>
                    </div>
                )
            break;
            case 'account':
                return(
                    <div class={self.state.valid ? "form-group" : "form-group has-error"}>
                        <label>{self.state.title}</label>
                        <QRReader
                            showQR={self.state.showQRVoter}
                            onError={(e) => console.error(e)}
                            onScan={(data) => {
                                self.setState({value: data, showQRVoter: false});
                            }}
                        ></QRReader>
                        <div class="input-group">
                            <input
                                type="text"
                                class="form-control"
                                value={self.state.value}
                                onChange={(event) => self.setState({
                                    value: event.target.value,
                                    valid: self.textValid(event.target.value)
                                })}
                                placeholder={self.state.placeholder || ''}
                            />
                            {self.state.showQRVoter ?
                                <span
                                    class="input-group-addon cursor-pointer"
                                    onClick={() => self.setState({showQRVoter: false})}
                                >
                                    Close <span class="fa fa-camera"></span>
                                </span>
                            :
                                <span
                                    class="input-group-addon cursor-pointer"
                                    onClick={() => self.setState({showQRVoter: true})}
                                >
                                    Open <span class="fa fa-camera"></span>
                                </span>
                            }
                        </div>
                    </div>
                )
            break;
            case 'text':
                return(
                    <div class={self.state.valid ? "form-group" : "form-group has-error"}>
                        <label>{self.state.title}</label>
                        <input
                            type="text"
                            class="form-control"
                            value={self.state.value}
                            onChange={(event) => self.setState({
                                value: event.target.value,
                                valid: self.textValid(event.target.value)
                            })}
                            placeholder={self.state.placeholder || ''}
                        />
                    </div>
                )
            break;
            case 'password':
                return(
                    <div class={self.state.valid ? "form-group" : "form-group has-error"}>
                        <label>{self.state.title}</label>
                        <div class="input-group">
                            <input
                                type={self.state.hidePassword ? 'password': 'text'}
                                class="form-control"
                                value={self.state.value}
                                onChange={(event) => self.setState({
                                    value: event.target.value,
                                    valid: self.textValid(event.target.value)
                                })}
                                placeholder={self.state.placeholder || ''}
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
                )
            break;

        }

    }

}
