import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import Recorder from '../components/Recorder';
import recorderActions from '../actions/recorder';

const mapStateToProps = (state) => {
  return {
    isStarting: state.recorder.isStarting,
    lines: state.recorder.lines,
  };
};

const mapDispatchToProps = (dispatch) => {
  const recorder = bindActionCreators(recorderActions, dispatch);
  return {
    startRecording: () => {
      recorder.start();
      // dispatch(push('/loggedin'));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Recorder);
