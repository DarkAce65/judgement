import React, { useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';

import { fetchAPI } from './api/client';

const Home = () => {
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
          onClick={() => {
            fetchAPI('/ensure-player', {
              method: 'POST',
              body: JSON.stringify({ playerName }),
            })
              .then(() => {
                localStorage.setItem('playerName', playerName);
              })
              .catch((...args) => console.error('failed', ...args));
          }}
        >
          <ArrowRightOutlined />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Home;
