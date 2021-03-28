import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, notification } from 'antd';

import { createLobby } from './data/lobbySlice';
import { useAppDispatch } from './data/reduxHooks';

interface Props {
  onCreate?: (roomId: string) => void;
}

const CreateLobbyButton = ({ onCreate }: Props) => {
  const dispatch = useAppDispatch();

  const handleCreate = useCallback(() => {
    dispatch(createLobby())
      .then(unwrapResult)
      .then((roomId) => {
        if (onCreate) {
          onCreate(roomId);
        }
      })
      .catch(() => {
        notification.error({ message: 'Failed to create a new lobby', duration: 0 });
      });
  }, [dispatch, onCreate]);

  return <Button onClick={handleCreate}>Create room</Button>;
};

export default CreateLobbyButton;
