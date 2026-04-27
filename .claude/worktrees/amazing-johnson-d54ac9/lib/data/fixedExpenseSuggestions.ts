export interface ExpenseSuggestion {
  name: string;
  emoji: string;
  brandColor: string;
  logoUrl?: string;
}

// Simple Icons CDN: https://cdn.simpleicons.org/{slug}
// Returns SVG en color de marca, sin fondo — se muestra sobre bg-white en el dropdown/card
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

export const EXPENSE_SUGGESTIONS: ExpenseSuggestion[] = [
  { name: 'Netflix', emoji: '🎬', brandColor: '#E50914', logoUrl: si('netflix') },
  { name: 'Spotify', emoji: '🎵', brandColor: '#1DB954', logoUrl: si('spotify') },
  { name: 'Disney+', emoji: '🏰', brandColor: '#113CCF', logoUrl: si('disneyplus') },
  { name: 'Amazon Prime', emoji: '📦', brandColor: '#FF9900', logoUrl: si('amazon') },
  { name: 'YouTube Premium', emoji: '▶️', brandColor: '#FF0000', logoUrl: si('youtube') },
  { name: 'HBO Max', emoji: '📺', brandColor: '#5822B4', logoUrl: si('hbomax') },
  { name: 'Apple TV+', emoji: '🍎', brandColor: '#555555', logoUrl: si('apple') },
  { name: 'Apple Music', emoji: '🎶', brandColor: '#FC3C44', logoUrl: si('applemusic') },
  { name: 'Crunchyroll', emoji: '🍥', brandColor: '#F47521', logoUrl: si('crunchyroll') },
  { name: 'Xbox Game Pass', emoji: '🎮', brandColor: '#107C10', logoUrl: si('xbox') },
  { name: 'PlayStation Plus', emoji: '🕹️', brandColor: '#003087', logoUrl: si('playstation') },
  { name: 'Adobe Creative', emoji: '🎨', brandColor: '#FF0000', logoUrl: si('adobe') },
  { name: 'Microsoft 365', emoji: '💼', brandColor: '#0078D4', logoUrl: si('microsoft') },
  { name: 'Google One', emoji: '☁️', brandColor: '#4285F4', logoUrl: si('google') },
  { name: 'iCloud+', emoji: '🍎', brandColor: '#3B82F6', logoUrl: si('icloud') },
  { name: 'Dropbox', emoji: '📁', brandColor: '#0061FF', logoUrl: si('dropbox') },
  { name: 'Canva Pro', emoji: '✏️', brandColor: '#7C3AED', logoUrl: si('canva') },
  { name: 'ChatGPT Plus', emoji: '🤖', brandColor: '#10A37F', logoUrl: si('openai') },
  { name: 'Notion', emoji: '📝', brandColor: '#000000', logoUrl: si('notion') },
  { name: 'Figma', emoji: '🖌️', brandColor: '#F24E1E', logoUrl: si('figma') },
  { name: 'Github Copilot', emoji: '💻', brandColor: '#24292E', logoUrl: si('github') },
  { name: 'Gimnasio', emoji: '💪', brandColor: '#F97316' },
  { name: 'Agua', emoji: '💧', brandColor: '#3B82F6' },
  { name: 'Luz / Electricidad', emoji: '⚡', brandColor: '#EAB308' },
  { name: 'Gas', emoji: '🔥', brandColor: '#F97316' },
  { name: 'Internet', emoji: '🌐', brandColor: '#6366F1' },
  { name: 'Celular / Móvil', emoji: '📱', brandColor: '#8B5CF6' },
  { name: 'Seguro de salud', emoji: '🏥', brandColor: '#22C55E' },
  { name: 'Alquiler', emoji: '🏠', brandColor: '#14B8A6' },
  { name: 'Seguro vehicular', emoji: '🚗', brandColor: '#64748B' },
];
