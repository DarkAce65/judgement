import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../data/reduxHooks';
import { resetRoomState } from '../../data/roomSlice';
import withGameSocket, { WithGameSocketProps } from '../../game/withGameSocket';

interface Props {
  roomId: string;
}

const LeaveRoomButton = ({ roomId, socket }: Props & WithGameSocketProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <Button
      type="primary"
      danger={true}
      onClick={() => {
        socket.emit('leave_room', roomId);
        navigate('/');
        dispatch(resetRoomState());
      }}
    >
      Leave room
    </Button>
  );
};

export default withGameSocket(LeaveRoomButton);
