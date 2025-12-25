import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { createPlace } from '../../api/places.service';
import { uploadPhoto } from '../../api/photos.service';
import { projectStore } from '../../state/project.store';
import { createProject, deleteProject, listProjects } from '../../api/projects.service';

type Props = {
  open: boolean;
  onClose: () => void;
};

type DemoPlace = {
  title: string;
  type: 'SITE' | 'MUSEUM' | 'POI';
  description?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  address?: string;
  city?: string;
  country?: string;
  visited?: boolean;
  photos?: { description?: string; imageUrl: string }[];
};

export function ImportDatasetModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('Bereit');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const store = projectStore();

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const PLACE_DELAY = 150;
  const PHOTO_DELAY = 250;

  const runWithRetry = async <T,>(fn: () => Promise<T>, label: string): Promise<T> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const statusCode = err?.response?.status;
        if (statusCode === 429 && attempt < 2) {
          const waitMs = 2000 * (attempt + 1);
          setStatus(`${label}: Rate limit, retry in ${waitMs / 1000}s`);
          await sleep(waitMs);
          continue;
        }
        throw err;
      }
    }
    throw new Error(`Konnte ${label} nach Retries nicht ausführen`);
  };

  const runImport = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    setStatus('Lade Demo-Dataset …');
    try {
      const res = await fetch('/demo/places-eu.json');
      if (!res.ok) throw new Error('Demo JSON nicht gefunden (public/demo/places-eu.json)');
      const json = (await res.json()) as { places: DemoPlace[] };
      if (!Array.isArray(json.places)) throw new Error('Ungültiges Dataset-Format. Erwartet { places: [...] }');

      setStatus('Lösche vorhandene Projekte …');
      const existing = await listProjects();
      for (const proj of existing) {
        await runWithRetry(() => deleteProject(proj.id), `Projekt löschen ${proj.name}`);
        await sleep(200);
      }

      setStatus('Erstelle neues Demo-Projekt …');
      const newProject = await runWithRetry(
        () =>
          createProject({
            name: 'Demo Dataset',
            type: 'ARCHAEOLOGY',
            visibility: 'PRIVATE',
          }),
        'Demo Projekt',
      );
      store.setProjects([newProject]);
      store.setCurrentProject(newProject.id);

      const totalPlaces = json.places.length;
      let placeCounter = 0;
      let photoCounter = 0;
      for (const place of json.places) {
        setStatus(`Erstelle Place ${place.title} (${placeCounter + 1}/${totalPlaces})`);
        const newPlace = await runWithRetry(
          () =>
            createPlace(newProject.id, {
              title: place.title,
              type: place.type,
              description: place.description,
              latitude: place.latitude,
              longitude: place.longitude,
              radiusMeters: place.radiusMeters,
              address: place.address,
              city: place.city,
              country: place.country,
              visited: place.visited,
            }),
          `Place ${place.title}`,
        );
        placeCounter += 1;
        await sleep(PLACE_DELAY);

        for (const photo of place.photos ?? []) {
          try {
            setStatus(`Lade Foto ${photo.description ?? ''}`.trim());
            const resp = await fetch(photo.imageUrl);
            if (!resp.ok) continue;
            const blob = await resp.blob();
            const file = new File([blob], `${newPlace.id}-${Date.now()}.jpg`, {
              type: blob.type || 'image/jpeg',
            });
            await runWithRetry(
              () =>
                uploadPhoto(newProject.id, {
                  file,
                  description: photo.description,
                  placeId: newPlace.id,
                }),
              `Foto ${photo.description ?? ''}`,
            );
            photoCounter += 1;
            await sleep(PHOTO_DELAY);
          } catch (photoErr) {
            console.warn('Foto import übersprungen', photoErr);
          }
        }
      }

      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['places', newProject.id] });
      qc.invalidateQueries({ queryKey: ['photos', newProject.id] });
      setStatus(`Import abgeschlossen (${placeCounter} Places, ${photoCounter} Fotos). Neues Projekt: ${newProject.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import fehlgeschlagen');
      setStatus('Fehler');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Modal title="Dataset Import" open={open} onClose={() => (!isRunning ? onClose() : null)}>
      <p>
        Importiert das Demo-Dataset <code>public/demo/places-eu.json</code> (≈200 Places europaweit mit Beispiel-Fotos).
        Der Import löscht alle existierenden Projekte, erstellt ein neues Demo-Projekt und füllt es mit den Places.
      </p>
      <button className="btn" onClick={runImport} disabled={isRunning}>
        {isRunning ? 'Import läuft …' : 'Demo-Dataset importieren'}
      </button>
      <div style={{ fontSize: 13, color: '#8fa0bf' }}>Status: {status}</div>
      {error && <div style={{ color: '#f78c6c', fontSize: 13 }}>{error}</div>}
    </Modal>
  );
}
