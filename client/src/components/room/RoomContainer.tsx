import { Button, Result } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import useFetch from '../../api/useFetch';
import useLocationStatePropertyOnce from '../../utils/useLocationStatePropertyOnce';
import ErrorPage from '../ErrorPage';
import LoadingPage from '../LoadingPage';
import PageLayout from '../PageLayout';

import Room from './Room';
import RoomControls from './RoomControls';

const RoomContainer = () => {
  const navigate = useNavigate();
  const pathParams = useParams<'roomId'>();
  const roomId = pathParams.roomId!;

  const roomExists = useLocationStatePropertyOnce('roomExists');
  const { status, data } = useFetch<boolean>(`/rooms/${roomId}/exists`, { skip: roomExists });

  if (roomExists || (status === 'succeeded' && data === true)) {
    return (
      <PageLayout>
        <RoomControls roomId={roomId}>
          <Room roomId={roomId} />
        </RoomControls>
      </PageLayout>
    );
  } else if (status === 'succeeded' && data === false) {
    return (
      <PageLayout>
        <Result
          status="error"
          title={`Room ${roomId} not found`}
          subTitle="Double check that you've entered the correct room code"
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
};

export default RoomContainer;
