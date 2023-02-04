import { PropsWithChildren, useState } from 'react';

import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover, Typography } from 'antd';

import { getPlayerName } from '../../data/playerSlice';
import { useAppSelector } from '../../data/reduxHooks';
import withPromptPlayerName, { WithPromptPlayerNameProps } from '../withPromptPlayerName';

import LeaveRoomButton from './LeaveRoomButton';

interface Props {
  roomId: string;
}

const RoomSettingsWrapper = ({
  children,
  roomId,
  promptPlayerName,
}: PropsWithChildren<Props & WithPromptPlayerNameProps>) => {
  const playerName = useAppSelector(getPlayerName);

  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      <Popover
        zIndex={999}
        open={open}
        trigger="click"
        placement="bottomLeft"
        showArrow={false}
        content={
          <div style={{ textAlign: 'center', maxWidth: 200 }}>
            <Typography.Title level={5}>{playerName}</Typography.Title>
            <Typography.Paragraph>
              <Button
                block={true}
                onClick={() => {
                  promptPlayerName();
                }}
              >
                Change name
              </Button>
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              <LeaveRoomButton roomId={roomId} buttonProps={{ block: true }} />
            </Typography.Paragraph>
          </div>
        }
      >
        <div style={{ position: 'fixed', display: 'inline-block', top: 20, right: 20 }}>
          <SettingOutlined
            tabIndex={1}
            style={{ cursor: 'pointer', fontSize: '2rem' }}
            onClick={() => {
              setOpen((o) => !o);
            }}
          />
        </div>
      </Popover>
    </>
  );
};

export default withPromptPlayerName(RoomSettingsWrapper);
