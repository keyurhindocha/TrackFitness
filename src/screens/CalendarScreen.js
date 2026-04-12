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
import { COLORS } from '../utils/theme';

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

  const selected = {
    ...markedDates,
    [selectedDate]: {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.primary,
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={selected}
        theme={{
          backgroundColor: COLORS.background,
          calendarBackground: COLORS.surface,
          textSectionTitleColor: COLORS.textSecondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: '#fff',
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.textMuted,
          dotColor: COLORS.primary,
          selectedDotColor: '#fff',
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.text,
          indicatorColor: COLORS.primary,
        }}
        style={styles.calendar}
      />

      <View style={styles.detail}>
        <Text style={styles.detailDate}>{formatDate(selectedDate)}</Text>
        {selectedWorkout ? (
          <>
            <Text style={styles.detailSubtitle}>
              {selectedWorkout.exercises.length} exercise{selectedWorkout.exercises.length !== 1 ? 's' : ''}
            </Text>
            {selectedWorkout.exercises.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={styles.exerciseCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('Progress', {
                    screen: 'ProgressDetail',
                    params: { exerciseName: ex.name },
                  })
                }
              >
                <View style={styles.exerciseRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.setsText}>
                      {ex.sets.map((s) => `${s.weight}kg × ${s.reps}`).join('  ·  ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={styles.noWorkout}>No workout logged</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detail: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  detailDate: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  detailSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  exerciseCard: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  setsText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  noWorkout: { color: COLORS.textMuted, fontSize: 14 },
});
