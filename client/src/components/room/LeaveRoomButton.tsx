import { Button } from 'antd';
import { useHistory } from 'react-router-dom';

import useGameSocket from '../../game/useGameSocket';

interface Props {
  roomId: string;
}

const LeaveRoomButton = ({ roomId }: Props) => {
  const history = useHistory();

  const { socket } = useGameSocket();

  return (
    <Button
      type="primary"
      danger={true}
      onClick={() => {
        if (socket) {
          socket.emit('leave_room', roomId);
          history.push('/');
        }
      }}
    >
      Leave room
    </Button>
  );
};

export default LeaveRoomButton;
