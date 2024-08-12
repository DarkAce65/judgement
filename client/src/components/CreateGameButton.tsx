import { useCallback, useMemo, useState } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, message, Select, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

import { LocationState, PLAYER_NAME_COOKIE } from '../constants';
import { createGame } from '../data/gameSlice';
import { getPlayerName, loadPlayerDataFromCookie } from '../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../data/reduxHooks';

import withPromptPlayerName, { WithPromptPlayerNameProps } from './withPromptPlayerName';
import { GameName } from '../../generated_types/api';
import Cookies from 'js-cookie';
import usePlayerName from '../data/usePlayerName';

function CreateGameButton({ promptPlayerName }: WithPromptPlayerNameProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [playerName] = usePlayerName();

  const [gameName, setGameName] = useState<GameName | null>(null);

  const createRoomAndNavigate = useCallback(() => {
    if (!gameName) {
      return;
    }

    dispatch(createGame({ gameName }))
      .then(unwrapResult)
      .then((gameId) => {
        const state: LocationState = { gameExists: true };
        navigate(`/game/${gameId}`, { state });
      })
      .catch(() => {
        message.error('Failed to create a new game');
      });
  }, [dispatch, gameName, navigate]);

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
    <Space.Compact block={true}>
      <Select<GameName>
        size="large"
        value={gameName}
        placeholder="Select a game..."
        options={[{ label: 'Judgement', value: 'JUDGEMENT' }]}
        onChange={(value) => {
          setGameName(value);
        }}
        style={{ width: '100%' }}
      />
      <Button type="primary" size="large" disabled={!gameName} onClick={handleCreate}>
        Create
      </Button>
    </Space.Compact>
  );
}

export default withPromptPlayerName(CreateGameButton);
