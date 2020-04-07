import React from 'react';
import { Switch, Route } from 'react-router';

import RecorderPage from './containers/RecorderPage';

export default (
  <Switch>
    <Route exact path="/" component={RecorderPage} />
  </Switch>
);
