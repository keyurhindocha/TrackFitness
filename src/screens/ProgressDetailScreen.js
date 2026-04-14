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
import { Ionicons } from '@expo/vector-icons';
import { getWorkouts } from '../storage/storage';
import { formatDateShort, formatDate } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';
import { useUnit } from '../context/UnitContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProgressDetailScreen({ route }) {
  const { unit } = useUnit();
  const { exerciseName } = route.params;
  const [dataPoints, setDataPoints] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then((workouts) => {
        const points = workouts
          .filter((w) => w.exercises.some((ex) => ex.name === exerciseName))
          .map((w) => {
            const ex = w.exercises.find((e) => e.name === exerciseName);
            const maxWeight = Math.max(...ex.sets.map((s) => parseFloat(s.weight) || 0));
            const totalVol = ex.sets.reduce(
              (sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0),
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
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="barbell-outline" size={36} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptySubText}>Log {exerciseName} to see your progress</Text>
      </View>
    );
  }

  const last = dataPoints[dataPoints.length - 1];
  const prev = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : null;
  const delta = prev ? last.maxWeight - prev.maxWeight : 0;
  const deltaPositive = delta > 0;
  const deltaNeutral = delta === 0;

  const chartLabels = dataPoints.map((d) => formatDateShort(d.date));
  const chartData = dataPoints.map((d) => d.maxWeight || 0);

  const thinLabels = chartLabels.length > 6
    ? chartLabels.map((l, i) => (i % Math.ceil(chartLabels.length / 6) === 0 ? l : ''))
    : chartLabels;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Stat cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.highlight} style={styles.statIcon} />
          <Text style={styles.statValue}>{last.maxWeight} {unit}</Text>
          <Text style={styles.statLabel}>Best Weight</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name={deltaPositive ? 'arrow-up-circle-outline' : deltaNeutral ? 'remove-circle-outline' : 'arrow-down-circle-outline'}
            size={18}
            color={deltaPositive ? COLORS.success : deltaNeutral ? COLORS.textMuted : COLORS.danger}
            style={styles.statIcon}
          />
          <Text style={[
            styles.statValue,
            { color: deltaPositive ? COLORS.success : deltaNeutral ? COLORS.textSecondary : COLORS.danger },
          ]}>
            {delta >= 0 ? '+' : ''}{delta} {unit}
          </Text>
          <Text style={styles.statLabel}>vs Last Session</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="layers-outline" size={18} color={COLORS.secondary} style={styles.statIcon} />
          <Text style={styles.statValue}>{dataPoints.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      {/* Chart */}
      {chartData.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Max Weight ({unit})</Text>
          <LineChart
            data={{
              labels: thinLabels,
              datasets: [{ data: chartData }],
            }}
            width={SCREEN_WIDTH - 32 - 28}
            height={180}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              labelColor: () => COLORS.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
              propsForBackgroundLines: { stroke: COLORS.border, strokeDasharray: '4,4' },
              fillShadowGradientFrom: COLORS.primary,
              fillShadowGradientTo: 'transparent',
              fillShadowGradientOpacity: 0.15,
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
            withShadow
          />
        </View>
      )}

      {/* History */}
      <Text style={styles.sectionTitle}>History</Text>
      {[...dataPoints].reverse().map((dp, i) => (
        <View key={i} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>{formatDate(dp.date)}</Text>
            <View style={styles.historyBest}>
              <Ionicons name="trophy-outline" size={12} color={COLORS.highlight} />
              <Text style={styles.historyBestText}>{dp.maxWeight} {unit} best</Text>
            </View>
          </View>
          <View style={styles.setsList}>
            {dp.sets.map((s, si) => (
              <View key={si} style={styles.setItem}>
                <View style={styles.setNumWrap}>
                  <Text style={styles.setNum}>{si + 1}</Text>
                </View>
                <Text style={styles.setDetail}>
                  {s.weight} {unit} × {s.reps} reps
                </Text>
                {parseFloat(s.weight) === dp.maxWeight && dp.maxWeight > 0 && (
                  <Ionicons name="star" size={11} color={COLORS.highlight} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 32 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },

  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    ...SHADOWS.soft,
  },
  statIcon: { marginBottom: 2 },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  chartTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  chart: { borderRadius: 8, marginLeft: -14 },

  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.soft,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  historyBest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyBestText: { color: COLORS.highlight, fontSize: 12, fontWeight: '600' },

  setsList: { gap: 6 },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNum: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  setDetail: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
});
