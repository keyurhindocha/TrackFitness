import { useEffect, useState } from 'react';
import {
  Alert as RNAlert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

// react-native-web ships `Alert.alert` as a no-op stub, so on web every
// confirmation would silently do nothing. `showAlert` keeps the native dialog
// on iOS/Android and renders a themed modal on web with the same signature.

let present = null;

/**
 * Drop-in replacement for `Alert.alert`.
 *
 * @param {string} title
 * @param {string} [message]
 * @param {{ text: string, style?: 'cancel'|'destructive'|'default', onPress?: Function }[]} [buttons]
 */
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    return RNAlert.alert(title, message, buttons);
  }

  const resolved =
    buttons && buttons.length ? buttons : [{ text: 'OK', style: 'default' }];

  if (present) {
    present({ title, message, buttons: resolved });
    return;
  }

  // AlertHost isn't mounted yet — fall back to the browser's own dialogs so a
  // confirmation is never silently dropped.
  const confirmBtn =
    resolved.find((b) => b.style !== 'cancel') ?? resolved[0];
  const cancelBtn = resolved.find((b) => b.style === 'cancel');
  const text = message ? `${title}\n\n${message}` : title;

  if (resolved.length > 1) {
    if (typeof window !== 'undefined' && window.confirm(text)) {
      confirmBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
  } else {
    if (typeof window !== 'undefined') window.alert(text);
    confirmBtn?.onPress?.();
  }
}

export default function AlertHost() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    present = setDialog;
    return () => {
      present = null;
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  const dismiss = (button) => {
    setDialog(null);
    button?.onPress?.();
  };

  const buttons = dialog?.buttons ?? [];
  const cancelButton = buttons.find((b) => b.style === 'cancel');

  return (
    <Modal
      visible={!!dialog}
      transparent
      animationType="fade"
      onRequestClose={() => dismiss(cancelButton)}
    >
      <Pressable style={styles.backdrop} onPress={() => dismiss(cancelButton)}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{dialog?.title}</Text>
          {!!dialog?.message && (
            <Text style={styles.message}>{dialog.message}</Text>
          )}

          <View style={styles.actions}>
            {buttons.map((button, i) => (
              <Pressable
                key={`${button.text}-${i}`}
                onPress={() => dismiss(button)}
                style={({ hovered }) => [
                  styles.button,
                  button.style === 'cancel' && styles.buttonCancel,
                  button.style === 'destructive' && styles.buttonDestructive,
                  hovered && styles.buttonHovered,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.buttonTextCancel,
                    button.style === 'destructive' && styles.buttonTextDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    ...SHADOWS.card,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: LAYOUT.pillRadius,
    backgroundColor: COLORS.primary,
  },
  buttonCancel: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonDestructive: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  buttonHovered: {
    opacity: 0.85,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextCancel: {
    color: COLORS.textSecondary,
  },
  buttonTextDestructive: {
    color: COLORS.danger,
  },
});
