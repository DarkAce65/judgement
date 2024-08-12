import { useCallback } from 'react';

import { Button, Select, Typography, message } from 'antd';

import { GameName, CreateGameRequest } from '../../../generated_types/api';
import {
  GameErrorMessage,
  GameStateMessage,
  PlayersMessage,
} from '../../../generated_types/websocket';
import { getGame, loadGameState } from '../../data/gameSlice';
import { loadPlayers } from '../../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../../data/reduxHooks';
import GameSocket from '../../game/GameSocket';
import useConnectedGameSocket from '../../game/useConnectedGameSocket';
import ensurePlayerWithCookie from '../ensurePlayerWithCookie';

import DebugGameState from './DebugGameState';
import JudgementContainer from './judgement/JudgementContainer';

interface Props {
  gameId: string;
}

function Game({ gameId }: Props) {
  const dispatch = useAppDispatch();
  const socket = useConnectedGameSocket(({ socket, namespace }) => {
    socket.emit('join_game', gameId);
    GameSocket.onReconnect(namespace, () => {
      socket.emit('join_game', gameId);
    });
    GameSocket.onNamespaced(namespace, 'players', (playersMessage: PlayersMessage) => {
      dispatch(loadPlayers(playersMessage));
    });
    GameSocket.onNamespaced(namespace, 'game_state', (gameStateMessage: GameStateMessage) => {
      dispatch(loadGameState(gameStateMessage));
    });
    GameSocket.onNamespaced(namespace, 'invalid_input', (error: GameErrorMessage) => {
      message.error(error.errorMessage);
    });
  });

  const game = useAppSelector(getGame);

  const handleGameInit = useCallback(() => {
    socket?.emit('confirm_game');
  }, [socket]);

  if (game) {
    switch (game.gameName) {
      case 'JUDGEMENT':
        return (
          <>
            <JudgementContainer game={game} />
            <DebugGameState />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Typography.Title>{gameId}</Typography.Title>
      {game &&
        Object.values(game.players).map((playerName, index) => (
          <Typography.Paragraph key={index}>{playerName}</Typography.Paragraph>
        ))}
      <Typography.Paragraph>
        <Button onClick={handleGameInit}>Init game</Button>
      </Typography.Paragraph>
    </>
  );
}

export default ensurePlayerWithCookie(Game);
