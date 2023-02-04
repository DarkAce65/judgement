import { useCallback } from 'react';

import { Button, Form, InputNumber, Space, message } from 'antd';

import {
  JudgementGameState,
  JudgementSpectatorGameState,
  JudgementUpdateSettingsAction,
} from '../../../../generated_types/judgement';
import useConnectedGameSocket from '../../../game/useConnectedGameSocket';
import useDraftValue from '../../../utils/useDraftValue';

interface Props {
  game: JudgementGameState | JudgementSpectatorGameState;
}

const JudgementSettings = ({ game: { settings } }: Props) => {
  const socket = useConnectedGameSocket();

  const [numRounds, setNumRounds, numRoundsChanged] = useDraftValue<number | null>(
    settings.numRounds
  );
  const [numDecks, setNumDecks, numDecksChanged] = useDraftValue<number | null>(settings.numDecks);

  const canUpdateSettings =
    numRounds !== null && numDecks !== null && (numRoundsChanged || numDecksChanged);

  const updateSettings = useCallback(() => {
    if (!socket) return;

    if (!canUpdateSettings) {
      message.error('Unable to update settings');
      return;
    }

    const action: JudgementUpdateSettingsAction = { actionType: 'UPDATE_SETTINGS' };
    if (numRoundsChanged) action.numRounds = numRounds;
    if (numDecksChanged) action.numDecks = numDecks;

    socket.emit('game_input', action);
  }, [canUpdateSettings, numRoundsChanged, numRounds, numDecksChanged, numDecks, socket]);

  return (
    <Form>
      <Form.Item label="Number of rounds">
        <InputNumber value={numRounds} min={1} onChange={(value) => setNumRounds(value)} />
      </Form.Item>
      <Form.Item label="Number of decks">
        <InputNumber value={numDecks} min={1} onChange={(value) => setNumDecks(value)} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            disabled={!canUpdateSettings}
            onClick={() => {
              updateSettings();
            }}
          >
            Update settings
          </Button>
          <Button
            type="primary"
            onClick={() => {
              socket?.emit('start_game');
            }}
          >
            Start game
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default JudgementSettings;
