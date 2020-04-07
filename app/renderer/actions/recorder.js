import { createAction } from 'redux-actions';

export default {
  start: createAction('RECORDER_START'),
  started: createAction('RECORDER_STARTED'),
  newLine: createAction('NEW_LINE'),
};
