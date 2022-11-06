import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Form, Input, message } from 'antd';

import { ensurePlayer, getEnsurePlayerFetchStatus, getPlayerName } from '../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../data/reduxHooks';

const PlayerNameInput = () => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(getPlayerName);
  const ensurePlayerFetchStatus = useAppSelector(getEnsurePlayerFetchStatus);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName || '');

  const isValid = stagedPlayerName.length >= 1;
  const canUpdate = playerName !== stagedPlayerName && isValid;

  const handlePlayerNameChange = useCallback(() => {
    if (!canUpdate) {
      return;
    }

    dispatch(ensurePlayer(stagedPlayerName))
      .then(unwrapResult)
      .then(() => {
        message.success('Updated name');
      })
      .catch(() => {
        message.error('Failed to set name');
      });
  }, [dispatch, canUpdate, stagedPlayerName]);

  return (
    <Form.Item
      validateStatus={stagedPlayerName.length === 0 || isValid ? 'success' : 'error'}
      help={stagedPlayerName.length !== 0 && !isValid && 'Name must be at least one character'}
    >
      <Input.Group compact={true} size="large" style={{ display: 'flex' }}>
        <Input
          value={stagedPlayerName}
          placeholder="Enter your name"
          onChange={({ target: { value } }) => {
            setStagedPlayerName(value);
          }}
          onPressEnter={handlePlayerNameChange}
        />
        <Button
          icon={<ArrowRightOutlined />}
          size="large"
          loading={ensurePlayerFetchStatus === 'pending'}
          disabled={!canUpdate}
          onClick={handlePlayerNameChange}
          style={{ flexShrink: 0 }}
        />
      </Input.Group>
    </Form.Item>
  );
};

export default PlayerNameInput;
