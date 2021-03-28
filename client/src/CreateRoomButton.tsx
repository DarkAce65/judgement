import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, notification } from 'antd';

import { useAppDispatch } from './data/reduxHooks';
import { createRoom } from './data/roomSlice';

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
        notification.error({ message: 'Failed to create a new room', duration: 0 });
      });
  }, [dispatch, onCreate]);

  return <Button onClick={handleCreate}>Create room</Button>;
};

export default CreateRoomButton;
