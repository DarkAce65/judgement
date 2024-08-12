import { Button, Result } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import useFetch from '../../api/useFetch';
import useLocationStatePropertyOnce from '../../utils/useLocationStatePropertyOnce';
import ErrorPage from '../ErrorPage';
import LoadingPage from '../LoadingPage';
import PageLayout from '../PageLayout';

import Game from './Game';
import GameControls from './GameControls';

function GameContainer() {
  const navigate = useNavigate();
  const pathParams = useParams<'gameId'>();
  const gameId = pathParams.gameId!;

  const gameExists = useLocationStatePropertyOnce('gameExists');
  const { status, data } = useFetch<boolean>(`/games/${gameId}/exists`, { skip: gameExists });

  if (gameExists || (status === 'succeeded' && data === true)) {
    return (
      <PageLayout>
        <GameControls gameId={gameId}>
          <Game gameId={gameId} />
        </GameControls>
      </PageLayout>
    );
  } else if (status === 'succeeded' && data === false) {
    return (
      <PageLayout>
        <Result
          status="error"
          title={`Game ${gameId} not found`}
          subTitle="Double check that you've entered the correct game code"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          }
        />
      </PageLayout>
    );
  } else if (status === 'uninitialized' || status === 'pending') {
    return <LoadingPage />;
  }

  return <ErrorPage />;
}

export default GameContainer;
