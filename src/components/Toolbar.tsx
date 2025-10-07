import { Plus, Grid3x3, FileText } from 'lucide-react';

interface ToolbarProps {
  onAddCard: () => void;
  onCluster: () => void;
  onSummarize: () => void;
  isProcessing: boolean;
}

export const Toolbar = ({ onAddCard, onCluster, onSummarize, isProcessing }: ToolbarProps) => {
  return (
    <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4">
      <button
        onClick={onAddCard}
        disabled={isProcessing}
        className="p-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Add new idea card"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={onCluster}
        disabled={isProcessing}
        className="p-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Cluster similar ideas"
      >
        <Grid3x3 className="w-6 h-6" />
      </button>

      <button
        onClick={onSummarize}
        disabled={isProcessing}
        className="p-3 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Summarize board"
      >
        <FileText className="w-6 h-6" />
      </button>
    </div>
  );
};
