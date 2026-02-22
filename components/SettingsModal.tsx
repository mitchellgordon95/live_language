'use client';

import type { UserSettings } from '@/lib/types';

interface SettingsModalProps {
  settings: UserSettings;
  languageId: string;
  profile: string;
  onUpdate: (settings: UserSettings) => void;
  onClose: () => void;
}

function Toggle({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <div>
        <div className="text-sm font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}
      >
        <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

export default function SettingsModal({ settings, languageId, profile, onUpdate, onClose }: SettingsModalProps) {
  const update = (patch: Partial<UserSettings>) => {
    const updated = { ...settings, ...patch };
    onUpdate(updated);
    fetch('/api/game/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, settings: updated }),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-gray-900 border border-gray-700 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
        <div className="divide-y divide-gray-700/50">
          {languageId === 'mandarin' && (
            <Toggle
              label="Show Pinyin"
              description="Show romanization next to Chinese characters"
              checked={settings.showPinyin}
              onChange={(v) => update({ showPinyin: v })}
            />
          )}
          <Toggle
            label="Listening Mode"
            description="Hide NPC dialogue text — rely on audio only"
            checked={settings.hideNpcDialogue}
            onChange={(v) => update({ hideNpcDialogue: v })}
          />
        </div>
      </div>
    </>
  );
}
