import { Layout } from 'antd';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Home from './Home';
import RoomContainer from './room/RoomContainer';

const App = () => (
  <Router>
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/room/:roomId" component={RoomContainer} />
          <Redirect path="*" to="/" />
        </Switch>
      </Layout.Content>
    </Layout>
  </Router>
);

export default App;
