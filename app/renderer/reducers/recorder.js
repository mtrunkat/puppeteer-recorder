import { ipcRenderer } from 'electron';
import { handleActions } from 'redux-actions';
import actions from '../actions/recorder';

export default handleActions(
  {
    [actions.start]: (state) => {
      ipcRenderer.sendSync('recorder', 'START_RECORDING', { initialScript: state.lines.join('\n') });

      return { ...state, isStarting: true };
    },
    [actions.started]: (state) => {
      return { ...state, isStarting: false, isRunning: true }
    },
    [actions.newLine]: (state, action) => {
      return { ...state, lines: state.lines.concat(action.payload) };
    },
  },
  {
    isStarting: false,
    isRunning: false,
    lines: ["await page.goto('https://sdk.apify.com');"],
  },
);
