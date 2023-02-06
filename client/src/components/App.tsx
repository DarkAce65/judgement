import { Layout } from 'antd';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import store from '../data/store';

import Home from './Home';
import RoomContainer from './room/RoomContainer';

const App = () => (
  <Provider store={store}>
    <Router>
      <Layout>
        <Layout.Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<RoomContainer />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </Router>
  </Provider>
);

export default App;
