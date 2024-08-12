import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

import { fetchAPI } from '../api/client';
import { LocationState } from '../constants';
import { getPlayerName } from '../data/playerSlice';
import { useAppSelector } from '../data/reduxHooks';

import withPromptPlayerName, { WithPromptPlayerNameProps } from './withPromptPlayerName';
import usePlayerName from '../data/usePlayerName';

function JoinGameInput({ promptPlayerName }: WithPromptPlayerNameProps) {
  const navigate = useNavigate();

  const [playerName] = usePlayerName();

  const [gameId, setGameId] = useState('');

  const joinGameAndNavigate = useCallback(() => {
    fetchAPI(`/games/${gameId}/exists`)
      .then((response) => response.json())
      .then((gameExists) => {
        if (gameExists) {
          const state: LocationState = { gameExists };
          navigate(`/game/${gameId}`, { state });
        } else {
          message.error(`Game ${gameId} not found`);
        }
      });
  }, [navigate, gameId]);

  const handleJoinGame = useCallback(() => {
    if (gameId.length !== 4) {
      return;
    }

    if (!playerName) {
      promptPlayerName()
        .then(() => {
          joinGameAndNavigate();
        })
        .catch(() => {});
    } else {
      joinGameAndNavigate();
    }
  }, [joinGameAndNavigate, playerName, promptPlayerName, gameId.length]);

  return (
    <Space.Compact block={true}>
      <Input
        size="large"
        value={gameId}
        placeholder="Enter a game code to join"
        maxLength={4}
        onChange={({ target: { value } }) => {
          setGameId(value.toUpperCase().replace(/[^A-Z]/, ''));
        }}
        onPressEnter={handleJoinGame}
      />
      <Button type="primary" size="large" disabled={gameId.length !== 4} onClick={handleJoinGame}>
        Join
      </Button>
    </Space.Compact>
  );
}

export default withPromptPlayerName(JoinGameInput);
