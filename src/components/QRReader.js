import React from 'react';
import QrReader from 'react-qr-reader';

export default class QRREader extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return(
            <div class="col-xs-12 text-center">
                {this.props.showQR ?
                    <QrReader
                        previewStyle={{
                            height: 300,
                            width: 400,
                            margin: 'auto'
                        }}
                        handleError={this.props.onError}
                        handleScan={this.props.onScan}
                    />
                :
                    <div></div>
                }
            </div>
        )
    }

}
