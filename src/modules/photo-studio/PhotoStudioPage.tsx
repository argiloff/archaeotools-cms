import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import './photoStudio.css';

export function PhotoStudioPage() {
  const navigate = useNavigate();
  const { photoId } = useParams<{ photoId?: string }>();

  const studioTitle = useMemo(
    () => (photoId ? `Photo Studio – ${photoId.slice(0, 8)}…` : 'Photo Studio – Vorschau'),
    [photoId],
  );

  return (
    <div className="page photo-studio-page">
      <div className="studio-header">
        <div>
          <p className="eyebrow">Spatial Media · Editing Suite</p>
          <h1>{studioTitle}</h1>
          <p>
            Bearbeite Fotos non-destruktiv, verwalte Versionen, Tags und Annotationen direkt im CMS. Diese
            Ansicht ist der Startpunkt für das kommende Toast-UI-Editor-Setup.
          </p>
        </div>
        <div className="studio-header__actions">
          <button className="ghost-btn" onClick={() => navigate(-1)}>
            Zurück
          </button>
          <button className="btn" disabled>
            Speichern (bald)
          </button>
        </div>
      </div>

      <div className="studio-layout">
        <section className="studio-panel studio-canvas">
          <div className="panel-header">
            <div>
              <h2>Editor Canvas</h2>
              <p>Toast UI Image Editor wird hier eingebettet.</p>
            </div>
            <div className="panel-actions">
              <button className="ghost-link-btn" disabled>
                Reset
              </button>
              <button className="ghost-link-btn" disabled>
                Original anzeigen
              </button>
            </div>
          </div>
          <div className="canvas-placeholder">
            <span>Canvas Placeholder</span>
            <small>Importiere später Editor + Annotation Layer</small>
          </div>
        </section>

        <aside className="studio-panel studio-metadata">
          <div className="panel-header">
            <h3>Metadaten</h3>
          </div>
          <dl className="metadata-list">
            <div>
              <dt>Projekt</dt>
              <dd>–</dd>
            </div>
            <div>
              <dt>Place</dt>
              <dd>–</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd className="metadata-tags">
                <span className="tag">archiv</span>
                <span className="tag">idee</span>
              </dd>
            </div>
            <div>
              <dt>Notizen</dt>
              <dd className="metadata-notes">
                Freitext / Rich Notes erscheinen hier. Später editierbar mit Autosave.
              </dd>
            </div>
            <div>
              <dt>EXIF</dt>
              <dd className="metadata-exif">
                <span>Lens: –</span>
                <span>ISO: –</span>
                <span>Shutter: –</span>
              </dd>
            </div>
          </dl>
        </aside>

        <aside className="studio-panel studio-versions">
          <div className="panel-header">
            <h3>Versionen</h3>
            <button className="ghost-link-btn" disabled>
              Neue Version
            </button>
          </div>
          <ul className="versions-list">
            {['Original', 'Entwurf A', 'Entwurf B'].map((label, idx) => (
              <li key={label} className={idx === 0 ? 'active' : ''}>
                <div>
                  <strong>{label}</strong>
                  <p>Noch kein Upload – diese Liste dient als Vorschau.</p>
                </div>
                <button className="ghost-link-btn" disabled>
                  Aktivieren
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
