import { Layout } from 'antd';

import PlayerNameInput from './PlayerNameInput';

const Home = () => (
  <Layout>
    <Layout.Content style={{ padding: 24 }}>
      <PlayerNameInput />
    </Layout.Content>
  </Layout>
);

export default Home;
