import { CSSProperties } from 'react';

import { CARD_BACK, CARD_FRONTS, Suit } from './cardAssets';

export interface CardType {
  suit: Suit;
  rank: number;
}

interface Props {
  card: CardType;
  onClick?: () => void;
  style?: CSSProperties;
}

const Card = ({ card: { suit, rank }, onClick, style, ...passthroughProps }: Props) => (
  <img
    src={CARD_FRONTS[suit][rank]}
    alt={`${suit}${rank}`}
    draggable={false}
    onClick={onClick}
    style={{ width: '100%', ...style }}
    {...passthroughProps}
  />
);

export const CardBack = ({ style }: { style?: CSSProperties }) => (
  <img src={CARD_BACK} alt="Unknown card" draggable={false} style={{ width: '100%', ...style }} />
);

export default Card;
