import { CSSProperties, useMemo, useState } from 'react';

import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useResizeAware from 'react-resize-aware';

import Card, { CardType } from './Card';

const DraggableCard = ({
  sortableId,
  cardWidth,
  card,
  containerStyle,
  onClick,
}: {
  sortableId: string;
  cardWidth: number;
  card: CardType;
  containerStyle?: CSSProperties;
  onClick?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { card },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...containerStyle,
        visibility: isDragging ? 'hidden' : undefined,
        textAlign: 'center',
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <Card card={card} style={{ width: cardWidth }} />
    </div>
  );
};

interface Props {
  cards: CardType[];
  onReorderCards?: (sourceIndex: number, destinationIndex: number) => void;
  onClick?: (card: CardType, index: number) => void;
}

const Hand = ({ cards, onReorderCards, onClick }: Props) => {
  const [resizeListener, { width }] = useResizeAware();
  const cardWidth = useMemo(() => (width ? Math.min(Math.max(100, width / 6), 175) : 100), [width]);

  const paddingRight = useMemo(
    () =>
      cards.length < 2
        ? 0
        : `calc(${100 - 100 * (cards.length / (cards.length - 1))}% + ${
            cardWidth * (cards.length / (cards.length - 1))
          }px)`,
    [cardWidth, cards.length]
  );

  const cardsWithId: (CardType & { id: string })[] = useMemo(() => {
    const counter: Record<string, number> = {};
    return cards.map((card) => {
      const cardId = `${card.suit}${card.rank}`;
      if (!counter[cardId]) {
        counter[cardId] = 0;
      }
      const num = counter[cardId];
      counter[cardId] += 1;

      return { ...card, id: `${num}${cardId}` };
    });
  }, [cards]);
  const cardOrder = useMemo(() => cardsWithId.map((card) => card.id), [cardsWithId]);

  const [draggedCard, setDraggedCard] = useState<CardType | null>(null);
  useDndMonitor({
    onDragStart: (event) => {
      const { active } = event;
      if (typeof active.id === 'string' && cardOrder.includes(active.id)) {
        setDraggedCard(active.data.current!.card as CardType);
      }
    },
    onDragCancel: (event) => {
      const { active } = event;
      if (typeof active.id === 'string' && cardOrder.includes(active.id)) {
        setDraggedCard(null);
      }
    },
    onDragEnd: (event) => {
      const { active, over } = event;
      let oldIndex: number;
      let newIndex: number;
      if (typeof active.id === 'string' && (oldIndex = cardOrder.indexOf(active.id)) !== -1) {
        if (
          onReorderCards &&
          over &&
          active.id !== over.id &&
          typeof over.id === 'string' &&
          (newIndex = cardOrder.indexOf(over.id)) !== -1
        ) {
          onReorderCards(oldIndex, newIndex);
        }
        setDraggedCard(null);
      }
    },
  });

  return (
    <div>
      {resizeListener}
      <div style={{ display: 'flex', justifyContent: 'center', paddingRight }}>
        <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
          {cardsWithId.map((card, index) => (
            <DraggableCard
              key={card.id}
              sortableId={card.id}
              cardWidth={cardWidth}
              card={card}
              containerStyle={{
                width: `${100 / cardsWithId.length}%`,
                minWidth: 0.13 * cardWidth,
                maxWidth: cardWidth + 10,
              }}
              {...(onClick && {
                onClick: () => {
                  onClick(cardsWithId[index], index);
                },
              })}
            />
          ))}
          <DragOverlay>
            {draggedCard && (
              <div style={{ textAlign: 'center' }}>
                <Card card={draggedCard} style={{ width: cardWidth }} />
              </div>
            )}
          </DragOverlay>
        </SortableContext>
      </div>
    </div>
  );
};

export default Hand;
