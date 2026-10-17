import React, { useState } from 'react';
import { soundEngine } from '../../game/sound';
import { shadowVoice } from '../../game/voiceAssistant';
import { EquipmentItem } from '../../types';

export interface LootReward {
  xpBonus: number;
  statPointsBonus: number;
  fatigueReduction: number;
  gearItem?: EquipmentItem;
  title: string;
}

interface LootDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (reward: LootReward) => void;
  sourceName?: string;
}

const POSSIBLE_REWARD_RELICS: EquipmentItem[] = [
  {
    id: 'relic-monarch-ring',
    name: "Shadow Monarch's Sovereign Ring",
    slot: 'ring',
    rarity: 'legendary',
    statBonus: { focus: 4, vitality: 3 },
    description: 'Forged in the heart of the Shadow Domain. Extends focus session endurance.',
    lore: 'Worn by the monarch who command the unyielding shadows.',
    specialEffect: '+20% Dungeon Focus Duration Resilience',
    icon: '💍',
    isEquipped: false
  },
  {
    id: 'relic-venom-dagger',
    name: "Kasaka's Poisoned Fang",
    slot: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 4 },
    description: 'A serrated dagger carved from the blue venom serpent. Grants physical bite.',
    lore: 'Inflicts paralysis on physical hesitation.',
    specialEffect: '+10% EXP from Physical Push-up Quests',
    icon: '🗡️',
    isEquipped: false
  },
  {
    id: 'relic-focus-amulet',
    name: "Amulet of Pure Concentration",
    slot: 'accessory',
    rarity: 'epic',
    statBonus: { focus: 3, intelligence: 3 },
    description: 'Humming with blue mana. Cancels out wandering thoughts during deep study.',
    lore: 'Carved by mages who memorized entire libraries.',
    specialEffect: 'Reduces burnout fatigue buildup by 20%',
    icon: '📿',
    isEquipped: false
  }
];

export const LootDropModal: React.FC<LootDropModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  sourceName = 'Task Verification'
}) => {
  if (!isOpen) return null;

  const [isOpening, setIsOpening] = useState(false);
  const [openedReward, setOpenedReward] = useState<LootReward | null>(null);

  const handleOpenCrate = () => {
    soundEngine.playDungeonEnter();
    setIsOpening(true);

    setTimeout(() => {
      soundEngine.playLevelUp();
      setIsOpening(false);

      // Generate randomized reward
      const xpRoll = Math.floor(Math.random() * 50) + 40; // 40-90 EXP
      const statRoll = Math.random() > 0.4 ? 1 : 0; // 60% chance for +1 stat point
      const fatigueRoll = 15; // -15% fatigue
      const relicRoll = Math.random() > 0.5 ? POSSIBLE_REWARD_RELICS[Math.floor(Math.random() * POSSIBLE_REWARD_RELICS.length)] : undefined;

      const reward: LootReward = {
        xpBonus: xpRoll,
        statPointsBonus: statRoll,
        fatigueReduction: fatigueRoll,
        gearItem: relicRoll,
        title: relicRoll ? 'LEGENDARY HUNTER RELIC CRATE' : 'ROYAL HUNTER BONUS CRATE'
      };

      setOpenedReward(reward);
      shadowVoice.speak(`Mystery Crate unlocked! Bonus ${xpRoll} EXP awarded to your profile.`);
    }, 1200);
  };

  const handleClaim = () => {
    if (!openedReward) return;
    soundEngine.playLevelUp();
    onClaimReward(openedReward);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 8, 18, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="hud-card loot-drop-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          borderColor: '#ffd700',
          boxShadow: '0 0 45px rgba(255, 215, 0, 0.4)',
          borderRadius: '14px',
          padding: '28px 20px',
          background: 'linear-gradient(180deg, rgba(28, 22, 10, 0.98), rgba(12, 10, 6, 0.98))',
          position: 'relative'
        }}
      >
        <div className="card-corner tl" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner tr" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner bl" style={{ borderColor: '#ffd700' }} />
        <div className="card-corner br" style={{ borderColor: '#ffd700' }} />

        <span className="hud-tag" style={{ borderColor: '#ffd700', color: '#ffd700', marginBottom: '8px', display: 'inline-block' }}>
          ✦ SYSTEM MYSTERY LOOT DROP
        </span>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', margin: '4px 0 6px 0' }}>
          BONUS PRIZE REWARD CRATE
        </h2>
        <p style={{ color: '#ffd700', fontSize: '0.84rem', margin: '0 0 20px 0' }}>
          Conquered: <strong>{sourceName}</strong>
        </p>

        {!openedReward ? (
          <div>
            <div
              style={{
                fontSize: '5rem',
                margin: '15px 0 25px 0',
                filter: 'drop-shadow(0 0 25px #ffd700)',
                animation: isOpening ? 'pulse-glow 0.4s infinite alternate' : 'bounce-subtle 2s infinite ease-in-out'
              }}
            >
              🎁
            </div>

            <p style={{ color: '#b9d2eb', fontSize: '0.88rem', marginBottom: '24px' }}>
              Your discipline has triggered a rare System Drop. Unlock this crate to claim bonus EXP, stat points, or legendary relics!
            </p>

            <button
              className="hud-btn-primary"
              disabled={isOpening}
              onClick={handleOpenCrate}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderColor: '#ffd700',
                color: '#fff',
                cursor: isOpening ? 'wait' : 'pointer'
              }}
            >
              {isOpening ? '✦ UNSEALING ANCIENT LOCKS...' : '✦ UNLOCK MYSTERY CRATE ✦'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
              {openedReward.gearItem ? openedReward.gearItem.icon : '✨'}
            </div>

            <h3 style={{ color: '#ffd700', fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 14px 0' }}>
              {openedReward.title}
            </h3>

            {/* Revealed Rewards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#fff', fontSize: '0.86rem' }}>⚡ Bonus Experience:</span>
                <strong style={{ color: '#ffd700', fontSize: '0.92rem' }}>+{openedReward.xpBonus} EXP</strong>
              </div>

              {openedReward.statPointsBonus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '10px 14px', borderRadius: '6px' }}>
                  <span style={{ color: '#fff', fontSize: '0.86rem' }}>💎 Free Stat Points:</span>
                  <strong style={{ color: '#00f0ff', fontSize: '0.92rem' }}>+{openedReward.statPointsBonus} Point</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#fff', fontSize: '0.86rem' }}>🧪 Biological Restoration:</span>
                <strong style={{ color: '#34d399', fontSize: '0.92rem' }}>-{openedReward.fatigueReduction}% Fatigue</strong>
              </div>

              {openedReward.gearItem && (
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '10px 14px', borderRadius: '6px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{openedReward.gearItem.icon}</span>
                    <strong style={{ color: '#c084fc', fontSize: '0.88rem' }}>{openedReward.gearItem.name}</strong>
                  </div>
                  <span style={{ color: '#b9d2eb', fontSize: '0.76rem', display: 'block' }}>
                    {openedReward.gearItem.description} (Added to Hunter Backpack!)
                  </span>
                </div>
              )}
            </div>

            <button
              className="hud-btn-primary"
              onClick={handleClaim}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                borderColor: '#00f0ff'
              }}
            >
              ✦ CLAIM REWARDS & UPGRADE PROFILE ✦
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
