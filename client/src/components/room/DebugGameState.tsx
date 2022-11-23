import { Col, Row, Typography } from 'antd';

import { getGame } from '../../data/gameSlice';
import { useAppSelector } from '../../data/reduxHooks';

const cardStringifyReplacer = (_: string, value: unknown): unknown =>
  value !== null && typeof value === 'object' && 'suit' in value && 'rank' in value
    ? `${value.suit}${value.rank}`
    : value;

const DebugGameState = () => {
  const maybeGame = useAppSelector(getGame);

  if (!maybeGame) {
    return (
      <Typography.Paragraph style={{ fontSize: '0.7em' }}>
        <pre>null</pre>
      </Typography.Paragraph>
    );
  }

  const { fullStateDoNotUse, ...game } = maybeGame;

  return (
    <Typography.Paragraph style={{ fontSize: '0.7em' }}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <pre>{JSON.stringify(game, cardStringifyReplacer, 2)}</pre>
        </Col>
        <Col xs={24} md={12}>
          <pre>{JSON.stringify(fullStateDoNotUse, cardStringifyReplacer, 2)}</pre>
        </Col>
      </Row>
    </Typography.Paragraph>
  );
};

export default DebugGameState;
