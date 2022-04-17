import { useMemo } from 'react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import useWindowSize from '../../utils/useWindowSize';

import Card, { CardType } from './Card';

interface Props {
  cards: CardType[];
  onReorderCards?: (sourceIndex: number, destinationIndex: number) => void;
  onSelect?: (index: number) => void;
}

const Hand = ({ cards, onReorderCards, onSelect }: Props) => {
  const handId = useMemo(() => `hand-${Math.random().toString(16).slice(2, 8)}`, []);

  const { width } = useWindowSize();
  const cardWidth = useMemo(() => Math.max(100, width / 6), [width]);
  const paddingRight = useMemo(
    () =>
      `calc(${100 - 100 * (cards.length / (cards.length - 1))}% + ${
        cardWidth * (cards.length / (cards.length - 1))
      }px)`,
    [cardWidth, cards.length]
  );

  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!onReorderCards || !result.destination) {
          return;
        }

        onReorderCards(result.source.index, result.destination.index);
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
                    onClick={() => {
                      if (onSelect) {
                        onSelect(index);
                      }
                    }}
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
  );
};

export default Hand;
