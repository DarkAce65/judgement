import React from 'react';

import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Home from './Home';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/hello">
          <Link
            to="/"
            style={{ position: 'fixed', top: 20, right: 20, fontSize: 18, color: 'red' }}
          >
            To home
          </Link>
          Somewhere else
        </Route>
        <Route path="/">
          <Link
            to="/hello"
            style={{ position: 'fixed', top: 20, right: 20, fontSize: 18, color: 'red' }}
          >
            To hello
          </Link>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
