import { Layout } from 'antd';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import store from '../data/store';

import Home from './Home';
import GameContainer from './game/GameContainer';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Layout.Content>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:gameId" element={<GameContainer />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
