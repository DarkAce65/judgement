import { ImgHTMLAttributes } from 'react';

import { CARD_BACK, CARD_FRONTS, Suit } from './cardAssets';

export interface CardType {
  suit: Suit;
  rank: number;
}

interface Props {
  card: CardType;
}

const Card = ({
  card: { suit, rank },
  ...passthroughProps
}: Props & ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    {...passthroughProps}
    src={CARD_FRONTS[suit][rank]}
    alt={`${suit}${rank}`}
    draggable={false}
    style={{ width: '100%', ...passthroughProps.style }}
  />
);

export const CardBack = ({ ...passthroughProps }: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    {...passthroughProps}
    src={CARD_BACK}
    alt="Unknown card"
    draggable={false}
    style={{ width: '100%', ...passthroughProps.style }}
  />
);

export default Card;
