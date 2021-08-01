import { Button } from 'antd';
import { useHistory } from 'react-router-dom';

import withGameSocket, { WithGameSocketProps } from '../../game/withGameSocket';

interface Props {
  roomId: string;
}

const LeaveRoomButton = ({ roomId, socket }: Props & WithGameSocketProps) => {
  const history = useHistory();

  return (
    <Button
      type="primary"
      danger={true}
      onClick={() => {
        socket.emit('leave_room', roomId);
        history.push('/');
      }}
    >
      Leave room
    </Button>
  );
};

export default withGameSocket(LeaveRoomButton);
