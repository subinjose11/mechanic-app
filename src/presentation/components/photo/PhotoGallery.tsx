import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal as RNModal,
} from 'react-native';
import { Text, Icon, IconButton, Chip } from 'react-native-paper';
import { colors } from '@theme/colors';
import { Photo } from '@domain/entities/Photo';
import { PhotoType, PHOTO_TYPE_LABELS } from '@core/constants';
import { formatDateTime } from '@core/utils/formatDate';
import { EmptyState } from '../common';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 48 - 16) / 3; // 3 columns with gaps

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoPress?: (photo: Photo) => void;
  onDeletePhoto?: (photo: Photo) => void;
  showTypeFilter?: boolean;
  emptyMessage?: string;
}

export function PhotoGallery({
  photos,
  onPhotoPress,
  onDeletePhoto,
  showTypeFilter = true,
  emptyMessage = 'No photos yet',
}: PhotoGalleryProps) {
  const [selectedType, setSelectedType] = useState<PhotoType | 'all'>('all');
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

  const filteredPhotos = selectedType === 'all'
    ? photos
    : photos.filter((p) => p.photoType === selectedType);

  const handlePhotoPress = (photo: Photo) => {
    if (onPhotoPress) {
      onPhotoPress(photo);
    } else {
      setViewerPhoto(photo);
    }
  };

  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.photoUrl }} style={styles.photo} />
      <View style={[styles.typeBadge, getTypeBadgeStyle(item.photoType)]}>
        <Text style={styles.typeBadgeText}>{PHOTO_TYPE_LABELS[item.photoType]}</Text>
      </View>
    </TouchableOpacity>
  );

  const getTypeBadgeStyle = (type: PhotoType) => {
    switch (type) {
      case 'before':
        return { backgroundColor: colors.info };
      case 'after':
        return { backgroundColor: colors.success };
      case 'damage':
        return { backgroundColor: colors.error };
    }
  };

  const getTypeCount = (type: PhotoType) => {
    return photos.filter((p) => p.photoType === type).length;
  };

  return (
    <View style={styles.container}>
      {showTypeFilter && photos.length > 0 && (
        <View style={styles.filterContainer}>
          <Chip
            selected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
            style={styles.filterChip}
          >
            All ({photos.length})
          </Chip>
          {(['before', 'after', 'damage'] as PhotoType[]).map((type) => {
            const count = getTypeCount(type);
            if (count === 0) return null;
            return (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(type)}
                style={styles.filterChip}
              >
                {PHOTO_TYPE_LABELS[type]} ({count})
              </Chip>
            );
          })}
        </View>
      )}

      {filteredPhotos.length > 0 ? (
        <FlatList
          data={filteredPhotos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="image-off"
          title={emptyMessage}
          style={styles.emptyState}
        />
      )}

      {/* Full-screen Photo Viewer */}
      <RNModal
        visible={!!viewerPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerPhoto(null)}
      >
        <View style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <View>
              <Text style={styles.viewerType}>
                {viewerPhoto && PHOTO_TYPE_LABELS[viewerPhoto.photoType]}
              </Text>
              <Text style={styles.viewerDate}>
                {viewerPhoto && formatDateTime(viewerPhoto.capturedAt)}
              </Text>
            </View>
            <View style={styles.viewerActions}>
              {onDeletePhoto && viewerPhoto && (
                <IconButton
                  icon="delete"
                  iconColor={colors.error}
                  onPress={() => {
                    onDeletePhoto(viewerPhoto);
                    setViewerPhoto(null);
                  }}
                />
              )}
              <IconButton
                icon="close"
                iconColor={colors.textOnPrimary}
                onPress={() => setViewerPhoto(null)}
              />
            </View>
          </View>

          {viewerPhoto && (
            <Image
              source={{ uri: viewerPhoto.photoUrl }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          )}

          {viewerPhoto?.description && (
            <View style={styles.viewerDescription}>
              <Text style={styles.viewerDescriptionText}>{viewerPhoto.description}</Text>
            </View>
          )}
        </View>
      </RNModal>
    </View>
  );
}

interface PhotoGridProps {
  photos: Photo[];
  maxPhotos?: number;
  onViewAll?: () => void;
  onPhotoPress?: (photo: Photo) => void;
}

export function PhotoGrid({ photos, maxPhotos = 6, onViewAll, onPhotoPress }: PhotoGridProps) {
  const displayPhotos = photos.slice(0, maxPhotos);
  const remainingCount = photos.length - maxPhotos;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridRow}>
        {displayPhotos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.gridItem}
            onPress={() => onPhotoPress?.(photo)}
          >
            <Image source={{ uri: photo.photoUrl }} style={styles.gridImage} />
            {index === maxPhotos - 1 && remainingCount > 0 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{remainingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {onViewAll && photos.length > 0 && (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all photos ({photos.length})</Text>
          <Icon source="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  photoContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textOnPrimary,
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 40,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  viewerType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  viewerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  viewerActions: {
    flexDirection: 'row',
  },
  viewerImage: {
    flex: 1,
    width: '100%',
  },
  viewerDescription: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerDescriptionText: {
    color: colors.textOnPrimary,
    fontSize: 14,
  },
  gridContainer: {
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PhotoGallery;
