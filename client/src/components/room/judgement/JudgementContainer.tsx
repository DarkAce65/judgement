import { JudgementGameState } from '../../../../generated_types/judgement';

import JudgementGame from './JudgementGame';
import JudgementSettings from './JudgementSettings';

interface Props {
  game: JudgementGameState;
}

const JudgementContainer = ({ game }: Props) => {
  return (
    <>
      {game.status === 'NOT_STARTED' && <JudgementSettings game={game} />}
      {game.status === 'IN_PROGRESS' && <JudgementGame game={game} />}
    </>
  );
};

export default JudgementContainer;
