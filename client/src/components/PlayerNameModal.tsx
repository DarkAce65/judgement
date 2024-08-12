import { Button, Form, Input, Modal } from 'antd';
import { useCallback, useMemo, useState } from 'react';

import Cookies from 'js-cookie';
import { PLAYER_NAME_COOKIE } from '../constants';

function validatePlayerName(playerName: string): { isValid: boolean; validationMessage?: string } {
  if (0 < playerName.length && playerName.length < 2) {
    return { isValid: false, validationMessage: 'Name must be at least two characters' };
  }

  return { isValid: true };
}

interface Props {
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

function PlayerNameModal({ open, onOk, onCancel }: Props) {
  const playerName = useMemo(() => Cookies.get(PLAYER_NAME_COOKIE) ?? null, []);
  const [stagedPlayerName, setStagedPlayerName] = useState(() => playerName ?? '');

  const { isValid, validationMessage } = useMemo(
    () => validatePlayerName(stagedPlayerName),
    [stagedPlayerName],
  );
  const canUpdate = playerName !== stagedPlayerName && isValid;

  const handlePlayerNameChange = useCallback(() => {
    if (!canUpdate) {
      return;
    }

    Cookies.set(PLAYER_NAME_COOKIE, stagedPlayerName);
    onOk?.();
  }, [canUpdate, onOk, stagedPlayerName]);

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
}

export default PlayerNameModal;
