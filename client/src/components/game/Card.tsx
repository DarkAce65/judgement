import { CARD_BACK, CARD_FRONTS, Suit } from './cardAssets';

interface Props {
  suit: Suit;
  rank: number;
}

const Card = ({ suit, rank }: Props) => (
  <img src={CARD_FRONTS[suit][rank]} alt={`${suit}${rank}`} width={100} />
);

export const CardBack = () => <img src={CARD_BACK} alt="Unknown card" width={100} />;

export default Card;
