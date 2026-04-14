import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { exportAllData, importAllData } from '../storage/storage';
import { getTodayString } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

const EXPORT_VERSION = '1';

function StatRow({ icon, label, value, color }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [exportState, setExportState] = useState('idle'); // idle | loading | done | error
  const [importState, setImportState] = useState('idle'); // idle | loading | done | error
  const [summary, setSummary] = useState(null); // { workouts, cheatDays, goals }
  const [lastExportFile, setLastExportFile] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const data = await exportAllData();
    setSummary(data);
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExportState('loading');
    try {
      const data = await exportAllData();
      const payload = JSON.stringify(
        {
          version: EXPORT_VERSION,
          app: 'TrackFitness',
          exportedAt: new Date().toISOString(),
          ...data,
        },
        null,
        2
      );

      const filename = `trackfitness_backup_${getTodayString()}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, payload, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Your device does not support file sharing.');
        setExportState('error');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save TrackFitness Backup',
        UTI: 'public.json',
      });

      setLastExportFile(filename);
      setExportState('done');
    } catch (err) {
      console.error('Export failed:', err);
      setExportState('error');
      Alert.alert('Export failed', 'Something went wrong while exporting your data.');
    }
  };

  // ── Import ────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    setImportState('loading');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', 'public.json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setImportState('idle');
        return;
      }

      const fileUri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        Alert.alert('Invalid file', 'The selected file is not valid JSON.');
        setImportState('error');
        return;
      }

      // Validate structure
      if (!parsed.workouts && !parsed.cheatDays && !parsed.goals) {
        Alert.alert(
          'Unrecognised file',
          'This file does not look like a TrackFitness backup. Make sure you select a file exported from this app.'
        );
        setImportState('error');
        return;
      }

      const workoutCount = parsed.workouts?.length ?? 0;
      const cheatCount = parsed.cheatDays?.length ?? 0;
      const goalCount = parsed.goals?.length ?? 0;

      Alert.alert(
        'Restore backup?',
        `This will replace all your current data with:\n\n• ${workoutCount} workout${workoutCount !== 1 ? 's' : ''}\n• ${cheatCount} cheat day${cheatCount !== 1 ? 's' : ''}\n• ${goalCount} goal${goalCount !== 1 ? 's' : ''}\n\nThis cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setImportState('idle'),
          },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              await importAllData({
                workouts: parsed.workouts ?? [],
                cheatDays: parsed.cheatDays ?? [],
                goals: parsed.goals ?? [],
              });
              await loadSummary();
              setImportState('done');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Import failed:', err);
      setImportState('error');
      Alert.alert('Import failed', 'Something went wrong while reading the file.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const exportLoading = exportState === 'loading';
  const importLoading = importState === 'loading';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Current data summary */}
      {summary && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Data</Text>
          <Text style={styles.cardSubtitle}>Stored on this device only</Text>
          <View style={styles.statsBlock}>
            <StatRow
              icon="barbell-outline"
              label="Workouts"
              value={summary.workouts.length}
              color={COLORS.primary}
            />
            <StatRow
              icon="pizza-outline"
              label="Cheat days"
              value={summary.cheatDays.length}
              color={COLORS.danger}
            />
            <StatRow
              icon="flag-outline"
              label="Goals"
              value={summary.goals.length}
              color={COLORS.success}
            />
          </View>
        </View>
      )}

      {/* Export */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${COLORS.primary}18` }]}>
            <Ionicons name="share-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Export Backup</Text>
            <Text style={styles.cardSubtitle}>
              Save all your data as a JSON file you can keep anywhere
            </Text>
          </View>
        </View>

        {exportState === 'done' && lastExportFile && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
            <Text style={styles.successText}>Exported as {lastExportFile}</Text>
          </View>
        )}
        {exportState === 'error' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
            <Text style={styles.errorText}>Export failed — try again</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, exportLoading && styles.actionBtnDisabled]}
          onPress={handleExport}
          disabled={exportLoading}
          activeOpacity={0.82}
        >
          {exportLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Export to JSON</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Import */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${COLORS.secondary}18` }]}>
            <Ionicons name="folder-open-outline" size={22} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Import Backup</Text>
            <Text style={styles.cardSubtitle}>
              Restore from a previously exported JSON file
            </Text>
          </View>
        </View>

        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={14} color={COLORS.highlight} />
          <Text style={styles.warningText}>
            Importing will overwrite all current data
          </Text>
        </View>

        {importState === 'done' && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
            <Text style={styles.successText}>Data restored successfully</Text>
          </View>
        )}
        {importState === 'error' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
            <Text style={styles.errorText}>Import failed — check the file and try again</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary, importLoading && styles.actionBtnDisabled]}
          onPress={handleImport}
          disabled={importLoading}
          activeOpacity={0.82}
        >
          {importLoading ? (
            <ActivityIndicator color={COLORS.secondary} size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.secondary} />
              <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>Choose JSON File</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
        <Text style={styles.infoText}>
          TrackFitness stores all data locally on your device. Use Export to back up
          before reinstalling the app or switching phones, and Import to restore it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 48, gap: 14 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  statsBlock: { gap: 10 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  successText: { color: COLORS.success, fontSize: 13, fontWeight: '600', flex: 1 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '600', flex: 1 },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  warningText: { color: COLORS.highlight, fontSize: 13, fontWeight: '600', flex: 1 },

  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    backgroundColor: `${COLORS.secondary}18`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}44`,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});
