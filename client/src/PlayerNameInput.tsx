import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, notification } from 'antd';

import { getPlayerName, setPlayerName } from './data/playerSlice';
import { useAppDispatch, useAppSelector } from './data/reduxHooks';

const PlayerNameInput = () => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(getPlayerName);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName || '');
  const [loading, setLoading] = useState(false);

  const handlePlayerNameChange = useCallback(() => {
    setLoading(true);

    dispatch(setPlayerName(stagedPlayerName))
      .then((action) => {
        switch (action.meta.requestStatus) {
          case 'fulfilled':
            notification.success({ message: 'Updated name' });
            break;
          case 'rejected':
            notification.error({ message: 'Failed to set name', duration: 0 });
            break;
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, stagedPlayerName]);

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
        onClick={handlePlayerNameChange}
        style={{ flexShrink: 0 }}
      />
    </Input.Group>
  );
};

export default PlayerNameInput;
