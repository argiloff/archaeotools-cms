import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createGlobalPlace } from '../../api/places.service';
import { listProjects } from '../../api/projects.service';
import { Button, Card, CardHeader, CardBody, Alert, Badge, ProgressBar } from '../../components/ui';
import { useToast } from '../../components/ui';
import type { Place } from '../../api/types';
import './placesImport.css';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ place: string; error: string }>;
}

export function PlacesImportPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [assignToProject, setAssignToProject] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<Partial<Place>[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const createPlaceMutation = useMutation({
    mutationFn: (place: Partial<Place>) => createGlobalPlace(place),
  });

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      
      if (!data.places || !Array.isArray(data.places)) {
        showToast('error', 'JSON muss ein "places" Array enthalten');
        setFile(null);
        return;
      }

      if (data.places.length > 1000) {
        showToast('error', 'Maximal 1000 Places pro Import erlaubt');
        setFile(null);
        return;
      }

      setPreview(data.places.slice(0, 5));
      showToast('success', `${data.places.length} Places gefunden`);
    } catch (error) {
      showToast('error', 'Ungültige JSON-Datei');
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      handleFileChange(droppedFile);
    } else {
      showToast('error', 'Bitte nur JSON-Dateien hochladen');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const importResult: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      for (const placeData of data.places) {
        try {
          // Validierung
          if (!placeData.latitude || !placeData.longitude) {
            throw new Error('Latitude und Longitude sind erforderlich');
          }

          await createPlaceMutation.mutateAsync({
            ...placeData,
            projectId: assignToProject || null,
          });

          importResult.imported++;
        } catch (error: any) {
          importResult.skipped++;
          importResult.errors.push({
            place: placeData.title || 'Unbekannt',
            error: error.message || 'Unbekannter Fehler',
          });
        }
      }

      setResult(importResult);
      qc.invalidateQueries({ queryKey: ['all-places'] });
      
      if (importResult.imported > 0) {
        showToast('success', `${importResult.imported} Places erfolgreich importiert`);
      }
      
      if (importResult.errors.length > 0) {
        showToast('warning', `${importResult.skipped} Places übersprungen`);
      }
    } catch (error) {
      showToast('error', 'Fehler beim Import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="page places-import-page">
      <div className="import-header">
        <div>
          <h1>Places JSON Import</h1>
          <p className="import-subtitle">
            Importiere POI-Daten aus JSON-Dateien (z.B. Verona, Italien)
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/places')}>
          Zurück zur Übersicht
        </Button>
      </div>

      <Alert variant="info" title="JSON-Format">
        Die JSON-Datei muss ein <code>places</code> Array mit Objekten enthalten. 
        Jedes Objekt benötigt mindestens <code>latitude</code> und <code>longitude</code>.
      </Alert>

      <div className="import-grid">
        <Card variant="elevated" padding="lg">
          <CardHeader title="1. Datei auswählen" />
          <CardBody>
            <div
              className={`dropzone ${dragActive ? 'dropzone--active' : ''} ${file ? 'dropzone--has-file' : ''}`}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="dropzone-file">
                  <div className="dropzone-file-icon">📄</div>
                  <div className="dropzone-file-name">{file.name}</div>
                  <div className="dropzone-file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                    }}
                  >
                    Entfernen
                  </Button>
                </div>
              ) : (
                <>
                  <div className="dropzone-icon">📥</div>
                  <p className="dropzone-text">
                    Datei hier ablegen oder
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) handleFileChange(selectedFile);
                    }}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="file-input-label">
                    <Button variant="secondary">
                      Datei auswählen
                    </Button>
                  </label>
                  <p className="dropzone-hint">
                    Max. 5MB, max. 1000 Places
                  </p>
                </>
              )}
            </div>

            {preview.length > 0 && (
              <div className="preview-section">
                <h3>Vorschau (erste 5 Places)</h3>
                <div className="preview-list">
                  {preview.map((place, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="preview-item-title">
                        {place.title || 'Unbenannt'}
                      </div>
                      <div className="preview-item-meta">
                        {place.city && place.country && (
                          <span>📍 {place.city}, {place.country}</span>
                        )}
                        {place.type && <Badge variant="default" size="sm">{place.type}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader title="2. Optionen" />
          <CardBody>
            <div className="import-options">
              <label className="import-option-label">
                Projekt-Zuweisung (optional)
              </label>
              {projectsQuery.data && projectsQuery.data.length > 0 ? (
                <select
                  value={assignToProject}
                  onChange={(e) => setAssignToProject(e.target.value)}
                  className="import-select"
                >
                  <option value="">Kein Projekt (global)</option>
                  {projectsQuery.data.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="import-no-projects">
                  Keine Projekte vorhanden. Places werden global importiert.
                </p>
              )}

              <div className="import-actions">
                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                  loading={importing}
                  variant="primary"
                  size="lg"
                >
                  {importing ? 'Importiere...' : 'Import starten'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {result && (
        <Card variant="elevated" padding="lg">
          <CardHeader title="Import-Ergebnis" />
          <CardBody>
            <div className="import-result">
              <div className="import-result-stats">
                <div className="import-result-stat import-result-stat--success">
                  <div className="import-result-stat-value">{result.imported}</div>
                  <div className="import-result-stat-label">Erfolgreich</div>
                </div>
                <div className="import-result-stat import-result-stat--error">
                  <div className="import-result-stat-value">{result.skipped}</div>
                  <div className="import-result-stat-label">Übersprungen</div>
                </div>
              </div>

              {result.imported > 0 && (
                <ProgressBar
                  value={result.imported}
                  max={result.imported + result.skipped}
                  label={`${Math.round((result.imported / (result.imported + result.skipped)) * 100)}% erfolgreich`}
                />
              )}

              {result.errors.length > 0 && (
                <div className="import-errors">
                  <h4>Fehler</h4>
                  <div className="import-errors-list">
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <div key={idx} className="import-error-item">
                        <strong>{err.place}:</strong> {err.error}
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <div className="import-errors-more">
                        ... und {result.errors.length - 10} weitere Fehler
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="import-result-actions">
                <Button onClick={() => navigate('/places')} variant="primary">
                  Zu Places Browser
                </Button>
                <Button
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setResult(null);
                  }}
                  variant="ghost"
                >
                  Neuer Import
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card variant="elevated" padding="md">
        <CardHeader title="JSON-Format Beispiel" />
        <CardBody>
          <pre className="json-example">
{`{
  "source": "Verona POIs",
  "version": "1.0",
  "places": [
    {
      "title": "Arena di Verona",
      "description": "Römisches Amphitheater",
      "type": "ARCHAEOLOGICAL_SITE",
      "latitude": 45.4384,
      "longitude": 10.9916,
      "city": "Verona",
      "country": "Italy",
      "tags": ["roman", "amphitheater"]
    }
  ]
}`}
          </pre>
        </CardBody>
      </Card>
    </div>
  );
}
