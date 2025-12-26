import { useNavigate, useParams } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TuiImageEditor, type ImageEditorHandle } from '../../components/editor/ImageEditor';
import { getPhoto, resolvePhotoUrl, createUploadUrl, updatePhoto } from '../../api/photos.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import { useToast } from '../../components/ui';
import './photoStudio.css';

export function PhotoStudioPage() {
  const navigate = useNavigate();
  const { photoId } = useParams<{ photoId?: string }>();
  const { projectId } = useCurrentProject();
  const { showToast } = useToast();
  const editorRef = useRef<ImageEditorHandle>(null);
  const [saving, setSaving] = useState(false);

  const photoQuery = useQuery({
    queryKey: ['photo', projectId, photoId],
    queryFn: () => getPhoto(projectId!, photoId!),
    enabled: !!projectId && !!photoId,
  });

  const photo = photoQuery.data;
  const photoUrl = photo ? resolvePhotoUrl(photo) : undefined;

  const handleSave = useCallback(async () => {
    if (!editorRef.current || !projectId || !photoId) return;
    const dataUrl = editorRef.current.getImageData();
    if (!dataUrl) {
      showToast('error', 'Kein Bild zum Speichern');
      return;
    }

    setSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `edited-${Date.now()}.png`, { type: 'image/png' });

      const presigned = await createUploadUrl(projectId, {
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
      });

      await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await updatePhoto(projectId, photoId, {
        url: presigned.fileUrl ?? presigned.key,
        storageKey: presigned.key,
      });

      showToast('success', 'Bild gespeichert');
      photoQuery.refetch();
    } catch (err: any) {
      showToast('error', err?.message || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }, [projectId, photoId, showToast, photoQuery]);

  const handleReset = useCallback(() => {
    editorRef.current?.resetEditor();
    showToast('info', 'Editor zurückgesetzt');
  }, [showToast]);

  const studioTitle = photoId
    ? `Photo Studio – ${photo?.description || photoId.slice(0, 8)}…`
    : 'Photo Studio';

  return (
    <div className="page photo-studio-page">
      <div className="studio-header">
        <div>
          <p className="eyebrow">Spatial Media · Editing Suite</p>
          <h1>{studioTitle}</h1>
          <p>Bearbeite Fotos non-destruktiv mit Crop, Filter, Text und mehr.</p>
        </div>
        <div className="studio-header__actions">
          <button className="ghost-btn" onClick={() => navigate(-1)}>
            Zurück
          </button>
          <button className="btn" onClick={handleSave} disabled={saving || !photo}>
            {saving ? 'Speichere…' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="studio-layout">
        <section className="studio-panel studio-canvas">
          <div className="panel-header">
            <div>
              <h2>Editor</h2>
              <p>{photoQuery.isLoading ? 'Lade Bild…' : photo?.description || 'Foto bearbeiten'}</p>
            </div>
            <div className="panel-actions">
              <button className="ghost-link-btn" onClick={handleReset} disabled={!photo}>
                Reset
              </button>
            </div>
          </div>
          <div className="editor-wrapper">
            {photoUrl ? (
              <TuiImageEditor ref={editorRef} imageUrl={photoUrl} />
            ) : (
              <div className="canvas-placeholder">
                {photoQuery.isLoading ? (
                  <span>Lade…</span>
                ) : photoQuery.isError ? (
                  <span>Fehler beim Laden</span>
                ) : (
                  <span>Kein Foto ausgewählt</span>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="studio-panel studio-metadata">
          <div className="panel-header">
            <h3>Metadaten</h3>
          </div>
          <dl className="metadata-list">
            <div>
              <dt>Beschreibung</dt>
              <dd>{photo?.description || '–'}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd className="metadata-tags">
                {(photo?.tags ?? []).length > 0 ? (
                  photo!.tags!.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))
                ) : (
                  <span>–</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Notizen</dt>
              <dd className="metadata-notes">{photo?.notes || '–'}</dd>
            </div>
            <div>
              <dt>Erstellt</dt>
              <dd>{photo?.createdAt ? new Date(photo.createdAt).toLocaleString() : '–'}</dd>
            </div>
          </dl>
        </aside>

        <aside className="studio-panel studio-versions">
          <div className="panel-header">
            <h3>Versionen</h3>
          </div>
          <ul className="versions-list">
            <li className="active">
              <div>
                <strong>Aktuell</strong>
                <p>{photo?.updatedAt ? new Date(photo.updatedAt).toLocaleString() : 'Original'}</p>
              </div>
            </li>
          </ul>
          <p className="versions-hint">Versionsverlauf kommt in Phase 2.</p>
        </aside>
      </div>
    </div>
  );
}
