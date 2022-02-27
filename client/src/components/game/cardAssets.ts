/* eslint-disable import/no-webpack-loader-syntax */

import ClubsAce from '!file-loader!../../assets/cards/CLUB-1.svg';
import Clubs10 from '!file-loader!../../assets/cards/CLUB-10.svg';
import ClubsJack from '!file-loader!../../assets/cards/CLUB-11-JACK.svg';
import ClubsQueen from '!file-loader!../../assets/cards/CLUB-12-QUEEN.svg';
import ClubsKing from '!file-loader!../../assets/cards/CLUB-13-KING.svg';
import Clubs2 from '!file-loader!../../assets/cards/CLUB-2.svg';
import Clubs3 from '!file-loader!../../assets/cards/CLUB-3.svg';
import Clubs4 from '!file-loader!../../assets/cards/CLUB-4.svg';
import Clubs5 from '!file-loader!../../assets/cards/CLUB-5.svg';
import Clubs6 from '!file-loader!../../assets/cards/CLUB-6.svg';
import Clubs7 from '!file-loader!../../assets/cards/CLUB-7.svg';
import Clubs8 from '!file-loader!../../assets/cards/CLUB-8.svg';
import Clubs9 from '!file-loader!../../assets/cards/CLUB-9.svg';
import DiamondsAce from '!file-loader!../../assets/cards/DIAMOND-1.svg';
import Diamonds10 from '!file-loader!../../assets/cards/DIAMOND-10.svg';
import DiamondsJack from '!file-loader!../../assets/cards/DIAMOND-11-JACK.svg';
import DiamondsQueen from '!file-loader!../../assets/cards/DIAMOND-12-QUEEN.svg';
import DiamondsKing from '!file-loader!../../assets/cards/DIAMOND-13-KING.svg';
import Diamonds2 from '!file-loader!../../assets/cards/DIAMOND-2.svg';
import Diamonds3 from '!file-loader!../../assets/cards/DIAMOND-3.svg';
import Diamonds4 from '!file-loader!../../assets/cards/DIAMOND-4.svg';
import Diamonds5 from '!file-loader!../../assets/cards/DIAMOND-5.svg';
import Diamonds6 from '!file-loader!../../assets/cards/DIAMOND-6.svg';
import Diamonds7 from '!file-loader!../../assets/cards/DIAMOND-7.svg';
import Diamonds8 from '!file-loader!../../assets/cards/DIAMOND-8.svg';
import Diamonds9 from '!file-loader!../../assets/cards/DIAMOND-9.svg';
import HeartsAce from '!file-loader!../../assets/cards/HEART-1.svg';
import Hearts10 from '!file-loader!../../assets/cards/HEART-10.svg';
import HeartsJack from '!file-loader!../../assets/cards/HEART-11-JACK.svg';
import HeartsQueen from '!file-loader!../../assets/cards/HEART-12-QUEEN.svg';
import HeartsKing from '!file-loader!../../assets/cards/HEART-13-KING.svg';
import Hearts2 from '!file-loader!../../assets/cards/HEART-2.svg';
import Hearts3 from '!file-loader!../../assets/cards/HEART-3.svg';
import Hearts4 from '!file-loader!../../assets/cards/HEART-4.svg';
import Hearts5 from '!file-loader!../../assets/cards/HEART-5.svg';
import Hearts6 from '!file-loader!../../assets/cards/HEART-6.svg';
import Hearts7 from '!file-loader!../../assets/cards/HEART-7.svg';
import Hearts8 from '!file-loader!../../assets/cards/HEART-8.svg';
import Hearts9 from '!file-loader!../../assets/cards/HEART-9.svg';
import SpadesAce from '!file-loader!../../assets/cards/SPADE-1.svg';
import Spades10 from '!file-loader!../../assets/cards/SPADE-10.svg';
import SpadesJack from '!file-loader!../../assets/cards/SPADE-11-JACK.svg';
import SpadesQueen from '!file-loader!../../assets/cards/SPADE-12-QUEEN.svg';
import SpadesKing from '!file-loader!../../assets/cards/SPADE-13-KING.svg';
import Spades2 from '!file-loader!../../assets/cards/SPADE-2.svg';
import Spades3 from '!file-loader!../../assets/cards/SPADE-3.svg';
import Spades4 from '!file-loader!../../assets/cards/SPADE-4.svg';
import Spades5 from '!file-loader!../../assets/cards/SPADE-5.svg';
import Spades6 from '!file-loader!../../assets/cards/SPADE-6.svg';
import Spades7 from '!file-loader!../../assets/cards/SPADE-7.svg';
import Spades8 from '!file-loader!../../assets/cards/SPADE-8.svg';
import Spades9 from '!file-loader!../../assets/cards/SPADE-9.svg';

export { default as CARD_BACK } from '!file-loader!../../assets/cards/BACK-RED.svg';

export type Suit = 'S' | 'H' | 'D' | 'C';

export const CARD_FRONTS: {
  [suit in Suit]: { [rank: number]: string };
} = {
  S: {
    1: SpadesAce,
    2: Spades2,
    3: Spades3,
    4: Spades4,
    5: Spades5,
    6: Spades6,
    7: Spades7,
    8: Spades8,
    9: Spades9,
    10: Spades10,
    11: SpadesJack,
    12: SpadesQueen,
    13: SpadesKing,
  },
  H: {
    1: HeartsAce,
    2: Hearts2,
    3: Hearts3,
    4: Hearts4,
    5: Hearts5,
    6: Hearts6,
    7: Hearts7,
    8: Hearts8,
    9: Hearts9,
    10: Hearts10,
    11: HeartsJack,
    12: HeartsQueen,
    13: HeartsKing,
  },
  D: {
    1: DiamondsAce,
    2: Diamonds2,
    3: Diamonds3,
    4: Diamonds4,
    5: Diamonds5,
    6: Diamonds6,
    7: Diamonds7,
    8: Diamonds8,
    9: Diamonds9,
    10: Diamonds10,
    11: DiamondsJack,
    12: DiamondsQueen,
    13: DiamondsKing,
  },
  C: {
    1: ClubsAce,
    2: Clubs2,
    3: Clubs3,
    4: Clubs4,
    5: Clubs5,
    6: Clubs6,
    7: Clubs7,
    8: Clubs8,
    9: Clubs9,
    10: Clubs10,
    11: ClubsJack,
    12: ClubsQueen,
    13: ClubsKing,
  },
};
