import {
  JudgementGameState,
  JudgementSpectatorGameState,
} from '../../../../generated_types/judgement';

import JudgementGameBidding from './JudgementGameBidding';
import JudgementGamePlaying from './JudgementGamePlaying';
import JudgementSettings from './JudgementSettings';

interface Props {
  game: JudgementGameState | JudgementSpectatorGameState;
}

const JudgementContainer = ({ game }: Props) => {
  if (game.status === 'NOT_STARTED') {
    return <JudgementSettings game={game} />;
  }

  if (game.status === 'IN_PROGRESS' && game.playerType === 'PLAYER') {
    switch (game.phase) {
      case 'BIDDING':
        return <JudgementGameBidding game={game} />;
      case 'PLAYING':
        return <JudgementGamePlaying game={game} />;
      default:
        return null;
    }
  }

  return null;
};

export default JudgementContainer;
