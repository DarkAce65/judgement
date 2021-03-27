import { useCallback } from 'react';

import { Button, notification } from 'antd';

import { fetchAPI } from './api/client';

interface Props {
  onCreate?: (roomId: string) => void;
}

const CreateLobbyButton = ({ onCreate }: Props) => {
  const handleCreate = useCallback(() => {
    fetchAPI('/create-game', {
      method: 'POST',
      body: JSON.stringify({ playerName: localStorage.getItem('playerName') }),
    })
      .then((res) => res.json())
      .then(({ roomId }) => {
        if (onCreate) {
          onCreate(roomId);
        }
      })
      .catch(() => {
        notification.error({ message: 'Failed to create a new lobby', duration: 0 });
      });
  }, [onCreate]);

  return <Button onClick={handleCreate}>Create room</Button>;
};

export default CreateLobbyButton;
