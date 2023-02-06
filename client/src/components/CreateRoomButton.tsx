import { useCallback } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, ButtonProps, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { LocationState } from '../constants';
import { getPlayerName } from '../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../data/reduxHooks';
import { createRoom } from '../data/roomSlice';

import withPromptPlayerName, { WithPromptPlayerNameProps } from './withPromptPlayerName';

interface Props {
  buttonProps: ButtonProps;
}

const CreateRoomButton = ({ promptPlayerName, buttonProps }: Props & WithPromptPlayerNameProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const playerName = useAppSelector(getPlayerName);

  const createRoomAndNavigate = useCallback(() => {
    dispatch(createRoom())
      .then(unwrapResult)
      .then((roomId) => {
        const state: LocationState = { roomExists: true };
        navigate(`/room/${roomId}`, { state });
      })
      .catch(() => {
        message.error('Failed to create a new room');
      });
  }, [dispatch, navigate]);

  const handleCreate = useCallback(() => {
    if (!playerName) {
      promptPlayerName()
        .then(() => {
          createRoomAndNavigate();
        })
        .catch(() => {});
    } else {
      createRoomAndNavigate();
    }
  }, [createRoomAndNavigate, playerName, promptPlayerName]);

  return (
    <Button type="primary" size="large" {...buttonProps} onClick={handleCreate}>
      Create room
    </Button>
  );
};

export default withPromptPlayerName(CreateRoomButton);
