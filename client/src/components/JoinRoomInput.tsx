import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Input, message } from 'antd';
import { useHistory } from 'react-router';

import { LocationState } from '../constants';
import { useAppDispatch } from '../data/reduxHooks';
import { joinRoom } from '../data/roomSlice';

const JoinRoomInput = () => {
  const dispatch = useAppDispatch();
  const history = useHistory<LocationState>();

  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = useCallback(() => {
    if (roomId.length !== 4) {
      return;
    }

    dispatch(joinRoom(roomId))
      .then(unwrapResult)
      .then(() => {
        history.push(`/room/${roomId}`, { gameExists: true });
      })
      .catch(() => {
        message.error(`Room ${roomId} not found`);
      });
  }, [dispatch, history, roomId]);

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

export default JoinRoomInput;
