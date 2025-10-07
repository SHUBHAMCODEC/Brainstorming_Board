import { useState } from 'react';
import { Trash2, Edit2, GripVertical } from 'lucide-react';
import { IdeaCard as IdeaCardType } from '../types';

interface IdeaCardProps {
  card: IdeaCardType;
  onUpdate: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, card: IdeaCardType) => void;
}

export const IdeaCard = ({ card, onUpdate, onDelete, onDragStart }: IdeaCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(card.id, title, description);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(card.title);
    setDescription(card.description);
    setIsEditing(false);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, card)}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-move group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Card title"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Description (optional)"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-slate-800 mb-1 break-words">{card.title}</h3>
              {card.description && (
                <p className="text-sm text-slate-600 break-words">{card.description}</p>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
