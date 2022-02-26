import { useCallback } from 'react';

import { Button, Form, InputNumber } from 'antd';

import {
  JudgementGameState,
  JudgementSpectatorGameState,
  JudgementUpdateSettingsAction,
} from '../../../../generated_types/judgement';
import withGameSocket, { WithGameSocketProps } from '../../../game/withGameSocket';
import useDraftValue from '../../../utils/useDraftValue';

interface Props {
  game: JudgementGameState | JudgementSpectatorGameState;
}

const JudgementSettings = ({ game, socket }: Props & WithGameSocketProps) => {
  const [numRounds, setNumRounds, numRoundsChanged] = useDraftValue(game.settings.numRounds);
  const [numDecks, setNumDecks, numDecksChanged] = useDraftValue(game.settings.numDecks);

  const updateSettings = useCallback(() => {
    const action: JudgementUpdateSettingsAction = { actionType: 'UPDATE_SETTINGS' };
    if (numRoundsChanged) action.numRounds = numRounds;
    if (numDecksChanged) action.numDecks = numDecks;

    socket.emit('game_input', action);
  }, [socket, numRoundsChanged, numRounds, numDecksChanged, numDecks]);

  return (
    <Form>
      <Form.Item label="Number of rounds">
        <InputNumber value={numRounds} min={1} onChange={(value) => setNumRounds(value)} />
      </Form.Item>
      <Form.Item label="Number of decks">
        <InputNumber value={numDecks} min={1} onChange={(value) => setNumDecks(value)} />
      </Form.Item>
      <Form.Item>
        <Button
          disabled={!numRoundsChanged && !numDecksChanged}
          onClick={() => {
            updateSettings();
          }}
        >
          Update settings
        </Button>
      </Form.Item>
    </Form>
  );
};

export default withGameSocket(JudgementSettings);
