import { useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Form, Input, notification } from 'antd';

import { fetchAPI } from './api/client';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');

  return (
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
          onClick={() => {
            setLoading(true);

            fetchAPI('/ensure-player', {
              method: 'POST',
              body: JSON.stringify({ playerName }),
            })
              .then(() => {
                localStorage.setItem('playerName', playerName);
              })
              .catch(() => {
                notification.error({ message: 'Failed to set name', duration: 0 });
              })
              .then(() => {
                setLoading(false);
              });
          }}
        />
      </Form.Item>
    </Form>
  );
};

export default Home;
