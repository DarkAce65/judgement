import { CSSProperties, useMemo, useRef, useState } from 'react';

import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

import isObjectWithKeys from '../../utils/isObjectWithKeys';
import useElementSize from '../../utils/useElementSize';

import Card, { CardType } from './Card';

interface CardDraggableData {
  index: number;
  card: CardType;
}

export const isCardDraggableData = (data: unknown): data is CardDraggableData =>
  isObjectWithKeys(data, ['index', 'card']) && isObjectWithKeys(data.card, ['suit', 'rank']);

interface DraggableCardProps {
  sortableId: string;
  cardWidth: number;
  index: number;
  card: CardType;
  containerStyle?: CSSProperties;
  onClick?: () => void;
}

function DraggableCard({
  sortableId,
  cardWidth,
  index,
  card,
  containerStyle,
  onClick,
}: DraggableCardProps) {
  const data: CardDraggableData = { index, card };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data,
  });

  return (
    <div
      style={{
        ...containerStyle,
        visibility: isDragging ? 'hidden' : undefined,
        textAlign: 'center',
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <Card ref={setNodeRef} card={card} style={{ width: cardWidth, WebkitTouchCallout: 'none' }} />
    </div>
  );
}

const HandWrapper = styled.div<{ paddingRight?: string }>`
  display: flex;
  padding-right: ${(props) => props.paddingRight};
  overflow: auto;

  & > :first-child {
    margin-left: auto;
  }

  & > :last-child {
    margin-right: auto;
  }
`;

interface Props {
  cards: CardType[];
  onReorderCards?: (sourceIndex: number, destinationIndex: number) => void;
  onClick?: (card: CardType, index: number) => void;
}

function Hand({ cards, onReorderCards, onClick }: Props) {
  const wrapperRef = useRef(null);

  const { width } = useElementSize(wrapperRef);
  const cardWidth = useMemo(() => (width ? Math.min(Math.max(100, width / 6), 175) : 100), [width]);
  const minWidth = useMemo(() => (width > 900 ? cardWidth / 4 : cardWidth / 2), [cardWidth, width]);
  const paddingRight = useMemo(() => {
    if (minWidth * cards.length > width || cards.length < 2) {
      return undefined;
    }
    const l = cards.length / (cards.length - 1);
    return `calc(${100 - 100 * l}% + ${cardWidth * l}px)`;
  }, [cardWidth, cards.length, minWidth, width]);

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
    <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
      <HandWrapper ref={wrapperRef} paddingRight={paddingRight}>
        {cardsWithId.map((card, index) => (
          <DraggableCard
            key={card.id}
            sortableId={card.id}
            cardWidth={cardWidth}
            index={index}
            card={card}
            containerStyle={{
              width: `${100 / cardsWithId.length}%`,
              minWidth,
              maxWidth: cardWidth + 10,
            }}
            {...(onClick && {
              onClick: () => {
                onClick(cardsWithId[index], index);
              },
            })}
          />
        ))}
      </HandWrapper>
      <DragOverlay>
        {draggedCard && (
          <div style={{ textAlign: 'center' }}>
            <Card card={draggedCard} style={{ width: cardWidth }} />
          </div>
        )}
      </DragOverlay>
    </SortableContext>
  );
}

export default Hand;
