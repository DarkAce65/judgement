import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Input, message } from 'antd';

import { ensurePlayer, getPlayerName } from '../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../data/reduxHooks';

const PlayerNameInput = () => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(getPlayerName);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName || '');
  const [loading, setLoading] = useState(false);

  const isValid = stagedPlayerName.length > 0 && playerName !== stagedPlayerName;

  const handlePlayerNameChange = useCallback(() => {
    if (!isValid) {
      return;
    }

    setLoading(true);

    dispatch(ensurePlayer(stagedPlayerName))
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
  }, [dispatch, isValid, stagedPlayerName]);

  return (
    <Input.Group compact={true} size="large" style={{ display: 'flex' }}>
      <Input
        value={stagedPlayerName}
        onChange={({ target: { value } }) => {
          setStagedPlayerName(value);
        }}
        onPressEnter={handlePlayerNameChange}
      />
      <Button
        icon={<ArrowRightOutlined />}
        size="large"
        loading={loading ? { delay: 100 } : false}
        disabled={!isValid}
        onClick={handlePlayerNameChange}
        style={{ flexShrink: 0 }}
      />
    </Input.Group>
  );
};

export default PlayerNameInput;
