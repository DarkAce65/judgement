import { Layout } from 'antd';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from './Home';
import RoomContainer from './room/RoomContainer';

const App = () => (
  <Router>
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomContainer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout.Content>
    </Layout>
  </Router>
);

export default App;
