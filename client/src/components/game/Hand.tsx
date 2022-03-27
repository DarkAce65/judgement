import { useMemo, useState } from 'react';

import Draggable, { ControlPosition } from 'react-draggable';
import styled from 'styled-components';

import useWindowSize from '../../utils/useWindowSize';

import Card, { CardType } from './Card';

const HandContainer = styled.div`
  .react-draggable-dragging {
    z-index: 1;
  }
`;

const DraggableCard = ({
  card,
  cardWidth,
  onSelect,
}: {
  card: CardType;
  cardWidth: number;
  onSelect: (c: CardType) => void;
}) => {
  const cardHeight = useMemo(() => cardWidth * 1.39683, [cardWidth]);
  const [position, setPosition] = useState<ControlPosition>({ x: 0, y: 0 });
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <Draggable
      position={position}
      positionOffset={centerOffset}
      bounds={{ bottom: 0 }}
      onMouseDown={(event) => {
        const boundingRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setCenterOffset({
          x: event.clientX - boundingRect.x - cardWidth / 2,
          y: event.clientY - boundingRect.y - cardHeight / 2,
        });
      }}
      onStop={(_, { x, y }) => {
        console.log({ x, y }, centerOffset);
        if (-y - centerOffset.y < cardHeight) {
          setPosition({ x: 0, y: 0 });
          setCenterOffset({ x: 0, y: 0 });
        } else {
          setPosition({ x: 0, y });
          setCenterOffset({ x: 0, y: centerOffset.y });
          onSelect(card);
        }
      }}
    >
      <div style={{ display: 'inline-block', width: 0.13 * cardWidth }}>
        <Card card={card} style={{ width: cardWidth }} />
      </div>
    </Draggable>
  );
};

interface Props {
  cards: CardType[];
  onSelect?: (index: number) => void;
}

const Hand = ({ cards }: Props) => {
  const { width } = useWindowSize();
  const cardWidth = useMemo(() => Math.max(100, width / 6), [width]);

  const [selected, setSelected] = useState<CardType | null>(null);

  return (
    <>
      <HandContainer
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          paddingRight: 0.87 * cardWidth,
        }}
      >
        {cards
          .filter(
            (card) => !selected || (card.rank !== selected.rank && card.suit !== selected.suit)
          )
          .map((card, index) => (
            <DraggableCard
              key={index}
              card={card}
              cardWidth={cardWidth}
              onSelect={() => {
                setSelected(card);
              }}
            />
          ))}
      </HandContainer>
      {selected && (
        <div
          style={{
            position: 'absolute',
            zIndex: 100,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#cccccccc',
            textAlign: 'center',
          }}
        >
          <Card
            card={selected}
            onClick={() => {
              setSelected(null);
            }}
            style={{ width: cardWidth }}
          />
        </div>
      )}
    </>
  );
};

export default Hand;
