import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { getWorkouts } from '../storage/storage';
import { getTodayString, formatDate } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS, CALENDAR_THEME } from '../utils/theme';

export default function CalendarScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then((data) => {
        setWorkouts(data);
        const marks = {};
        data.forEach((w) => {
          marks[w.date] = {
            marked: true,
            dotColor: COLORS.primary,
          };
        });
        setMarkedDates(marks);

        const todayWorkout = data.find((w) => w.date === getTodayString());
        setSelectedWorkout(todayWorkout || null);
      });
    }, [])
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const workout = workouts.find((w) => w.date === day.dateString);
    setSelectedWorkout(workout || null);
  };

  const markedWithSelected = {
    ...markedDates,
    [selectedDate]: {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.primary,
    },
  };

  const totalSets = selectedWorkout
    ? selectedWorkout.exercises.reduce((n, ex) => n + ex.sets.length, 0)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.calendarShell}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedWithSelected}
          theme={CALENDAR_THEME}
          style={styles.calendar}
        />
      </View>

      <View style={styles.detail}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailDate}>{formatDate(selectedDate)}</Text>
          {selectedWorkout && (
            <View style={styles.detailBadge}>
              <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
              <Text style={styles.detailBadgeText}>Workout logged</Text>
            </View>
          )}
        </View>

        {selectedWorkout ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Ionicons name="layers-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.summaryPillText}>
                  {selectedWorkout.exercises.length} exercise{selectedWorkout.exercises.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryPill}>
                <Ionicons name="repeat-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.summaryPillText}>{totalSets} sets</Text>
              </View>
            </View>

            {selectedWorkout.exercises.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={styles.exerciseCard}
                activeOpacity={0.72}
                onPress={() =>
                  navigation.navigate('Progress', {
                    screen: 'ProgressDetail',
                    params: { exerciseName: ex.name },
                  })
                }
              >
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.setsText}>
                      {ex.sets.map((s) => `${s.weight} × ${s.reps}`).join('  ·  ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.noWorkoutState}>
            <Ionicons name="bed-outline" size={24} color={COLORS.textMuted} />
            <Text style={styles.noWorkout}>Rest day — no workout logged</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 32 },

  calendarShell: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 14,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  detail: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.soft,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDate: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailBadgeText: { color: COLORS.success, fontSize: 12, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryPillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },

  exerciseCard: {
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    opacity: 0.7,
  },
  exerciseName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  setsText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },

  noWorkoutState: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  noWorkout: { color: COLORS.textMuted, fontSize: 14 },
});
