import type { PlaceType } from '../../../api/types';

export const placeTypeLabels: Record<PlaceType, string> = {
  SITE: 'Stätte',
  MUSEUM: 'Museum',
  POI: 'POI',
  ARCHAEOLOGICAL_SITE: 'Ausgrabungsstätte',
  HISTORICAL_SITE: 'Historischer Ort',
  MONUMENT: 'Denkmal',
  ARCHIVE: 'Archiv',
  RELIGIOUS_SITE: 'Religiöse Stätte',
  FORTIFICATION: 'Befestigung',
  SETTLEMENT: 'Siedlung',
  BURIAL_SITE: 'Grabstätte',
  INDUSTRIAL_HERITAGE: 'Industriedenkmal',
  CULTURAL_LANDSCAPE: 'Kulturlandschaft',
  RESEARCH_LOCATION: 'Forschungsstandort',
  WITNESS_LOCATION: 'Zeitzeugen-Ort',
  OTHER: 'Sonstiges',
};

export const placeTypeIcons: Record<PlaceType, string> = {
  SITE: '📍',
  MUSEUM: '🏛️',
  POI: '📌',
  ARCHAEOLOGICAL_SITE: '⛏️',
  HISTORICAL_SITE: '🏰',
  MONUMENT: '🗿',
  ARCHIVE: '📚',
  RELIGIOUS_SITE: '⛪',
  FORTIFICATION: '🏯',
  SETTLEMENT: '🏘️',
  BURIAL_SITE: '⚰️',
  INDUSTRIAL_HERITAGE: '🏭',
  CULTURAL_LANDSCAPE: '🌄',
  RESEARCH_LOCATION: '🔬',
  WITNESS_LOCATION: '🎤',
  OTHER: '❓',
};

export function getPlaceTypeLabel(type?: PlaceType): string {
  if (!type) return 'Unbekannt';
  return placeTypeLabels[type] || type;
}

export function getPlaceTypeIcon(type?: PlaceType): string {
  if (!type) return '📍';
  return placeTypeIcons[type] || '📍';
}
