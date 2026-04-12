import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getWorkouts, deleteWorkout } from '../storage/storage';
import { formatDate } from '../utils/helpers';
import { COLORS } from '../utils/theme';

export default function WorkoutsScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setWorkouts);
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(id);
          setWorkouts((prev) => prev.filter((w) => w.id !== id));
        },
      },
    ]);
  };

  const renderWorkout = ({ item }) => {
    const isExpanded = expanded === item.id;
    const totalSets = item.exercises.reduce((n, ex) => n + ex.sets.length, 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.subText}>
              {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''} · {totalSets} sets
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textSecondary}
              style={{ marginLeft: 14 }}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.exerciseList}>
            {item.exercises.map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.setsText}>
                  {ex.sets.map((s, si) => `${s.weight}kg × ${s.reps}`).join('  ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubText}>Tap the button below to start</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('LogWorkout')}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.startBtnText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  subText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  exerciseList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  exerciseRow: { gap: 2 },
  exerciseName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  setsText: { color: COLORS.textSecondary, fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 17, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 14 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
