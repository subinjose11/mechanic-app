import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';
import { colors } from '@theme/colors';

interface EditableOdometerProps {
  kmReading: number | null;
  onSave: (value: number) => void;
}

export function EditableOdometer({ kmReading, onSave }: EditableOdometerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(kmReading?.toString() || '');
  };

  const handleConfirm = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      onSave(parsed);
    }
    setIsEditing(false);
  };

  return (
    <GlassCard>
      <View style={styles.row}>
        <View style={styles.left}>
          <GlassIconBox
            emoji="🔢"
            tintColor="rgba(34,211,238,0.12)"
            borderColor="rgba(34,211,238,0.15)"
          />
          <Text style={styles.label}>Odometer Reading</Text>
        </View>

        <View style={styles.right}>
          {isEditing ? (
            <>
              <View style={styles.displayBox}>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="numeric"
                  autoFocus
                  onBlur={handleConfirm}
                  placeholderTextColor="rgba(148,163,184,0.5)"
                />
              </View>
              <Pressable style={styles.editButton} onPress={handleConfirm}>
                <Text style={styles.editEmoji}>✓</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.displayBox}>
                <Text style={styles.value}>
                  {kmReading != null ? kmReading.toLocaleString() : 'Not recorded'}
                </Text>
                {kmReading != null && (
                  <Text style={styles.suffix}>km</Text>
                )}
              </View>
              <Pressable style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editEmoji}>✏️</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.9)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  suffix: {
    fontSize: 11,
    color: 'rgba(148,163,184,0.6)',
    marginLeft: 4,
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    minWidth: 60,
    padding: 0,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editEmoji: {
    fontSize: 14,
  },
});
