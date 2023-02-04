import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { fetchAPI } from '../api/client';
import { LocationState } from '../constants';
import { getPlayerName } from '../data/playerSlice';
import { useAppSelector } from '../data/reduxHooks';

import withPromptPlayerName, { WithPromptPlayerNameProps } from './withPromptPlayerName';

const JoinRoomInput = ({ promptPlayerName }: WithPromptPlayerNameProps) => {
  const navigate = useNavigate();

  const playerName = useAppSelector(getPlayerName);

  const [roomId, setRoomId] = useState('');

  const joinRoomAndNavigate = useCallback(() => {
    fetchAPI(`/rooms/${roomId}/exists`)
      .then((response) => response.json())
      .then((roomExists) => {
        if (roomExists) {
          const state: LocationState = { roomExists };
          navigate(`/room/${roomId}`, { state });
        } else {
          message.error(`Room ${roomId} not found`);
        }
      });
  }, [navigate, roomId]);

  const handleJoinRoom = useCallback(() => {
    if (roomId.length !== 4) {
      return;
    }

    if (!playerName) {
      promptPlayerName()
        .then(() => {
          joinRoomAndNavigate();
        })
        .catch(() => {});
    } else {
      joinRoomAndNavigate();
    }
  }, [joinRoomAndNavigate, playerName, promptPlayerName, roomId.length]);

  return (
    <Input.Group compact={true} size="large" style={{ display: 'flex' }}>
      <Input
        value={roomId}
        placeholder="Enter a room code to join"
        maxLength={4}
        onChange={({ target: { value } }) => {
          setRoomId(value.toUpperCase().replace(/[^A-Z]/, ''));
        }}
        onPressEnter={handleJoinRoom}
      />
      <Button
        icon={<ArrowRightOutlined />}
        size="large"
        disabled={roomId.length !== 4}
        onClick={handleJoinRoom}
        style={{ flexShrink: 0 }}
      />
    </Input.Group>
  );
};

export default withPromptPlayerName(JoinRoomInput);
