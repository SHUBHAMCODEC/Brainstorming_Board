import { Plus } from 'lucide-react';
import { Column as ColumnType, IdeaCard as IdeaCardType } from '../types';
import { IdeaCard } from './IdeaCard';

interface ColumnProps {
  column: ColumnType;
  cards: IdeaCardType[];
  onAddCard: (columnId: string) => void;
  onUpdateCard: (id: string, title: string, description: string) => void;
  onDeleteCard: (id: string) => void;
  onDragStart: (e: React.DragEvent, card: IdeaCardType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
}

export const Column = ({
  column,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDragStart,
  onDragOver,
  onDrop,
}: ColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4 flex flex-col max-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-slate-800 text-lg">{column.name}</h2>
          <p className="text-sm text-slate-500">{cards.length} cards</p>
        </div>
        <button
          onClick={() => onAddCard(column.id)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Add card"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-2 min-h-[200px]"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
      >
        {cards.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No cards yet. Click + to add one.
          </div>
        ) : (
          cards.map((card) => (
            <IdeaCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
