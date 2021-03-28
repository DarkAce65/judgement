import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Home from './Home';
import Room from './room/Room';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/room/:roomId" component={Room} />
      <Redirect path="*" to="/" />
    </Switch>
  </Router>
);

export default App;
