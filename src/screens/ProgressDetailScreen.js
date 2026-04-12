import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { getWorkouts } from '../storage/storage';
import { formatDateShort } from '../utils/helpers';
import { COLORS } from '../utils/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProgressDetailScreen({ route }) {
  const { exerciseName } = route.params;
  const [dataPoints, setDataPoints] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then((workouts) => {
        const points = workouts
          .filter((w) => w.exercises.some((ex) => ex.name === exerciseName))
          .map((w) => {
            const ex = w.exercises.find((e) => e.name === exerciseName);
            const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0));
            const totalVol = ex.sets.reduce(
              (sum, s) => sum + (s.weight || 0) * (s.reps || 0),
              0
            );
            return { date: w.date, maxWeight, totalVol, sets: ex.sets };
          })
          .reverse();
        setDataPoints(points);
      });
    }, [exerciseName])
  );

  if (dataPoints.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No data for {exerciseName}</Text>
      </View>
    );
  }

  const last = dataPoints[dataPoints.length - 1];
  const prev = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : null;
  const delta = prev ? last.maxWeight - prev.maxWeight : 0;

  const chartLabels = dataPoints.map((d) => formatDateShort(d.date));
  const chartData = dataPoints.map((d) => d.maxWeight);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{last.maxWeight}kg</Text>
          <Text style={styles.statLabel}>Best Weight</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: delta >= 0 ? COLORS.success : COLORS.danger }]}>
            {delta >= 0 ? '+' : ''}{delta}kg
          </Text>
          <Text style={styles.statLabel}>vs Last Session</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dataPoints.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      {chartData.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Max Weight (kg)</Text>
          <LineChart
            data={{
              labels: chartLabels.length > 6
                ? chartLabels.map((l, i) => (i % Math.ceil(chartLabels.length / 6) === 0 ? l : ''))
                : chartLabels,
              datasets: [{ data: chartData }],
            }}
            width={SCREEN_WIDTH - 32}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 1,
              color: () => COLORS.primary,
              labelColor: () => COLORS.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
              propsForBackgroundLines: { stroke: COLORS.border },
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>History</Text>
      {[...dataPoints].reverse().map((dp, i) => (
        <View key={i} style={styles.historyCard}>
          <Text style={styles.historyDate}>{formatDateShort(dp.date)}</Text>
          <View style={styles.setsList}>
            {dp.sets.map((s, si) => (
              <Text key={si} style={styles.setItem}>
                Set {si + 1}: {s.weight}kg × {s.reps} reps
              </Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  noData: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chart: { borderRadius: 8, marginLeft: -10 },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  historyDate: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  setsList: { gap: 3 },
  setItem: { color: COLORS.textSecondary, fontSize: 13 },
});
