import { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Icon, IconButton, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button } from '@presentation/components/common';
import { usePhotosByOrder, useUploadPhoto, useDeletePhoto } from '@presentation/viewmodels/usePhotos';
import { colors } from '@theme/colors';
import { PhotoType, PHOTO_TYPE_LABELS } from '@core/constants';
import { Photo } from '@domain/entities/Photo';

export default function PhotosScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState<PhotoType>('before');
  const [uploading, setUploading] = useState(false);

  const { data: photos, isLoading } = usePhotosByOrder(orderId || '');
  const uploadPhotoMutation = useUploadPhoto();
  const deletePhotoMutation = useDeletePhoto();

  const filteredPhotos = (photos || []).filter((p) => p.photoType === selectedType);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
        });
      }

      if (!result.canceled && result.assets[0] && orderId) {
        setUploading(true);
        try {
          await uploadPhotoMutation.mutateAsync({
            serviceOrderId: orderId,
            imageUri: result.assets[0].uri,
            type: selectedType,
          });
        } catch (err) {
          console.error('Failed to upload photo:', err);
          Alert.alert('Upload Failed', 'Could not upload the photo. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhotoMutation.mutateAsync({ id: photo.id, orderId: photo.serviceOrderId });
            } catch (err) {
              console.error('Failed to delete photo:', err);
              Alert.alert('Error', 'Could not delete the photo.');
            }
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Photo Type Selector */}
      <View style={styles.typeSelector}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={(v) => setSelectedType(v as PhotoType)}
          buttons={[
            { value: 'before', label: 'Before' },
            { value: 'after', label: 'After' },
            { value: 'damage', label: 'Damage' },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredPhotos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon source="camera-off" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>
              No {PHOTO_TYPE_LABELS[selectedType].toLowerCase()} photos yet
            </Text>
            <Text style={styles.emptySubtext}>
              Tap the button below to add photos
            </Text>
          </Card>
        ) : (
          <View style={styles.photosGrid}>
            {filteredPhotos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                <Image
                  source={{ uri: photo.photoUrl }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(photo)}
                >
                  <Icon source="close" size={16} color={colors.textOnPrimary} />
                </TouchableOpacity>
                {photo.description && (
                  <Text style={styles.photoDescription} numberOfLines={2}>
                    {photo.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Card style={styles.uploadingCard}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading photo...</Text>
          </Card>
        )}
      </ScrollView>

      {/* Add Photo Button */}
      <View style={styles.footer}>
        <Button
          onPress={() => router.back()}
          mode="outlined"
          style={styles.footerButton}
        >
          Done
        </Button>
        <Button
          onPress={showImageOptions}
          icon="camera"
          loading={uploading}
          disabled={uploading}
          style={styles.footerButton}
        >
          Add Photo
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  typeSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textDisabled,
    marginTop: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  photoCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  photoImage: {
    width: '100%',
    height: 150,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    padding: 8,
  },
  uploadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 16,
  },
  uploadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
