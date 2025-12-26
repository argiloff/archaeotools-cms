import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listAllPlaces, assignPlaceToProject, deletePlace } from '../../api/places.service';
import { listProjects } from '../../api/projects.service';
import { Input, Button, Card, CardBody, Badge, EmptyState, LoadingSpinner, Alert } from '../../components/ui';
import { useToast } from '../../components/ui';
import './placesBrowser.css';

export function PlacesBrowserPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());

  const placesQuery = useQuery({
    queryKey: ['all-places', { unassignedOnly: showUnassignedOnly }],
    queryFn: () => listAllPlaces({ unassignedOnly: showUnassignedOnly }),
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const assignMutation = useMutation({
    mutationFn: ({ placeId, projectId }: { placeId: string; projectId: string }) =>
      assignPlaceToProject(placeId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-places'] });
      showToast('success', 'Place erfolgreich zugewiesen');
      setSelectedPlaces(new Set());
    },
    onError: () => {
      showToast('error', 'Fehler beim Zuweisen');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlace,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-places'] });
      showToast('success', 'Place gelöscht');
    },
    onError: () => {
      showToast('error', 'Fehler beim Löschen');
    },
  });

  const filteredPlaces = useMemo(() => {
    const places = placesQuery.data ?? [];
    const searchLower = search.toLowerCase();
    
    return places.filter((place) => {
      const matchesSearch = !search || 
        `${place.title ?? ''} ${place.description ?? ''} ${place.city ?? ''} ${place.country ?? ''}`.toLowerCase().includes(searchLower);
      
      const matchesCountry = !countryFilter || place.country === countryFilter;
      
      return matchesSearch && matchesCountry;
    });
  }, [placesQuery.data, search, countryFilter]);

  const countries = useMemo(() => {
    const places = placesQuery.data ?? [];
    const uniqueCountries = new Set(places.map(p => p.country).filter(Boolean));
    return Array.from(uniqueCountries).sort();
  }, [placesQuery.data]);

  const togglePlaceSelection = (placeId: string) => {
    const newSelection = new Set(selectedPlaces);
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId);
    } else {
      newSelection.add(placeId);
    }
    setSelectedPlaces(newSelection);
  };

  const handleBulkAssign = (projectId: string) => {
    selectedPlaces.forEach(placeId => {
      assignMutation.mutate({ placeId, projectId });
    });
  };

  if (placesQuery.isLoading) {
    return (
      <div className="page">
        <LoadingSpinner size="lg" text="Lade Places..." />
      </div>
    );
  }

  const totalPlaces = placesQuery.data?.length ?? 0;
  const unassignedCount = placesQuery.data?.filter(p => !p.projectId).length ?? 0;

  return (
    <div className="page places-browser-page">
      <div className="places-header">
        <div>
          <h1>Global Places Browser</h1>
          <p className="places-subtitle">
            {totalPlaces} {totalPlaces === 1 ? 'Place' : 'Places'} — {unassignedCount} nicht zugewiesen
          </p>
        </div>
        <Button onClick={() => navigate('/places/import')} icon="📥">
          JSON Import
        </Button>
      </div>

      <Alert variant="info" title="Global Places">
        Places sind nicht projekt-gebunden. Du kannst sie jederzeit Projekten zuweisen oder als globale POI-Datenbank nutzen.
      </Alert>

      <div className="places-filters">
        <Input
          placeholder="Suche nach Titel, Stadt, Land..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon="🔍"
        />
        
        {countries.length > 0 && (
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="country-filter"
          >
            <option value="">Alle Länder</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        )}

        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={showUnassignedOnly}
            onChange={(e) => setShowUnassignedOnly(e.target.checked)}
          />
          <span>Nur nicht zugewiesene</span>
        </label>

        {selectedPlaces.size > 0 && (
          <div className="bulk-actions">
            <Badge variant="primary">{selectedPlaces.size} ausgewählt</Badge>
            {projectsQuery.data && projectsQuery.data.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAssign(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bulk-assign-select"
              >
                <option value="">Zu Projekt zuweisen...</option>
                {projectsQuery.data.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedPlaces(new Set())}>
              Abwählen
            </Button>
          </div>
        )}
      </div>

      {filteredPlaces.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Keine Places gefunden"
          description={search || countryFilter ? "Versuche andere Filter" : "Importiere Places aus JSON-Dateien"}
          action={
            <Button onClick={() => navigate('/places/import')}>
              JSON Import starten
            </Button>
          }
        />
      ) : (
        <div className="places-grid">
          {filteredPlaces.map((place) => (
            <Card
              key={place.id}
              variant="elevated"
              padding="md"
              hover
              className={selectedPlaces.has(place.id) ? 'place-card--selected' : ''}
            >
              <div className="place-card-header-wrapper">
                <div className="place-card-header">
                  <input
                    type="checkbox"
                    checked={selectedPlaces.has(place.id)}
                    onChange={() => togglePlaceSelection(place.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <h3 className="place-card-title">{place.title || 'Unbenannt'}</h3>
                </div>
                <div className="place-card-badges">
                  {place.type && <Badge variant="default" size="sm">{place.type}</Badge>}
                  {place.projectId ? (
                    <Badge variant="success" size="sm">Zugewiesen</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Frei</Badge>
                  )}
                </div>
              </div>
              <CardBody>
                {place.description && (
                  <p className="place-description">{place.description}</p>
                )}
                <div className="place-meta">
                  {place.city && place.country && (
                    <div className="place-location">
                      📍 {place.city}, {place.country}
                    </div>
                  )}
                  {place.importSource && (
                    <div className="place-source">
                      📥 {place.importSource}
                    </div>
                  )}
                  {place.tags && place.tags.length > 0 && (
                    <div className="place-tags">
                      {place.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="place-actions">
                  {!place.projectId && projectsQuery.data && projectsQuery.data.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignMutation.mutate({ placeId: place.id, projectId: e.target.value });
                        }
                      }}
                      className="assign-select"
                    >
                      <option value="">Zu Projekt zuweisen...</option>
                      {projectsQuery.data.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Place "${place.title}" wirklich löschen?`)) {
                        deleteMutation.mutate(place.id);
                      }
                    }}
                  >
                    Löschen
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
