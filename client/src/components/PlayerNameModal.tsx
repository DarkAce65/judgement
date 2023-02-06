import { useCallback, useMemo, useState } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Form, Input, Modal, message } from 'antd';

import { ensurePlayer, getEnsurePlayerFetchStatus, getPlayerName } from '../data/playerSlice';
import { useAppDispatch, useAppSelector } from '../data/reduxHooks';

const validatePlayerName = (
  playerName: string
): { isValid: boolean; validationMessage?: string } => {
  if (0 < playerName.length && playerName.length < 2) {
    return { isValid: false, validationMessage: 'Name must be at least two characters' };
  }

  return { isValid: true };
};

interface Props {
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

const PlayerNameModal = ({ open, onOk, onCancel }: Props) => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(getPlayerName);
  const ensurePlayerFetchStatus = useAppSelector(getEnsurePlayerFetchStatus);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName || '');

  const { isValid, validationMessage } = useMemo(
    () => validatePlayerName(stagedPlayerName),
    [stagedPlayerName]
  );
  const canUpdate = playerName !== stagedPlayerName && isValid;

  const handlePlayerNameChange = useCallback(() => {
    if (!canUpdate) {
      return;
    }

    dispatch(ensurePlayer(stagedPlayerName))
      .then(unwrapResult)
      .then(() => {
        onOk && onOk();
      })
      .catch(() => {
        message.error('Failed to set name');
      });
  }, [canUpdate, dispatch, stagedPlayerName, onOk]);

  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={
        <>
          <Button
            onClick={() => {
              onCancel && onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={stagedPlayerName.length === 0 || !isValid}
            loading={ensurePlayerFetchStatus === 'pending'}
            onClick={handlePlayerNameChange}
          >
            Ok
          </Button>
        </>
      }
      onOk={handlePlayerNameChange}
      onCancel={() => {
        onCancel && onCancel();
      }}
    >
      <Form.Item validateStatus={isValid ? 'success' : 'error'} help={validationMessage}>
        <Input
          value={stagedPlayerName}
          placeholder="Enter your name"
          onChange={({ target: { value } }) => {
            setStagedPlayerName(value);
          }}
          onPressEnter={handlePlayerNameChange}
        />
      </Form.Item>
    </Modal>
  );
};

export default PlayerNameModal;
