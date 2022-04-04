import { useMemo, useState } from 'react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import useWindowSize from '../../utils/useWindowSize';

import Card, { CardType } from './Card';

interface Props {
  cards: CardType[];
  onSetCards?: (cards: CardType[]) => void;
  onSelect?: (index: number) => void;
}

const Hand = ({ cards, onSetCards }: Props) => {
  const { width } = useWindowSize();
  const cardWidth = useMemo(() => Math.max(100, width / 6), [width]);
  const paddingRight = useMemo(
    () =>
      `calc(${100 - 100 * (cards.length / (cards.length - 1))}% + ${
        cardWidth * (cards.length / (cards.length - 1))
      }px)`,
    [cardWidth, cards.length]
  );

  const handId = useMemo(() => `hand-${Math.random().toString(16).slice(2, 8)}`, []);

  const [selected, setSelected] = useState<CardType | null>(null);

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!onSetCards || !result.destination) {
            return;
          }

          const movedCard = cards[result.source.index];
          const newCards = [
            ...cards.slice(0, result.source.index),
            ...cards.slice(result.source.index + 1),
          ];
          newCards.splice(result.destination.index, 0, movedCard);

          onSetCards(newCards);
        }}
      >
        <Droppable droppableId={handId} direction="horizontal">
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              style={{ display: 'flex', justifyContent: 'center', paddingRight }}
            >
              {cards.map((card, index) => (
                <Draggable
                  key={`${index}${card.suit}${card.rank}`}
                  draggableId={`${index}${card.suit}${card.rank}`}
                  index={index}
                >
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      style={{
                        ...draggableProvided.draggableProps.style,
                        display: 'inline-block',
                        ...(!snapshot.isDragging && { width: `${100 / cards.length}%` }),
                        minWidth: 0.13 * cardWidth,
                        maxWidth: cardWidth + 10,
                        textAlign: 'center',
                      }}
                    >
                      <Card
                        {...draggableProvided.dragHandleProps}
                        card={card}
                        style={{ width: cardWidth }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {selected && (
        <div
          style={{
            position: 'fixed',
            display: 'flex',
            zIndex: 100,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#00000044',
            boxShadow: 'inset 0 0 100px black',
            alignItems: 'center',
          }}
        >
          <div style={{ flexGrow: 1 }} />
          <div style={{ flex: '0 0 auto' }}>
            <Card
              card={selected}
              onClick={() => {
                setSelected(null);
              }}
              style={{ width: cardWidth }}
            />
          </div>
          <div style={{ flexGrow: 1 }} />
        </div>
      )}
    </>
  );
};

export default Hand;
