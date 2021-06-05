import { Button, Result } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import useFetch from '../../api/useFetch';
import { LocationState } from '../../constants';
import ErrorPage from '../ErrorPage';
import LoadingPage from '../LoadingPage';

import Room from './Room';

const RoomContainer = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { roomId } = useParams<{ roomId: string }>();

  const { status, response } = useFetch(
    [`/rooms/${roomId}/exists`, { method: 'HEAD', additionalSuccessStatusCodes: [404] }],
    { fetchOnMount: true, skip: location.state && location.state.gameExists }
  );

  if (location.state && location.state.gameExists) {
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
