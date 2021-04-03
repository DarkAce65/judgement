import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';

import { useAppDispatch } from '../data/reduxHooks';
import { createRoom } from '../data/roomSlice';

interface Props {
  onCreate?: (roomId: string) => void;
}

const CreateRoomButton = ({ onCreate }: Props) => {
  const dispatch = useAppDispatch();

  const handleCreate = useCallback(() => {
    dispatch(createRoom())
      .then(unwrapResult)
      .then((roomId) => {
        if (onCreate) {
          onCreate(roomId);
        }
      })
      .catch(() => {
        message.error('Failed to create a new room');
      });
  }, [dispatch, onCreate]);

  return (
    <Button type="primary" size="large" onClick={handleCreate}>
      Create room
    </Button>
  );
};

export default CreateRoomButton;
