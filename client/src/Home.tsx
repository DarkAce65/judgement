import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, notification } from 'antd';

import { fetchAPI } from './api/client';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');

  const handlePlayerNameChange = useCallback(() => {
    setLoading(true);

    fetchAPI('/ensure-player', { method: 'POST', body: JSON.stringify({ playerName }) })
      .then(() => {
        localStorage.setItem('playerName', playerName);
      })
      .catch(() => {
        notification.error({ message: 'Failed to set name', duration: 0 });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playerName]);

  return (
    <Layout>
      <Layout.Content style={{ padding: 24 }}>
        <Form layout="inline">
          <Form.Item label="Name">
            <Input
              value={playerName}
              onChange={({ target: { value } }) => {
                setPlayerName(value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              loading={loading ? { delay: 100 } : false}
              icon={<ArrowRightOutlined />}
              onClick={handlePlayerNameChange}
            />
          </Form.Item>
        </Form>
      </Layout.Content>
    </Layout>
  );
};

export default Home;
