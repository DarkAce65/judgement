import { CARD_FRONTS, Suit } from './cardAssets';

interface Props {
  suit: Suit;
  rank: number;
}

const Card = ({ suit, rank }: Props) => (
  <img src={CARD_FRONTS[suit][rank]} alt={`${suit}${rank}`} width={100} />
);

export default Card;
