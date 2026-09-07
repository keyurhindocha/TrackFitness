// Web backup file handling — browsers have no share sheet or document picker,
// so downloads go through a Blob URL and imports through a hidden file input.
// Same public API as backup.js so SettingsScreen stays platform-agnostic.

/**
 * Triggers a browser download of the backup file.
 * @returns {Promise<'saved'>}
 */
export async function saveBackup(filename, payload) {
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a tick to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return 'saved';
}

/**
 * Opens the browser file picker and reads the chosen JSON file.
 * @returns {Promise<{ canceled: boolean, contents?: string }>}
 */
export function pickBackupJson() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('focus', onFocus);
      input.remove();
      resolve(result);
    };

    // Not every browser fires `cancel` on the input, so treat "window regained
    // focus but no file arrived" as a cancellation rather than hanging forever.
    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) finish({ canceled: true });
      }, 500);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return finish({ canceled: true });

      const reader = new FileReader();
      reader.onload = () => finish({ canceled: false, contents: String(reader.result) });
      reader.onerror = () => finish({ canceled: true });
      reader.readAsText(file);
    });

    input.addEventListener('cancel', () => finish({ canceled: true }));
    window.addEventListener('focus', onFocus);

    document.body.appendChild(input);
    input.click();
  });
}
