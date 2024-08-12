import { Button, ButtonProps } from 'antd';
import { useNavigate } from 'react-router-dom';

import { resetGameState } from '../../data/gameSlice';
import { useAppDispatch } from '../../data/reduxHooks';
import useConnectedGameSocket from '../../game/useConnectedGameSocket';

interface Props {
  gameId: string;
  buttonProps?: Partial<ButtonProps>;
}

function LeaveGameButton({ gameId, buttonProps }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const socket = useConnectedGameSocket();

  return (
    <Button
      type="primary"
      danger={true}
      {...buttonProps}
      onClick={() => {
        if (!socket) return;
        socket.emit('leave_game', gameId);
        navigate('/');
        dispatch(resetGameState());
      }}
    >
      Leave game
    </Button>
  );
}

export default LeaveGameButton;
