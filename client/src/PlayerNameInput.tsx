import { useCallback, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Form, Input, notification } from 'antd';

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
        if (action.meta.requestStatus === 'rejected') {
          notification.error({ message: 'Failed to set name', duration: 0 });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, stagedPlayerName]);

  return (
    <Form layout="inline">
      <Form.Item label="Name">
        <Input
          value={stagedPlayerName}
          onChange={({ target: { value } }) => {
            setStagedPlayerName(value);
          }}
        />
      </Form.Item>
      <Form.Item>
        <Button
          loading={loading ? { delay: 100 } : false}
          icon={<ArrowRightOutlined />}
          onClick={handlePlayerNameChange}
        />
      </Form.Item>
    </Form>
  );
};

export default PlayerNameInput;
