import {
  JudgementGameState,
  JudgementSpectatorGameState,
} from '../../../../generated_types/judgement';

import JudgementGame from './JudgementGame';
import JudgementSettings from './JudgementSettings';

interface Props {
  game: JudgementGameState | JudgementSpectatorGameState;
}

const JudgementContainer = ({ game }: Props) => {
  return (
    <>
      {game.status === 'NOT_STARTED' && <JudgementSettings game={game} />}
      {game.status === 'IN_PROGRESS' && game.playerType === 'PLAYER' && (
        <JudgementGame game={game} />
      )}
    </>
  );
};

export default JudgementContainer;
