import { LoadingOutlined } from '@ant-design/icons';
import { Button, Result, Spin } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import useFetch from '../api/useFetch';

import Room from './Room';

const RoomContainer = () => {
  const history = useHistory();
  const { roomId } = useParams<{ roomId: string }>();

  const { status, response } = useFetch<{ exists: boolean }>(`/rooms/${roomId}/exists`);

  if (status === 'succeeded') {
    if (response && response.exists) {
      return <Room />;
    }
  } else if (status === 'uninitialized' || status === 'pending') {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" indicator={<LoadingOutlined />} />
      </div>
    );
  }

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
};

export default RoomContainer;
