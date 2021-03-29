import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Input, message } from 'antd';

import { getPlayerName, setPlayerName } from './data/playerSlice';
import { useAppDispatch, useAppSelector } from './data/reduxHooks';

const PlayerNameInput = () => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(getPlayerName);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName || '');
  const [loading, setLoading] = useState(false);

  const handlePlayerNameChange = useCallback(() => {
    if (playerName === stagedPlayerName) {
      return;
    }

    setLoading(true);

    dispatch(setPlayerName(stagedPlayerName))
      .then(unwrapResult)
      .then(() => {
        message.success('Updated name');
      })
      .catch(() => {
        message.error('Failed to set name');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, playerName, stagedPlayerName]);

  return (
    <Input.Group compact={true} style={{ display: 'flex' }}>
      <Input
        value={stagedPlayerName}
        onChange={({ target: { value } }) => {
          setStagedPlayerName(value);
        }}
        onPressEnter={handlePlayerNameChange}
      />
      <Button
        loading={loading ? { delay: 100 } : false}
        icon={<ArrowRightOutlined />}
        disabled={playerName === stagedPlayerName}
        onClick={handlePlayerNameChange}
        style={{ flexShrink: 0 }}
      />
    </Input.Group>
  );
};

export default PlayerNameInput;
