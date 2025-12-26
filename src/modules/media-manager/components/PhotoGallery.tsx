import { Card, CardBody, Badge, Button } from '../../../components/ui';
import type { Photo } from '../../../api/types';
import { resolvePhotoUrl } from '../../../api/photos.service';
import './PhotoGallery.css';

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onEditPhoto: (photo: Photo) => void;
  onDeletePhoto: (photoId: string) => void;
  visibleCount: number;
  onLoadMore: () => void;
}

export const PhotoGallery = ({
  photos,
  onPhotoClick,
  onEditPhoto,
  onDeletePhoto,
  visibleCount,
  onLoadMore,
}: PhotoGalleryProps) => {
  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = photos.length > visibleCount;

  return (
    <div className="photo-gallery">
      <div className="photo-gallery__grid">
        {visiblePhotos.map((photo) => (
          <Card
            key={photo.id}
            variant="elevated"
            padding="none"
            hover
            className="photo-card"
          >
            <div
              className="photo-card__image"
              onClick={() => onPhotoClick(photo)}
              style={{
                backgroundImage: `url(${resolvePhotoUrl(photo)})`,
              }}
            >
              {photo.tags && photo.tags.length > 0 && (
                <div className="photo-card__tags">
                  {photo.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {photo.tags.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{photo.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <CardBody>
              {photo.description && (
                <p className="photo-card__description">{photo.description}</p>
              )}
              {photo.capturedAt && (
                <div className="photo-card__date">
                  📅 {new Date(photo.capturedAt).toLocaleDateString('de-DE')}
                </div>
              )}
              {(photo.lat && photo.lng) && (
                <div className="photo-card__location">
                  📍 {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                </div>
              )}
              <div className="photo-card__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditPhoto(photo)}
                >
                  Bearbeiten
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm('Foto wirklich löschen?')) {
                      onDeletePhoto(photo.id);
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

      {hasMore && (
        <div className="photo-gallery__load-more">
          <Button onClick={onLoadMore} variant="secondary">
            Mehr laden ({photos.length - visibleCount} verbleibend)
          </Button>
        </div>
      )}
    </div>
  );
};
