import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { LocationState } from '../constants';
import { useAppDispatch } from '../data/reduxHooks';
import { createRoom } from '../data/roomSlice';

const CreateRoomButton = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCreate = useCallback(() => {
    dispatch(createRoom())
      .then(unwrapResult)
      .then((roomId) => {
        const state: LocationState = { gameExists: true };
        navigate(`/room/${roomId}`, { state });
      })
      .catch(() => {
        message.error('Failed to create a new room');
      });
  }, [dispatch, navigate]);

  return (
    <Button type="primary" size="large" onClick={handleCreate}>
      Create room
    </Button>
  );
};

export default CreateRoomButton;
