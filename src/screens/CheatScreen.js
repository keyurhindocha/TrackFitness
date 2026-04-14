import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
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
import { generateId, getTodayString, formatDate, getMonthKey, getWeekStart } from '../utils/helpers';
import { COLORS, CALENDAR_THEME, LAYOUT, SHADOWS } from '../utils/theme';

const TAGS = [
  { key: 'cookie', label: 'Cookie', color: COLORS.highlight, icon: 'cafe-outline' },
  { key: 'cake', label: 'Cake', color: COLORS.danger, icon: 'gift-outline' },
  { key: 'chocolate', label: 'Chocolate', color: COLORS.success, icon: 'nutrition-outline' },
  { key: 'ice-cream', label: 'Ice Cream', color: COLORS.primary, icon: 'ice-cream-outline' },
];

const getTagInfo = (key) => TAGS.find((t) => t.key === key) || { label: key, color: COLORS.textMuted, icon: 'ellipse-outline' };

// Normalize items: legacy strings → objects
const normalizeItem = (item) =>
  typeof item === 'string' ? { text: item, tag: null } : item;

const isSameLabel = (text, label) =>
  text?.trim().toLowerCase() === label?.trim().toLowerCase();

export default function CheatScreen() {
  const scrollRef = useRef(null);
  const [cheatDays, setCheatDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedCheatDay, setSelectedCheatDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [weekView, setWeekView] = useState(false);
  const [detailCardY, setDetailCardY] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData(getTodayString());
    }, [])
  );

  const loadData = async (dateOverride) => {
    const data = await getCheatDays();
    setCheatDays(data);

    const marks = {};
    data.forEach((entry) => {
      marks[entry.date] = { marked: true, dotColor: COLORS.danger };
    });
    setMarkedDates(marks);

    const targetDate = dateOverride || selectedDate;
    setSelectedCheatDay(data.find((entry) => entry.date === targetDate) || null);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const found = cheatDays.find((entry) => entry.date === day.dateString);
    setSelectedCheatDay(found || null);
  };

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const newEntry = { text: trimmed, tag: selectedTag };
    const existing = cheatDays.find((entry) => entry.date === selectedDate);
    const existingItems = existing ? existing.items.map(normalizeItem) : [];
    const updated = existing
      ? { ...existing, items: [...existingItems, newEntry] }
      : { id: generateId(), date: selectedDate, items: [newEntry] };

    await saveCheatDay(updated);
    setNewItem('');
    setSelectedTag(null);
    setShowModal(false);
    await loadData(selectedDate);
  };

  const handleTagPress = (tag) => {
    const isDeselecting = selectedTag === tag.key;
    const tagLabel = tag.label;

    setSelectedTag(isDeselecting ? null : tag.key);
    setNewItem((current) => {
      const trimmed = current.trim();
      if (isDeselecting) {
        return trimmed === tagLabel ? '' : current;
      }
      return trimmed ? current : tagLabel;
    });
  };

  const handleDeleteItem = async (index) => {
    if (!selectedCheatDay) return;

    const items = selectedCheatDay.items.map(normalizeItem);
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      await deleteCheatDay(selectedDate);
    } else {
      await saveCheatDay({ ...selectedCheatDay, items: newItems });
    }
    await loadData(selectedDate);
  };

  const confirmDeleteItem = (index) => {
    const item = selectedCheatDay?.items?.map(normalizeItem)[index];
    const itemLabel = item?.text || 'this cheat';

    Alert.alert(
      'Delete cheat?',
      `Remove "${itemLabel}" from ${formatDate(selectedDate)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(index) },
      ]
    );
  };

  const focusEntry = (entry) => {
    setSelectedDate(entry.date);
    setSelectedCheatDay(entry);
    setWeekView(false);
    scrollRef.current?.scrollTo({
      y: Math.max(detailCardY - 16, 0),
      animated: true,
    });
  };

  const selected = {
    ...markedDates,
    [selectedDate]: {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.primaryStrong,
    },
  };

  const currentMonth = getMonthKey(selectedDate);
  const monthCount = cheatDays.filter((e) => getMonthKey(e.date) === currentMonth).length;

  // Weekly patterns: last 7 days
  const today = getTodayString();
  const weekStart = getWeekStart(today);
  const thisWeekEntries = cheatDays.filter((e) => e.date >= weekStart && e.date <= today);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = cheatDays.find((e) => e.date === dateStr);
    return { dateStr, entry };
  });

  // Tag breakdown for the month
  const monthEntries = cheatDays.filter((e) => getMonthKey(e.date) === currentMonth);
  const tagCounts = {};
  monthEntries.forEach((e) => {
    e.items.map(normalizeItem).forEach((item) => {
      const tag = item.tag || 'untagged';
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Cheat Log</Text>
        <Text style={styles.heroTitle}>Log every cheat, stay accountable.</Text>
        <Text style={styles.heroSubtitle}>
          Name the treat, tag what it was. No macros, no judgment — just honesty.
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{cheatDays.length}</Text>
            <Text style={styles.heroStatLabel}>Cheat days</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{monthCount}</Text>
            <Text style={styles.heroStatLabel}>This month</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{thisWeekEntries.length}</Text>
            <Text style={styles.heroStatLabel}>This week</Text>
          </View>
        </View>

        {/* Tag breakdown */}
        {Object.keys(tagCounts).length > 0 && (
          <View style={styles.tagBreakdown}>
            {Object.entries(tagCounts).map(([tag, count]) => {
              const info = tag === 'untagged' ? { label: 'Other', color: COLORS.textMuted, icon: 'ellipse-outline' } : getTagInfo(tag);
              return (
                <View key={tag} style={[styles.tagBreakdownChip, { backgroundColor: `${info.color}22` }]}>
                  <Ionicons name={info.icon} size={11} color={info.color} />
                  <Text style={[styles.tagBreakdownText, { color: info.color }]}>{info.label} {count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Weekly view toggle */}
      <View style={styles.viewToggleRow}>
        <TouchableOpacity
          style={[styles.viewToggleBtn, !weekView && styles.viewToggleBtnActive]}
          onPress={() => setWeekView(false)}
        >
          <Ionicons name="calendar-outline" size={14} color={!weekView ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.viewToggleText, !weekView && styles.viewToggleTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleBtn, weekView && styles.viewToggleBtnActive]}
          onPress={() => setWeekView(true)}
        >
          <Ionicons name="bar-chart-outline" size={14} color={weekView ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.viewToggleText, weekView && styles.viewToggleTextActive]}>This Week</Text>
        </TouchableOpacity>
      </View>

      {weekView ? (
        // Weekly patterns view
        <View style={styles.weekCard}>
          <Text style={styles.weekCardTitle}>Week at a Glance</Text>
          {weekDays.map(({ dateStr, entry }) => {
            const items = entry ? entry.items.map(normalizeItem) : [];
            const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = dateStr === today;
            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.weekRow, isToday && styles.weekRowToday]}
                onPress={() => { setWeekView(false); handleDayPress({ dateString: dateStr }); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.weekDayName, isToday && { color: COLORS.primary }]}>{dayName}</Text>
                {items.length > 0 ? (
                  <View style={styles.weekItemRow}>
                    {items.slice(0, 3).map((item, i) => {
                      const info = item.tag ? getTagInfo(item.tag) : null;
                      return (
                        <View key={i} style={[styles.weekItemChip, info && { backgroundColor: `${info.color}22` }]}>
                          {info && <Ionicons name={info.icon} size={10} color={info.color} />}
                          <Text style={[styles.weekItemText, info && { color: info.color }]} numberOfLines={1}>
                            {item.text}
                          </Text>
                        </View>
                      );
                    })}
                    {items.length > 3 && (
                      <Text style={styles.weekMoreText}>+{items.length - 3}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.weekEmptyDay}>Clean</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.calendarShell}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={selected}
            theme={{
              ...CALENDAR_THEME,
              dotColor: COLORS.danger,
              selectedDotColor: COLORS.background,
            }}
            style={styles.calendar}
          />
        </View>
      )}

      <View
        style={styles.detailCard}
        onLayout={(event) => setDetailCardY(event.nativeEvent.layout.y)}
      >
        <View style={styles.detailHeader}>
          <View style={styles.detailCopy}>
            <Text style={styles.detailDate}>{formatDate(selectedDate)}</Text>
            <Text style={styles.detailSubtitle}>
              {selectedCheatDay
                ? `${selectedCheatDay.items.length} cheat${selectedCheatDay.items.length !== 1 ? 's' : ''} logged`
                : 'No cheats logged — clean day!'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logBtn} onPress={() => setShowModal(true)} activeOpacity={0.88}>
            <Ionicons name="add" size={16} color={COLORS.white} />
            <Text style={styles.logBtnText}>Log Cheat</Text>
          </TouchableOpacity>
        </View>

        {selectedCheatDay && selectedCheatDay.items.length > 0 ? (
          <View style={styles.itemsList}>
            {selectedCheatDay.items.map(normalizeItem).map((item, index) => {
              const info = item.tag ? getTagInfo(item.tag) : null;
              return (
                <View key={index} style={[
                  styles.itemChip,
                  info && { backgroundColor: `${info.color}22`, borderColor: `${info.color}44` },
                ]}>
                  {info && <Ionicons name={info.icon} size={12} color={info.color} />}
                  <Text style={[styles.itemText, info && { color: info.color }]}>{item.text}</Text>
                  <TouchableOpacity
                    onPress={() => confirmDeleteItem(index)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close-circle" size={16} color={info?.color || COLORS.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
            </View>
            <Text style={styles.emptyText}>Clean day — nothing logged.</Text>
          </View>
        )}
      </View>

      {cheatDays.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <Text style={styles.sectionMeta}>Last 5 days</Text>
          </View>

          {cheatDays.slice(0, 5).map((entry) => {
            const items = entry.items.map(normalizeItem);
            const tagSet = [...new Set(items.map((i) => i.tag).filter(Boolean))];
            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.historyCard}
                onPress={() => focusEntry(entry)}
                activeOpacity={0.84}
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                  <View style={styles.historyTags}>
                    {tagSet.map((tag) => {
                      const info = getTagInfo(tag);
                      return (
                        <View key={tag} style={[styles.historyTagChip, { backgroundColor: `${info.color}22` }]}>
                          <Ionicons name={info.icon} size={10} color={info.color} />
                        </View>
                      );
                    })}
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                  </View>
                </View>
                <Text style={styles.historyItems}>{items.map((i) => i.text).join(', ')}</Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Add item modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalGrabber} />
            <Text style={styles.modalTitle}>Log Cheat Meal</Text>
            <Text style={styles.modalSubtitle}>{formatDate(selectedDate)}</Text>

            {/* Treat selector */}
            <View style={styles.tagSelector}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.key}
                  style={[
                    styles.tagOption,
                    { backgroundColor: `${tag.color}22` },
                    selectedTag === tag.key && { borderColor: tag.color, borderWidth: 1.5 },
                  ]}
                  onPress={() => handleTagPress(tag)}
                >
                  <Ionicons name={tag.icon} size={16} color={tag.color} />
                  <Text style={[styles.tagOptionText, { color: tag.color }]}>{tag.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Cookie dough, chocolate cake, brownie..."
              placeholderTextColor={COLORS.textMuted}
              value={newItem}
              onChangeText={setNewItem}
              autoFocus
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddItem} activeOpacity={0.9}>
              <Text style={styles.modalAddBtnText}>Add Cheat</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 120 },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  heroEyebrow: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 14,
  },
  heroStat: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroStatValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  tagBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBreakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagBreakdownText: { fontSize: 12, fontWeight: '700' },
  viewToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.pillRadius,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: LAYOUT.pillRadius,
  },
  viewToggleBtnActive: { backgroundColor: COLORS.primarySoft },
  viewToggleText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  viewToggleTextActive: { color: COLORS.primary },
  weekCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 8,
    ...SHADOWS.soft,
  },
  weekCardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  weekRowToday: { backgroundColor: COLORS.primarySoft, borderRadius: 14, paddingHorizontal: 10, borderTopWidth: 0 },
  weekDayName: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', width: 32 },
  weekItemRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  weekItemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 100,
  },
  weekItemText: { color: COLORS.danger, fontSize: 11, fontWeight: '600' },
  weekMoreText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  weekEmptyDay: { color: COLORS.success, fontSize: 12, fontWeight: '600', opacity: 0.7 },
  calendarShell: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 14,
    ...SHADOWS.soft,
  },
  calendar: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    ...SHADOWS.soft,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  detailCopy: { flex: 1 },
  detailDate: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  detailSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: LAYOUT.pillRadius,
    gap: 6,
  },
  logBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemChip: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemText: { color: COLORS.danger, fontSize: 13, fontWeight: '700' },
  itemTag: { fontSize: 10, fontWeight: '700', opacity: 0.7 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successSoft,
    marginBottom: 12,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyDate: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  historyTags: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyTagChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItems: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.borderStrong,
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  tagSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagOptionText: { fontSize: 13, fontWeight: '700' },
  modalInput: {
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  modalAddBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalAddBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
