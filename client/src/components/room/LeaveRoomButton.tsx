import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../data/reduxHooks';
import { resetRoomState } from '../../data/roomSlice';
import useConnectedGameSocket from '../../game/useConnectedGameSocket';

interface Props {
  roomId: string;
}

const LeaveRoomButton = ({ roomId }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const socket = useConnectedGameSocket();

  return (
    <Button
      type="primary"
      danger={true}
      onClick={() => {
        if (!socket) return;
        socket.emit('leave_room', roomId);
        navigate('/');
        dispatch(resetRoomState());
      }}
    >
      Leave room
    </Button>
  );
};

export default LeaveRoomButton;
