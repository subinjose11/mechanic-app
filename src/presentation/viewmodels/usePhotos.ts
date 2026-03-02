import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { Photo, CreatePhotoInput, UpdatePhotoInput } from '@domain/entities/Photo';
import { PhotoType } from '@core/constants';
import { orderKeys } from './useOrders';

const photoRepository = container.photoRepository;

// Query keys
export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  details: () => [...photoKeys.all, 'detail'] as const,
  detail: (id: string) => [...photoKeys.details(), id] as const,
  byOrder: (orderId: string) => [...photoKeys.all, 'order', orderId] as const,
  byOrderAndType: (orderId: string, type: PhotoType) =>
    [...photoKeys.all, 'order', orderId, 'type', type] as const,
};

// Fetch all photos
export function usePhotos() {
  return useQuery({
    queryKey: photoKeys.lists(),
    queryFn: () => photoRepository.getAll(),
  });
}

// Fetch a single photo
export function usePhoto(id: string) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => photoRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch photos by service order
export function usePhotosByOrder(orderId: string) {
  return useQuery({
    queryKey: photoKeys.byOrder(orderId),
    queryFn: () => photoRepository.getByServiceOrderId(orderId),
    enabled: !!orderId,
  });
}

// Fetch photos by service order and type
export function usePhotosByOrderAndType(orderId: string, type: PhotoType) {
  return useQuery({
    queryKey: photoKeys.byOrderAndType(orderId, type),
    queryFn: () => photoRepository.getByServiceOrderIdAndType(orderId, type),
    enabled: !!orderId && !!type,
  });
}

// Upload photo (capture and save)
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceOrderId,
      imageUri,
      type,
      description,
    }: {
      serviceOrderId: string;
      imageUri: string;
      type: PhotoType;
      description?: string;
    }) => photoRepository.uploadPhoto(serviceOrderId, imageUri, type, description),
    onSuccess: (newPhoto) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({
        queryKey: photoKeys.byOrder(newPhoto.serviceOrderId),
      });
      // Also invalidate order details since photos are included
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(newPhoto.serviceOrderId),
      });
    },
  });
}

// Create photo (when URL is already available)
export function useCreatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhotoInput) => photoRepository.create(data),
    onSuccess: (newPhoto) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({
        queryKey: photoKeys.byOrder(newPhoto.serviceOrderId),
      });
      // Also invalidate order details
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(newPhoto.serviceOrderId),
      });
    },
  });
}

// Update photo
export function useUpdatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhotoInput }) =>
      photoRepository.update(id, data),
    onSuccess: (updatedPhoto) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.setQueryData(photoKeys.detail(updatedPhoto.id), updatedPhoto);
    },
  });
}

// Delete photo (including from storage)
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) =>
      photoRepository.deleteWithStorage(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      // Also invalidate order details
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(variables.orderId),
      });
    },
  });
}
