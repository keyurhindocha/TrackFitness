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
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';
import { useUnit } from '../context/UnitContext';

function Sparkline({ data, width = 80, height = 36 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
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
        opacity={0.7}
      />
      <Circle cx={last[0]} cy={last[1]} r="3.5" fill={COLORS.primary} />
    </Svg>
  );
}

export default function ProgressScreen({ navigation }) {
  const { unit } = useUnit();
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
    const trendUp = trend > 0;
    const trendDown = trend < 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProgressDetail', { exerciseName: item.name })}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="repeat-outline" size={11} color={COLORS.textMuted} />
              <Text style={styles.statPillText}>
                {item.sessions} session{item.sessions !== 1 ? 's' : ''}
              </Text>
            </View>
            {item.maxWeight > 0 && (
              <View style={styles.statPill}>
                <Ionicons name="trophy-outline" size={11} color={COLORS.highlight} />
                <Text style={[styles.statPillText, { color: COLORS.highlight }]}>
                  {item.maxWeight} {unit}
                </Text>
              </View>
            )}
          </View>
          {item.weights.length > 1 && (
            <View style={styles.trendRow}>
              <Ionicons
                name={trendUp ? 'arrow-up' : trendDown ? 'arrow-down' : 'remove'}
                size={12}
                color={trendUp ? COLORS.success : trendDown ? COLORS.danger : COLORS.textMuted}
              />
              <Text style={[
                styles.trendText,
                { color: trendUp ? COLORS.success : trendDown ? COLORS.danger : COLORS.textMuted },
              ]}>
                {Math.abs(trend)} {unit} vs last
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardRight}>
          <Sparkline data={item.weights} />
          <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} style={{ marginTop: 6 }} />
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="trending-up-outline" size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubText}>Log workouts to see your progress here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: LAYOUT.screenPadding, paddingBottom: 20 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  cardLeft: { gap: 6, flex: 1 },
  cardRight: { alignItems: 'center', gap: 4, marginLeft: 12 },

  exerciseName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 6 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statPillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },

  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: { fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  emptySubText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
