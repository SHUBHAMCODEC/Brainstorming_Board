export interface Column {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface IdeaCard {
  id: string;
  user_id: string;
  column_id: string;
  title: string;
  description: string;
  position: number;
  cluster_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AISuggestion {
  id: string;
  user_id: string;
  parent_card_id: string | null;
  suggestion_text: string;
  suggestion_type: 'related_idea' | 'cluster' | 'summary';
  is_accepted: boolean;
  created_at: string;
}

export interface BoardSummary {
  id: string;
  user_id: string;
  summary_text: string;
  key_themes: string[];
  top_ideas: string[];
  created_at: string;
}
