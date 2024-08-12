import { PropsWithChildren, useState } from 'react';

import { SettingOutlined } from '@ant-design/icons';
import { Button, Grid, Popover, Typography } from 'antd';
import styled, { css } from 'styled-components';

import { getPlayerName } from '../../data/playerSlice';
import { useAppSelector } from '../../data/reduxHooks';
import withPromptPlayerName, { WithPromptPlayerNameProps } from '../withPromptPlayerName';

import LeaveGameButton from './LeaveGameButton';

const CornerDiv = styled.div<{
  floating: boolean;
}>`
  z-index: 999;
  ${(props) =>
    props.floating
      ? css`
          position: fixed;
          top: 20px;
          right: 20px;
        `
      : css`
          text-align: right;
          margin-bottom: 20px;
        `};
`;

interface Props {
  gameId: string;
}

function GameControls({
  children,
  gameId,
  promptPlayerName,
}: PropsWithChildren<Props & WithPromptPlayerNameProps>) {
  const breakpoints = Grid.useBreakpoint();
  const playerName = useAppSelector(getPlayerName);

  const [open, setOpen] = useState(false);

  return (
    <>
      <CornerDiv floating={breakpoints.md ?? false}>
        <Popover
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
                <LeaveGameButton gameId={gameId} buttonProps={{ block: true }} />
              </Typography.Paragraph>
            </div>
          }
        >
          <SettingOutlined
            tabIndex={1}
            style={{ cursor: 'pointer', fontSize: '2rem' }}
            onClick={() => {
              setOpen((o) => !o);
            }}
          />
        </Popover>
      </CornerDiv>
      {children}
    </>
  );
}

export default withPromptPlayerName(GameControls);
