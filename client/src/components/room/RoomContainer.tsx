import { LoadingOutlined } from '@ant-design/icons';
import { Button, Result, Spin } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import useFetch from '../../api/useFetch';

import Room from './Room';

const RoomContainer = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  const { status, response } = useFetch(
    [`/rooms/${roomId}/exists`, { method: 'HEAD', additionalSuccessStatusCodes: [404] }],
    { fetchOnMount: true }
  );

  if (status === 'uninitialized' || status === 'pending') {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" indicator={<LoadingOutlined />} />
      </div>
    );
  } else if (status === 'succeeded' && response) {
    switch (response.status) {
      case 200:
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

  return (
    <Result
      status="error"
      title="Error"
      subTitle="An error occurred, please refresh the page or try again later."
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          Go Home
        </Button>
      }
    />
  );
};

export default RoomContainer;
