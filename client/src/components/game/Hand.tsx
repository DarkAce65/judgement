import { useMemo, useState } from 'react';

import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import useWindowSize from '../../utils/useWindowSize';

import Card, { CardType } from './Card';

const DraggableCard = ({
  sortableId,
  cardWidth,
  numCards,
  card,
  onClick,
}: {
  sortableId: string;
  cardWidth: number;
  numCards: number;
  card: CardType;
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
        visibility: isDragging ? 'hidden' : undefined,
        width: `${100 / numCards}%`,
        minWidth: 0.13 * cardWidth,
        maxWidth: cardWidth + 10,
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
  onSelect?: (index: number) => void;
}

const Hand = ({ cards, onReorderCards, onSelect }: Props) => {
  const { width } = useWindowSize();
  const cardWidth = useMemo(() => Math.max(100, width / 6), [width]);
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

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  useDndMonitor({
    onDragStart: (event) => {
      setActiveCard(event.active.data.current!.card as CardType);
    },
    onDragCancel: () => {
      setActiveCard(null);
    },
    onDragEnd: (event) => {
      if (onReorderCards) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIndex = cardOrder.indexOf(active.id as string);
          const newIndex = cardOrder.indexOf(over.id as string);
          onReorderCards(oldIndex, newIndex);
        }
      }
      setActiveCard(null);
    },
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingRight }}>
      <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
        {cardsWithId.map((card, index) => (
          <DraggableCard
            key={card.id}
            sortableId={card.id}
            cardWidth={cardWidth}
            numCards={cards.length}
            card={card}
            {...(onSelect && {
              onClick: () => {
                onSelect(index);
              },
            })}
          />
        ))}
        <DragOverlay>
          {activeCard && (
            <div style={{ textAlign: 'center' }}>
              <Card card={activeCard} style={{ width: cardWidth }} />
            </div>
          )}
        </DragOverlay>
      </SortableContext>
    </div>
  );
};

export default Hand;
