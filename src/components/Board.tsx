import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Column as ColumnType, IdeaCard as IdeaCardType, AISuggestion, BoardSummary } from '../types';
import { Column } from './Column';
import { Toolbar } from './Toolbar';
import { RightPanel } from './RightPanel';
import { LogOut, Loader2 } from 'lucide-react';

export const Board = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<IdeaCardType[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [summary, setSummary] = useState<BoardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedCard, setDraggedCard] = useState<IdeaCardType | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [columnsData, cardsData, suggestionsData, summaryData] = await Promise.all([
        supabase.from('columns').select('*').order('position'),
        supabase.from('idea_cards').select('*').order('position'),
        supabase.from('ai_suggestions').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('board_summaries').select('*').order('created_at', { ascending: false }).limit(1),
      ]);

      if (columnsData.data) {
        if (columnsData.data.length === 0) {
          await initializeDefaultColumns();
        } else {
          setColumns(columnsData.data);
        }
      }

      if (cardsData.data) setCards(cardsData.data);
      if (suggestionsData.data) setSuggestions(suggestionsData.data);
      if (summaryData.data && summaryData.data.length > 0) setSummary(summaryData.data[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultColumns = async () => {
    const defaultColumns = [
      { name: 'Ideas', position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Completed', position: 2 },
    ];

    const { data } = await supabase
      .from('columns')
      .insert(defaultColumns.map(col => ({ ...col, user_id: user!.id })))
      .select();

    if (data) setColumns(data);
  };

  const handleAddCard = async (columnId?: string) => {
    const targetColumnId = columnId || columns[0]?.id;
    if (!targetColumnId) return;

    const columnCards = cards.filter(c => c.column_id === targetColumnId);
    const maxPosition = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.position)) : -1;

    const { data, error } = await supabase
      .from('idea_cards')
      .insert({
        user_id: user!.id,
        column_id: targetColumnId,
        title: 'New idea',
        description: '',
        position: maxPosition + 1,
      })
      .select()
      .single();

    if (data && !error) {
      setCards([...cards, data]);
      generateAISuggestions(data);
    }
  };

  const handleUpdateCard = async (id: string, title: string, description: string) => {
    const { error } = await supabase
      .from('idea_cards')
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setCards(cards.map(c => (c.id === id ? { ...c, title, description } : c)));
    }
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from('idea_cards').delete().eq('id', id);

    if (!error) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleDragStart = (e: React.DragEvent, card: IdeaCardType) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedCard || draggedCard.column_id === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    const targetColumnCards = cards.filter(c => c.column_id === targetColumnId);
    const maxPosition = targetColumnCards.length > 0 ? Math.max(...targetColumnCards.map(c => c.position)) : -1;

    const { error } = await supabase
      .from('idea_cards')
      .update({
        column_id: targetColumnId,
        position: maxPosition + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', draggedCard.id);

    if (!error) {
      setCards(cards.map(c =>
        c.id === draggedCard.id
          ? { ...c, column_id: targetColumnId, position: maxPosition + 1 }
          : c
      ));
    }

    setDraggedCard(null);
  };

  const generateAISuggestions = async (card: IdeaCardType) => {
    setIsProcessing(true);
    try {
      const relatedSuggestions = [
        `Explore "${card.title}" from a different angle`,
        `Break down "${card.title}" into smaller steps`,
        `Consider the impact of "${card.title}" on users`,
      ];

      const suggestionPromises = relatedSuggestions.map(text =>
        supabase
          .from('ai_suggestions')
          .insert({
            user_id: user!.id,
            parent_card_id: card.id,
            suggestion_text: text,
            suggestion_type: 'related_idea',
          })
          .select()
          .single()
      );

      const results = await Promise.all(suggestionPromises);
      const newSuggestions = results.filter(r => r.data).map(r => r.data!);
      setSuggestions([...newSuggestions, ...suggestions]);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCluster = async () => {
    setIsProcessing(true);
    try {
      const clusterId = crypto.randomUUID();
      const cardsToCluster = cards.slice(0, Math.min(3, cards.length));

      await Promise.all(
        cardsToCluster.map(card =>
          supabase
            .from('idea_cards')
            .update({ cluster_id: clusterId })
            .eq('id', card.id)
        )
      );

      setCards(cards.map(c =>
        cardsToCluster.some(tc => tc.id === c.id)
          ? { ...c, cluster_id: clusterId }
          : c
      ));

      const { data } = await supabase
        .from('ai_suggestions')
        .insert({
          user_id: user!.id,
          suggestion_text: `Clustered ${cardsToCluster.length} similar ideas together`,
          suggestion_type: 'cluster',
        })
        .select()
        .single();

      if (data) {
        setSuggestions([data, ...suggestions]);
      }
    } catch (error) {
      console.error('Error clustering:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const cardTitles = cards.map(c => c.title).slice(0, 10);

      const summaryText = cards.length > 0
        ? `Your board contains ${cards.length} ideas across ${columns.length} stages. Key focus areas include innovation, execution, and completion tracking.`
        : 'Your board is empty. Start adding ideas to see insights!';

      const keyThemes = cards.length > 2
        ? ['Innovation', 'Planning', 'Execution']
        : [];

      const topIdeas = cardTitles.slice(0, 3);

      const { data } = await supabase
        .from('board_summaries')
        .insert({
          user_id: user!.id,
          summary_text: summaryText,
          key_themes: keyThemes,
          top_ideas: topIdeas,
        })
        .select()
        .single();

      if (data) {
        setSummary(data);
      }
    } catch (error) {
      console.error('Error summarizing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: AISuggestion) => {
    await handleAddCard(columns[0]?.id);

    await supabase
      .from('ai_suggestions')
      .update({ is_accepted: true })
      .eq('id', suggestion.id);

    setSuggestions(suggestions.map(s =>
      s.id === suggestion.id ? { ...s, is_accepted: true } : s
    ));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brainstorming Board</h1>
          <p className="text-sm text-slate-600">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          onAddCard={() => handleAddCard()}
          onCluster={handleCluster}
          onSummarize={handleSummarize}
          isProcessing={isProcessing}
        />

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full">
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                cards={cards.filter(c => c.column_id === column.id)}
                onAddCard={handleAddCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        <RightPanel
          summary={summary}
          suggestions={suggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
        />
      </div>
    </div>
  );
};
