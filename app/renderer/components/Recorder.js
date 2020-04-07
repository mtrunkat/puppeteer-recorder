import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Recorder extends Component {
  static propTypes = {
    startRecording: PropTypes.func.isRequired,
    isStarting: PropTypes.bool.isRequired,
  };

  state = {
    // username: '',
  };

  // handleChange = (e) => {
  //  this.setState({
  //    username: e.target.value,
  //  });
  // };

  render() {
    return (
      <div>
        <h2>Recorder</h2>
        <button onClick={this.props.startRecording}>Record</button>
        {this.props.isStarting ? 'Starting recording ...' : ''}
        <pre>
          <code>
            {this.props.lines.join('\r\n')}
          </code>
        </pre>
      </div>
    );
  }
}
