import { ImgHTMLAttributes, forwardRef } from 'react';

import { CARD_BACK, CARD_FRONTS, Suit } from './cardAssets';

export interface CardType {
  suit: Suit;
  rank: number;
}

interface Props {
  card: CardType;
}

const Card = forwardRef<HTMLImageElement, Props & ImgHTMLAttributes<HTMLImageElement>>(
  ({ card: { suit, rank }, ...passthroughProps }, ref) => (
    <img
      {...passthroughProps}
      ref={ref}
      src={CARD_FRONTS[suit][rank]}
      alt={`${suit}${rank}`}
      draggable={false}
      style={{ width: '100%', ...passthroughProps.style }}
    />
  ),
);
Card.displayName = 'Card';

export const CardBack = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ ...passthroughProps }, ref) => (
    <img
      {...passthroughProps}
      ref={ref}
      src={CARD_BACK}
      alt="Unknown card"
      draggable={false}
      style={{ width: '100%', ...passthroughProps.style }}
    />
  ),
);
CardBack.displayName = 'CardBack';

export default Card;
