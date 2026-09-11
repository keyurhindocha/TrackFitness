import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { getCheatDays, saveCheatDay, deleteCheatDay } from '../storage/storage';
import {
  generateId,
  getTodayString,
  formatDate,
  getMonthKey,
  getWeekStart,
  parseDateString,
  toDateString,
  getCleanStreaks,
} from '../utils/helpers';
import { COLORS, CALENDAR_THEME, LAYOUT, SHADOWS } from '../utils/theme';
import { showAlert } from '../components/AlertHost';

// The page is laid out for one job: writing down a slip the moment it happens.
// The composer sits at the top so the keyboard, which rises from the bottom,
// can never cover it — on a phone browser or a native build. Everything below
// it is there to make the pattern visible: a clean streak, the week at a
// glance, a month calendar, and a complete history.

const TAGS = [
  { key: 'cookie', label: 'Cookie', color: COLORS.highlight, icon: 'cafe-outline' },
  { key: 'cake', label: 'Cake', color: COLORS.danger, icon: 'gift-outline' },
  { key: 'chocolate', label: 'Chocolate', color: COLORS.success, icon: 'nutrition-outline' },
  { key: 'ice-cream', label: 'Ice Cream', color: COLORS.primary, icon: 'ice-cream-outline' },
];

const OTHER_TAG = { label: 'Other', color: COLORS.textSecondary, icon: 'ellipse-outline' };

const getTagInfo = (key) => TAGS.find((t) => t.key === key) || OTHER_TAG;

// Items were plain strings in early versions; treat those as untagged.
const normalizeItem = (item) =>
  typeof item === 'string' ? { text: item, tag: null } : item;

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const monthLabel = (dateString) =>
  parseDateString(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function CheatScreen() {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [cheatDays, setCheatDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [text, setText] = useState('');
  const [tag, setTag] = useState(null);
  const [dayCardY, setDayCardY] = useState(0);
  const [justLogged, setJustLogged] = useState(null);

  const today = getTodayString();

  useFocusEffect(
    useCallback(() => {
      getCheatDays().then(setCheatDays);
    }, [])
  );

  // ── Derived data ──────────────────────────────────────────────────────────

  const byDate = useMemo(() => {
    const map = {};
    cheatDays.forEach((entry) => {
      map[entry.date] = { ...entry, items: (entry.items || []).map(normalizeItem) };
    });
    return map;
  }, [cheatDays]);

  const history = useMemo(
    () => Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)),
    [byDate]
  );

  const streaks = useMemo(() => getCleanStreaks(Object.keys(byDate)), [byDate]);

  const weekDays = useMemo(() => {
    const start = getWeekStart(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = parseDateString(start);
      d.setDate(d.getDate() + i);
      const date = toDateString(d);
      return {
        date,
        letter: WEEKDAY_LETTERS[i],
        isToday: date === today,
        isFuture: date > today,
        cheated: !!byDate[date],
      };
    });
  }, [byDate, today]);

  const thisMonth = getMonthKey(today);
  const monthEntries = history.filter((e) => getMonthKey(e.date) === thisMonth);
  const monthCheats = monthEntries.reduce((n, e) => n + e.items.length, 0);

  const tagCounts = useMemo(() => {
    const counts = {};
    monthEntries.forEach((e) =>
      e.items.forEach((item) => {
        const key = item.tag || 'other';
        counts[key] = (counts[key] || 0) + 1;
      })
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [monthEntries]);

  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(byDate).forEach((date) => {
      marks[date] = { marked: true, dotColor: COLORS.danger };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.primaryStrong,
    };
    return marks;
  }, [byDate, selectedDate]);

  const selectedDay = byDate[selectedDate] || null;
  const loggingForToday = selectedDate === today;

  // ── Actions ───────────────────────────────────────────────────────────────

  const persist = async (entry) => {
    await saveCheatDay(entry);
    setCheatDays(await getCheatDays());
  };

  const handleLog = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const item = { text: trimmed, tag };
    const existing = selectedDay;
    await persist(
      existing
        ? { ...existing, items: [...existing.items, item] }
        : { id: generateId(), date: selectedDate, items: [item] }
    );

    setText('');
    setTag(null);
    setJustLogged(trimmed);
    setTimeout(() => setJustLogged(null), 2500);
  };

  const handleTagPress = (t) => {
    const deselecting = tag === t.key;
    setTag(deselecting ? null : t.key);
    // A tag doubles as a one-tap entry: with nothing typed, its label becomes
    // the text. Typing over it is fine; it is only a starting point.
    setText((current) => {
      const trimmed = current.trim();
      if (deselecting) return trimmed === t.label ? '' : current;
      return trimmed ? current : t.label;
    });
  };

  const handleDeleteItem = async (index) => {
    if (!selectedDay) return;
    const items = selectedDay.items.filter((_, i) => i !== index);
    if (items.length === 0) {
      await deleteCheatDay(selectedDate);
      setCheatDays(await getCheatDays());
    } else {
      await persist({ ...selectedDay, items });
    }
  };

  const confirmDeleteItem = (index) => {
    const label = selectedDay?.items[index]?.text || 'this cheat';
    showAlert('Delete cheat?', `Remove "${label}" from ${formatDate(selectedDate)}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(index) },
    ]);
  };

  const selectDay = (date) => setSelectedDate(date);

  const jumpToDay = (date) => {
    setSelectedDate(date);
    scrollRef.current?.scrollTo({ y: Math.max(dayCardY - 12, 0), animated: true });
  };

  const focusComposer = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => inputRef.current?.focus(), 250);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasAnyHistory = history.length > 0;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* ── Streak + week at a glance ─────────────────────────────────────── */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statHero}>
            <Text style={styles.statEyebrow}>Clean streak</Text>
            {streaks.current === null ? (
              <Text style={styles.statHeroValueMuted}>—</Text>
            ) : (
              <Text style={[styles.statHeroValue, streaks.current === 0 && styles.statHeroValueZero]}>
                {streaks.current}
                <Text style={styles.statHeroUnit}> {streaks.current === 1 ? 'day' : 'days'}</Text>
              </Text>
            )}
          </View>
          <View style={styles.statSide}>
            <Text style={styles.statSideValue}>{streaks.best ?? '—'}</Text>
            <Text style={styles.statSideLabel}>best streak</Text>
          </View>
          <View style={styles.statSide}>
            <Text style={[styles.statSideValue, monthCheats > 0 && { color: COLORS.danger }]}>
              {monthCheats}
            </Text>
            <Text style={styles.statSideLabel}>this month</Text>
          </View>
        </View>

        <View style={styles.weekStrip}>
          {weekDays.map((d) => (
            <TouchableOpacity
              key={d.date}
              style={styles.weekCell}
              onPress={() => jumpToDay(d.date)}
              disabled={d.isFuture}
              activeOpacity={0.7}
              accessibilityLabel={`${formatDate(d.date)}: ${
                d.isFuture ? 'upcoming' : d.cheated ? 'cheat logged' : 'clean'
              }`}
            >
              <Text style={[styles.weekLetter, d.isToday && styles.weekLetterToday]}>{d.letter}</Text>
              <View
                style={[
                  styles.weekDot,
                  d.isFuture ? styles.weekDotFuture : d.cheated ? styles.weekDotCheat : styles.weekDotClean,
                  d.isToday && styles.weekDotToday,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {tagCounts.length > 0 && (
          <View style={styles.tagBreakdown}>
            {tagCounts.map(([key, count]) => {
              const info = key === 'other' ? OTHER_TAG : getTagInfo(key);
              return (
                <View key={key} style={[styles.breakdownChip, { backgroundColor: `${info.color}1f` }]}>
                  <Ionicons name={info.icon} size={11} color={info.color} />
                  <Text style={[styles.breakdownText, { color: info.color }]}>
                    {info.label} {count}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Composer ──────────────────────────────────────────────────────── */}
      <View style={styles.composer}>
        <View style={styles.composerHeader}>
          <Text style={styles.composerLabel}>Logging for</Text>
          <View style={[styles.datePill, !loggingForToday && styles.datePillPast]}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={loggingForToday ? COLORS.textSecondary : COLORS.primary}
            />
            <Text style={[styles.datePillText, !loggingForToday && styles.datePillTextPast]}>
              {loggingForToday ? 'Today' : formatDate(selectedDate)}
            </Text>
          </View>
          {!loggingForToday && (
            <TouchableOpacity onPress={() => selectDay(today)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.backToToday}>Back to today</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="What did you have?"
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleLog}
            returnKeyType="done"
            blurOnSubmit={false}
            accessibilityLabel="What did you have"
          />
          <TouchableOpacity
            style={[styles.logBtn, !text.trim() && styles.logBtnDisabled]}
            onPress={handleLog}
            disabled={!text.trim()}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Log cheat"
          >
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.logBtnText}>Log</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagRow}>
          {TAGS.map((t) => {
            const active = tag === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tagChip,
                  { backgroundColor: `${t.color}1a`, borderColor: active ? t.color : 'transparent' },
                ]}
                onPress={() => handleTagPress(t)}
                activeOpacity={0.75}
              >
                <Ionicons name={t.icon} size={13} color={t.color} />
                <Text style={[styles.tagChipText, { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {justLogged && (
          <View style={styles.loggedRow}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.loggedText}>Logged “{justLogged}”</Text>
          </View>
        )}
      </View>

      {/* ── Calendar ──────────────────────────────────────────────────────── */}
      <View style={styles.calendarShell}>
        <Calendar
          onDayPress={(day) => selectDay(day.dateString)}
          markedDates={markedDates}
          theme={{ ...CALENDAR_THEME, dotColor: COLORS.danger, selectedDotColor: COLORS.background }}
          style={styles.calendar}
        />
      </View>

      {/* ── Selected day ──────────────────────────────────────────────────── */}
      <View style={styles.dayCard} onLayout={(e) => setDayCardY(e.nativeEvent.layout.y)}>
        <View style={styles.dayHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayTitle}>{loggingForToday ? 'Today' : formatDate(selectedDate)}</Text>
            <Text style={[styles.daySubtitle, !selectedDay && { color: COLORS.success }]}>
              {selectedDay
                ? `${selectedDay.items.length} cheat${selectedDay.items.length !== 1 ? 's' : ''} logged`
                : selectedDate > today
                ? 'Not yet'
                : 'Clean day'}
            </Text>
          </View>
          <TouchableOpacity style={styles.dayAddBtn} onPress={focusComposer} activeOpacity={0.8}>
            <Ionicons name="add" size={14} color={COLORS.primary} />
            <Text style={styles.dayAddText}>Add</Text>
          </TouchableOpacity>
        </View>

        {selectedDay ? (
          <View style={styles.itemsList}>
            {selectedDay.items.map((item, index) => {
              const info = item.tag ? getTagInfo(item.tag) : null;
              const color = info ? info.color : COLORS.textSecondary;
              return (
                <View
                  key={`${item.text}-${index}`}
                  style={[styles.itemChip, { backgroundColor: `${color}1f`, borderColor: `${color}55` }]}
                >
                  {info && <Ionicons name={info.icon} size={12} color={color} />}
                  <Text style={[styles.itemText, { color }]}>{item.text}</Text>
                  <TouchableOpacity
                    onPress={() => confirmDeleteItem(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.text}`}
                  >
                    <Ionicons name="close-circle" size={16} color={color} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.cleanRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
            <Text style={styles.cleanText}>
              {selectedDate > today ? 'This day has not happened yet.' : 'Nothing logged. Keep it that way.'}
            </Text>
          </View>
        )}
      </View>

      {/* ── History ───────────────────────────────────────────────────────── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>History</Text>
        <Text style={styles.sectionMeta}>
          {hasAnyHistory ? `${history.length} day${history.length !== 1 ? 's' : ''}` : ''}
        </Text>
      </View>

      {!hasAnyHistory ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="leaf-outline" size={22} color={COLORS.success} />
          <Text style={styles.emptyHistoryText}>No cheats logged yet.</Text>
          <Text style={styles.emptyHistorySub}>When one happens, write it down above. That is the whole habit.</Text>
        </View>
      ) : (
        history.map((entry, i) => {
          const prev = history[i - 1];
          const newMonth = !prev || getMonthKey(prev.date) !== getMonthKey(entry.date);
          const tagSet = [...new Set(entry.items.map((it) => it.tag).filter(Boolean))];
          const isSelected = entry.date === selectedDate;
          return (
            <View key={entry.id || entry.date}>
              {newMonth && <Text style={styles.monthDivider}>{monthLabel(entry.date)}</Text>}
              <TouchableOpacity
                style={[styles.historyCard, isSelected && styles.historyCardSelected]}
                onPress={() => jumpToDay(entry.date)}
                activeOpacity={0.84}
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {entry.date === today ? 'Today' : formatDate(entry.date)}
                  </Text>
                  <View style={styles.historyRight}>
                    {tagSet.map((k) => {
                      const info = getTagInfo(k);
                      return (
                        <View key={k} style={[styles.historyTagDot, { backgroundColor: `${info.color}26` }]}>
                          <Ionicons name={info.icon} size={10} color={info.color} />
                        </View>
                      );
                    })}
                    <Text style={styles.historyCount}>{entry.items.length}</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </View>
                </View>
                <Text style={styles.historyItems} numberOfLines={2}>
                  {entry.items.map((it) => it.text).join(' · ')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 120 },

  // Stats
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  statsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  statHero: { flex: 1 },
  statEyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statHeroValue: { color: COLORS.success, fontSize: 36, fontWeight: '800', lineHeight: 40 },
  statHeroValueZero: { color: COLORS.danger },
  statHeroValueMuted: { color: COLORS.textMuted, fontSize: 36, fontWeight: '800', lineHeight: 40 },
  statHeroUnit: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  statSide: { alignItems: 'flex-end', minWidth: 56 },
  statSideValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', lineHeight: 24 },
  statSideLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginTop: 1 },

  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  weekCell: { alignItems: 'center', gap: 6, flex: 1 },
  weekLetter: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  weekLetterToday: { color: COLORS.primary },
  weekDot: { width: 14, height: 14, borderRadius: 7 },
  weekDotClean: { backgroundColor: COLORS.success },
  weekDotCheat: { backgroundColor: COLORS.danger },
  weekDotFuture: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.borderStrong },
  weekDotToday: { borderWidth: 2, borderColor: COLORS.primary },

  tagBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: LAYOUT.pillRadius,
  },
  breakdownText: { fontSize: 11, fontWeight: '700' },

  // Composer
  composer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  composerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  composerLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  datePillPast: { backgroundColor: COLORS.primarySoft },
  datePillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  datePillTextPast: { color: COLORS.primary },
  backToToday: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  logBtnDisabled: { opacity: 0.4 },
  logBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: LAYOUT.pillRadius,
    borderWidth: 1.5,
  },
  tagChipText: { fontSize: 12, fontWeight: '700' },

  loggedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  loggedText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },

  // Calendar
  calendarShell: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 6,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  calendar: { borderRadius: LAYOUT.cardRadius },

  // Selected day
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  daySubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  dayAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primarySoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dayAddText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: LAYOUT.pillRadius,
    borderWidth: 1,
  },
  itemText: { fontSize: 14, fontWeight: '600' },
  cleanRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  cleanText: { color: COLORS.textSecondary, fontSize: 13 },

  // History
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionMeta: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  monthDivider: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
  },
  historyCardSelected: { borderColor: COLORS.primary },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyTagDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCount: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginLeft: 2 },
  historyItems: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 6 },

  emptyHistory: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyHistoryText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  emptyHistorySub: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
