import { Button, Result } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import useFetch from '../../api/useFetch';
import useLocationStatePropertyOnce from '../../utils/useLocationStatePropertyOnce';
import ErrorPage from '../ErrorPage';
import LoadingPage from '../LoadingPage';

import Room from './Room';

const RoomContainer = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  const gameExists = useLocationStatePropertyOnce('gameExists');

  const { status, response } = useFetch(
    [`/rooms/${roomId}/exists`, { method: 'HEAD', additionalSuccessStatusCodes: [404] }],
    { fetchOnMount: true, skip: gameExists }
  );

  if (gameExists) {
    return <Room roomId={roomId} />;
  } else if (status === 'uninitialized' || status === 'pending') {
    return <LoadingPage />;
  } else if (status === 'succeeded' && response) {
    switch (response.status) {
      case 204:
        return <Room roomId={roomId} />;
      case 404:
        return (
          <Result
            status="error"
            title={`Room ${roomId} not found`}
            subTitle="Double check that you've entered the correct room code"
            extra={
              <Button type="primary" onClick={() => history.push('/')}>
                Go Home
              </Button>
            }
          />
        );
    }
  }

  return <ErrorPage />;
};

export default RoomContainer;
