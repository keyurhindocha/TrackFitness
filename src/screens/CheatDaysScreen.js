import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { getCheatDays, saveCheatDay, deleteCheatDay } from '../storage/storage';
import { generateId, getTodayString, formatDate } from '../utils/helpers';
import { COLORS } from '../utils/theme';

export default function CheatDaysScreen() {
  const [cheatDays, setCheatDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedCheatDay, setSelectedCheatDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData(getTodayString());
    }, [])
  );

  const loadData = async (dateOverride) => {
    const data = await getCheatDays();
    setCheatDays(data);
    const marks = {};
    data.forEach((d) => {
      marks[d.date] = { marked: true, dotColor: COLORS.danger };
    });
    setMarkedDates(marks);
    const targetDate = dateOverride || selectedDate;
    setSelectedCheatDay(data.find((d) => d.date === targetDate) || null);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const found = cheatDays.find((d) => d.date === day.dateString);
    setSelectedCheatDay(found || null);
  };

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const existing = cheatDays.find((d) => d.date === selectedDate);
    const updated = existing
      ? { ...existing, items: [...existing.items, trimmed] }
      : { id: generateId(), date: selectedDate, items: [trimmed] };

    await saveCheatDay(updated);
    setNewItem('');
    setShowModal(false);
    await loadData(selectedDate);
  };

  const handleDeleteItem = async (index) => {
    if (!selectedCheatDay) return;
    const newItems = selectedCheatDay.items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      await deleteCheatDay(selectedDate);
    } else {
      await saveCheatDay({ ...selectedCheatDay, items: newItems });
    }
    await loadData(selectedDate);
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
          dotColor: COLORS.danger,
          selectedDotColor: COLORS.danger,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.text,
        }}
        style={styles.calendar}
      />

      <View style={styles.detail}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={styles.detailDate}>{formatDate(selectedDate)}</Text>
            {selectedCheatDay && (
              <Text style={styles.detailSubtitle}>
                {selectedCheatDay.items.length} item{selectedCheatDay.items.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.logBtnText}>Log</Text>
          </TouchableOpacity>
        </View>

        {selectedCheatDay && selectedCheatDay.items.length > 0 ? (
          <View style={styles.itemsList}>
            {selectedCheatDay.items.map((item, i) => (
              <View key={i} style={styles.itemChip}>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(i)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close-circle" size={15} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noItems}>No cheat items logged</Text>
        )}
      </View>

      {cheatDays.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent</Text>
          {cheatDays.slice(0, 5).map((cd) => (
            <TouchableOpacity
              key={cd.id}
              style={styles.historyCard}
              onPress={() => {
                setSelectedDate(cd.date);
                setSelectedCheatDay(cd);
              }}
            >
              <Text style={styles.historyDate}>{formatDate(cd.date)}</Text>
              <Text style={styles.historyItems}>
                {cd.items.join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Log Cheat Item</Text>
              <Text style={styles.modalSubtitle}>{formatDate(selectedDate)}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. pizza, cookie, beer..."
                placeholderTextColor={COLORS.textMuted}
                value={newItem}
                onChangeText={setNewItem}
                autoFocus
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.modalAddBtn} onPressIn={handleAddItem}>
                <Text style={styles.modalAddBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  calendar: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  detail: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDate: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  detailSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemChip: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemText: { color: COLORS.danger, fontSize: 13, fontWeight: '500' },
  noItems: { color: COLORS.textMuted, fontSize: 14 },
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
    gap: 6,
  },
  historyDate: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  historyItems: { color: COLORS.textSecondary, fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  modalSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  modalInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
