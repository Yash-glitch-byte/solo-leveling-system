import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { soundEngine } from '../../game/sound';

interface EditProfileModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updates: Partial<PlayerProfile>) => void;
}

const AVATAR_OPTIONS = [
  { icon: '⚡', label: 'Lightning Sovereign' },
  { icon: '🗡️', label: 'Shadow Assassin' },
  { icon: '👑', label: 'Monarch Sovereign' },
  { icon: '🛡️', label: 'Iron Guardian' },
  { icon: '🐺', label: 'Dire Wolf' },
  { icon: '🔥', label: 'Flame Monarch' },
  { icon: '🐉', label: 'Dragon Monarch' },
  { icon: '🥋', label: 'Martial Master' },
  { icon: '🏹', label: 'Phantom Archer' },
  { icon: '🔮', label: 'Arcane Mage' }
];

const TITLE_SUGGESTIONS = [
  'The Reawakened One',
  'The Shadow Monarch',
  'The Relentless Coder',
  'The Iron Disciplinarian',
  'The Focus Prodigy',
  'Uncrowned Sovereign',
  'System Pioneer'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  onSaveProfile
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(player.name);
  const [title, setTitle] = useState(player.title);
  const [avatarIcon, setAvatarIcon] = useState(player.avatarIcon || '⚡');

  const handleSave = () => {
    soundEngine.playLevelUp();
    onSaveProfile({
      name: name.trim() || 'Hunter',
      title: title.trim() || 'The Reawakened One',
      avatarIcon
    });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 8, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="hud-card edit-profile-modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderColor: '#00d2ff',
          boxShadow: '0 0 35px rgba(0, 210, 255, 0.35)',
          borderRadius: '12px',
          padding: '24px',
          background: 'linear-gradient(180deg, rgba(12, 24, 48, 0.98), rgba(6, 12, 26, 0.98))'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner tr" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner bl" style={{ borderColor: '#00d2ff' }} />
        <div className="card-corner br" style={{ borderColor: '#00d2ff' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className="hud-tag" style={{ borderColor: '#00d2ff', color: '#00d2ff' }}>
            ● HUNTER IDENTITY REGISTRATION
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7f9ebc',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', margin: '0 0 6px 0' }}>
          EDIT HUNTER PROFILE
        </h2>
        <p style={{ color: '#7f9ebc', fontSize: '0.84rem', margin: '0 0 20px 0', lineHeight: '1.4' }}>
          Personalize your true name, title, and avatar icon. This updates your permanent status window and system records.
        </p>

        {/* Name Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#00d2ff', marginBottom: '6px', fontWeight: 700 }}>
            HUNTER REAL NAME:
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name (e.g. Yash)"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(6, 12, 26, 0.9)',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-display)',
              outline: 'none'
            }}
          />
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffd700', marginBottom: '6px', fontWeight: 700 }}>
            HUNTER TITLE / ALIAS:
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter your title (e.g. The Iron Sovereign)"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(6, 12, 26, 0.9)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              borderRadius: '6px',
              color: '#ffd700',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-display)',
              outline: 'none',
              marginBottom: '8px'
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TITLE_SUGGESTIONS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  soundEngine.playPing();
                  setTitle(t);
                }}
                style={{
                  background: 'rgba(255, 215, 0, 0.08)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  color: '#ffd700',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Icon Selector */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#c084fc', marginBottom: '8px', fontWeight: 700 }}>
            SELECT HUNTER AVATAR:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {AVATAR_OPTIONS.map(opt => {
              const selected = avatarIcon === opt.icon;
              return (
                <button
                  key={opt.icon}
                  type="button"
                  onClick={() => {
                    soundEngine.playPing();
                    setAvatarIcon(opt.icon);
                  }}
                  title={opt.label}
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    background: selected ? 'rgba(0, 210, 255, 0.25)' : 'rgba(10, 20, 38, 0.6)',
                    border: selected ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 15px rgba(0, 210, 255, 0.5)' : 'none'
                  }}
                >
                  {opt.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="hud-btn-primary"
            onClick={handleSave}
            style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
          >
            💾 SAVE PROFILE IDENTITY
          </button>
          <button
            className="hud-btn-secondary"
            onClick={onClose}
            style={{ padding: '12px 18px', fontSize: '0.88rem' }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
