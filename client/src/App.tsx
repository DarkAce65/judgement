import React from 'react';

import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Home from './Home';
import Lobby from './lobby/Lobby';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/lobby/:roomId" component={Lobby} />
        <Redirect path="*" to="/" />
      </Switch>
    </Router>
  );
};

export default App;
