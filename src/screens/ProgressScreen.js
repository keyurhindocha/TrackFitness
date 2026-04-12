import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getWorkouts } from '../storage/storage';
import { COLORS } from '../utils/theme';

function Sparkline({ data, width = 80, height = 36 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const last = points.split(' ').pop().split(',');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={last[0]} cy={last[1]} r="3" fill={COLORS.primary} />
    </Svg>
  );
}

export default function ProgressScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then((workouts) => {
        const map = {};
        const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
        sorted.forEach((w) => {
          w.exercises.forEach((ex) => {
            if (!map[ex.name]) map[ex.name] = { sessions: 0, maxWeight: 0, weights: [] };
            map[ex.name].sessions += 1;
            const best =
              ex.sets.length > 0
                ? Math.max(...ex.sets.map((s) => parseFloat(s.weight) || 0))
                : 0;
            if (best > map[ex.name].maxWeight) map[ex.name].maxWeight = best;
            if (best > 0) map[ex.name].weights.push(best);
          });
        });
        const list = Object.entries(map)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.sessions - a.sessions);
        setExercises(list);
      });
    }, [])
  );

  const renderItem = ({ item }) => {
    const trend =
      item.weights.length > 1
        ? item.weights[item.weights.length - 1] - item.weights[item.weights.length - 2]
        : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProgressDetail', { exerciseName: item.name })}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.statsText}>
            {item.sessions} session{item.sessions !== 1 ? 's' : ''}
            {item.maxWeight > 0 ? ` · Best: ${item.maxWeight}kg` : ''}
          </Text>
          {item.weights.length > 1 && (
            <Text style={[styles.trendText, { color: trend >= 0 ? COLORS.success : COLORS.danger }]}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}kg vs last
            </Text>
          )}
        </View>
        <View style={styles.cardRight}>
          <Sparkline data={item.weights} />
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trending-up-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubText}>Log workouts to see progress</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: { gap: 4, flex: 1 },
  cardRight: { alignItems: 'center', gap: 2, marginLeft: 12 },
  exerciseName: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  statsText: { color: COLORS.textSecondary, fontSize: 13 },
  trendText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 17, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 14 },
});
