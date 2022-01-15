import { useCallback, useRef } from 'react';

import { Button, InputNumber, Space } from 'antd';

import { JudgementUpdateSettingsAction } from '../../../../generated_types/judgement';
import withGameSocket, { WithGameSocketProps } from '../../../game/withGameSocket';

const JudgementSettings = ({ socket }: WithGameSocketProps) => {
  const numRoundsRef = useRef<HTMLInputElement>(null);

  const setNumRounds = useCallback(
    (numRounds) => {
      const action: JudgementUpdateSettingsAction = { actionType: 'UPDATE_SETTINGS', numRounds };
      socket.emit('game_input', action);
    },
    [socket]
  );

  return (
    <Space direction="vertical">
      <InputNumber ref={numRoundsRef} min={1} />
      <Button
        onClick={() => {
          setNumRounds(numRoundsRef.current?.value);
        }}
      >
        Set rounds
      </Button>
    </Space>
  );
};

export default withGameSocket(JudgementSettings);
