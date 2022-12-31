import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { LocationState } from '../constants';
import { useAppDispatch } from '../data/reduxHooks';
import { createRoom } from '../data/roomSlice';

import { WithRequirePlayerNameProps, withRequirePlayerName } from './ensurePlayerWithCookie';

const CreateRoomButton = ({ requirePlayerName }: WithRequirePlayerNameProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCreate = useCallback(() => {
    requirePlayerName()
      .then(() => {
        dispatch(createRoom())
          .then(unwrapResult)
          .then((roomId) => {
            const state: LocationState = { roomExists: true };
            navigate(`/room/${roomId}`, { state });
          })
          .catch(() => {
            message.error('Failed to create a new room');
          });
      })
      .catch(() => {});
  }, [dispatch, navigate, requirePlayerName]);

  return (
    <Button type="primary" size="large" onClick={handleCreate}>
      Create room
    </Button>
  );
};

export default withRequirePlayerName(CreateRoomButton);
