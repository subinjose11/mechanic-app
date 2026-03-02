import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Icon, IconButton, Modal, Portal, Chip } from 'react-native-paper';
import { colors } from '@theme/colors';
import { cameraService, ImagePickerResult } from '@services/camera/CameraService';
import { PhotoType, PHOTO_TYPE_LABELS } from '@core/constants';
import { Button } from '../common';

interface PhotoCaptureProps {
  onPhotoTaken: (uri: string, type: PhotoType) => void;
  onCancel?: () => void;
  defaultType?: PhotoType;
}

export function PhotoCapture({ onPhotoTaken, onCancel, defaultType = 'before' }: PhotoCaptureProps) {
  const [selectedType, setSelectedType] = useState<PhotoType>(defaultType);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      const result = await cameraService.takePhoto({ quality: 0.8 });
      if (result) {
        setPreviewUri(result.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setIsLoading(true);
      const result = await cameraService.pickSingleImage({ quality: 0.8 });
      if (result) {
        setPreviewUri(result.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (previewUri) {
      onPhotoTaken(previewUri, selectedType);
      setPreviewUri(null);
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
  };

  const handleCancel = () => {
    setPreviewUri(null);
    onCancel?.();
  };

  if (previewUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />

        <View style={styles.typeSelector}>
          <Text style={styles.typeSelectorLabel}>Photo Type:</Text>
          <View style={styles.typeChips}>
            {(['before', 'after', 'damage'] as PhotoType[]).map((type) => (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(type)}
                style={styles.typeChip}
                showSelectedCheck
              >
                {PHOTO_TYPE_LABELS[type]}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.previewActions}>
          <Button mode="outlined" onPress={handleRetake} style={styles.previewButton}>
            Retake
          </Button>
          <Button mode="contained" onPress={handleConfirm} style={styles.previewButton}>
            Use Photo
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={handleTakePhoto} disabled={isLoading}>
          <View style={styles.optionIcon}>
            <Icon source="camera" size={32} color={colors.primary} />
          </View>
          <Text style={styles.optionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handlePickImage} disabled={isLoading}>
          <View style={styles.optionIcon}>
            <Icon source="image" size={32} color={colors.secondary} />
          </View>
          <Text style={styles.optionText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {onCancel && (
        <Button mode="text" onPress={handleCancel} style={styles.cancelButton}>
          Cancel
        </Button>
      )}
    </View>
  );
}

interface PhotoCaptureModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPhotoTaken: (uri: string, type: PhotoType) => void;
  defaultType?: PhotoType;
}

export function PhotoCaptureModal({
  visible,
  onDismiss,
  onPhotoTaken,
  defaultType,
}: PhotoCaptureModalProps) {
  const handlePhotoTaken = (uri: string, type: PhotoType) => {
    onPhotoTaken(uri, type);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Photo</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <PhotoCapture
          onPhotoTaken={handlePhotoTaken}
          onCancel={onDismiss}
          defaultType={defaultType}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
  option: {
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 16,
  },
  previewContainer: {
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },
  typeSelector: {
    marginTop: 16,
  },
  typeSelectorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  typeChips: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    marginRight: 4,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  previewButton: {
    flex: 1,
  },
  modal: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default PhotoCapture;
