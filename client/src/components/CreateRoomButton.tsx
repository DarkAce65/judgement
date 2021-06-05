import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import { useHistory } from 'react-router';

import { LocationState } from '../constants';
import { useAppDispatch } from '../data/reduxHooks';
import { createRoom } from '../data/roomSlice';

const CreateRoomButton = () => {
  const dispatch = useAppDispatch();
  const history = useHistory<LocationState>();

  const handleCreate = useCallback(() => {
    dispatch(createRoom())
      .then(unwrapResult)
      .then((roomId) => {
        history.push(`/room/${roomId}`, { gameExists: true });
      })
      .catch(() => {
        message.error('Failed to create a new room');
      });
  }, [dispatch, history]);

  return (
    <Button type="primary" size="large" onClick={handleCreate}>
      Create room
    </Button>
  );
};

export default CreateRoomButton;
