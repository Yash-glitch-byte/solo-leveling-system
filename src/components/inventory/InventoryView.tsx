import React, { useState } from 'react';
import { EquipmentItem, EquippedGear, AttributeStats } from '../../types';
import { soundEngine } from '../../game/sound';

interface InventoryViewProps {
  inventory: EquipmentItem[];
  equippedGear: EquippedGear;
  onEquipItem: (item: EquipmentItem) => void;
  onUnequipItem: (slot: keyof EquippedGear) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  equippedGear,
  onEquipItem,
  onUnequipItem
}) => {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(inventory[0] || null);

  const handleSelect = (item: EquipmentItem) => {
    soundEngine.playPing();
    setSelectedItem(item);
  };

  const handleEquipToggle = (item: EquipmentItem) => {
    soundEngine.playLevelUp();
    if (item.isEquipped) {
      onUnequipItem(item.slot);
    } else {
      onEquipItem(item);
    }
  };

  const slots: Array<{ key: keyof EquippedGear; label: string; icon: string; realLifeRole: string }> = [
    { key: 'weapon', label: 'WEAPON (MAINHAND)', icon: '🗡️', realLifeRole: 'Powers your physical strength & push-up intensity' },
    { key: 'armor', label: 'ATTIRE & ARMOR', icon: '🛡️', realLifeRole: 'Protects from real-world burnout & reduces fatigue' },
    { key: 'ring', label: 'E-RING (FINGER)', icon: '💍', realLifeRole: 'Bestowed to all Hunters; boosts daily focus & XP gain' },
    { key: 'accessory', label: 'AMULET / RELIC', icon: '📿', realLifeRole: 'Enhances cognitive endurance in 25-min focus sessions' }
  ];

  // Calculate total equipped stat bonuses
  const totalBonuses: Record<string, number> = {};
  Object.values(equippedGear).forEach(gear => {
    if (gear && gear.statBonus) {
      Object.entries(gear.statBonus).forEach(([attr, bonus]) => {
        if (typeof bonus === 'number') {
          totalBonuses[attr] = (totalBonuses[attr] || 0) + bonus;
        }
      });
    }
  });

  return (
    <div className="inventory-view-container" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Top Header */}
      <div className="inventory-header" style={{ marginBottom: '16px' }}>
        <div>
          <span className="hud-tag">[HUNTER VAULT & EQUIPMENT MATRIX]</span>
          <h2 className="section-title" style={{ margin: '4px 0', fontSize: '1.6rem', color: '#fff' }}>
            LOADOUT & HUNTER ATTIRE
          </h2>
        </div>
      </div>

      {/* Crystal Clear "How Loadout Works" Banner */}
      <div
        className="hud-card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 27, 54, 0.95), rgba(9, 18, 36, 0.95))',
          border: '1px solid #00d2ff',
          boxShadow: '0 0 25px rgba(0, 210, 255, 0.2)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#00f0ff' }}>
            HOW YOUR LOADOUT IMPROVES YOUR REAL-LIFE STATS
          </h3>
        </div>

        <p style={{ margin: '0 0 12px 0', color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.5' }}>
          Your <strong>Loadout</strong> represents the gear and attires currently equipped to your Hunter body. Equipped gear awards permanent passive attribute bonuses (Strength, Focus, Vitality) that make your character stronger and level up faster!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(0, 210, 255, 0.08)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            <strong style={{ color: '#00f0ff', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
              💍 The E-Ring:
            </strong>
            <span style={{ color: '#7f9ebc', fontSize: '0.78rem' }}>
              Your awakened ring. Always keep it equipped for +2 Focus, +2 Vitality, and fatigue mitigation.
            </span>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <strong style={{ color: '#c084fc', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
              🎒 Hunter Backpack:
            </strong>
            <span style={{ color: '#7f9ebc', fontSize: '0.78rem' }}>
              Stores spare gear. Tap any item below and click <strong>“EQUIP”</strong> to activate its stat boosts.
            </span>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <strong style={{ color: '#34d399', fontSize: '0.84rem', display: 'block', marginBottom: '2px' }}>
              ⚡ Active Stat Buffs:
            </strong>
            <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>
              {Object.keys(totalBonuses).length > 0
                ? Object.entries(totalBonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' | ')
                : 'No gear equipped'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="inventory-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left: 4 Active Equipped Slots */}
        <div className="hud-card equipped-loadout-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="card-heading" style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
              ACTIVE LOADOUT (4 SLOTS)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#00d2ff', fontFamily: 'var(--font-display)' }}>
              CURRENTLY WORN
            </span>
          </div>

          <div className="equipped-slots-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {slots.map(slot => {
              const equipped = equippedGear[slot.key];
              return (
                <div
                  key={slot.key}
                  className={`equipped-slot-card ${equipped ? 'filled' : 'empty'} rarity-${equipped?.rarity || 'common'}`}
                  onClick={() => equipped && handleSelect(equipped)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: equipped ? 'rgba(0, 210, 255, 0.08)' : 'rgba(10, 20, 38, 0.6)',
                    border: equipped ? '1px solid #00d2ff' : '1px dashed rgba(255, 255, 255, 0.15)',
                    cursor: equipped ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{slot.icon}</span>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#7f9ebc', display: 'block', textTransform: 'uppercase' }}>
                        {slot.label}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: equipped ? '#fff' : '#4a627a' }}>
                        {equipped ? equipped.name : '[Empty Slot]'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#7f9ebc', display: 'block', marginTop: '2px' }}>
                        {slot.realLifeRole}
                      </span>
                    </div>
                  </div>

                  {equipped ? (
                    <button
                      className="unequip-mini-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playPing();
                        onUnequipItem(slot.key);
                      }}
                      style={{
                        background: 'rgba(255, 51, 102, 0.15)',
                        border: '1px solid #ff3366',
                        color: '#ff3366',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      UNEQUIP
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#4a627a', fontFamily: 'var(--font-display)' }}>
                      UNOCCUPIED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Item Inspection Window */}
        <div className="hud-card item-inspector-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          {selectedItem ? (
            <div className="inspector-content">
              <div className="inspector-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className={`rarity-badge badge-${selectedItem.rarity}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                  {selectedItem.rarity.toUpperCase()} {selectedItem.slot.toUpperCase()}
                </span>
                <span className="item-icon-display" style={{ fontSize: '2rem' }}>{selectedItem.icon}</span>
              </div>

              <h3 className="inspector-title" style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#fff' }}>
                {selectedItem.name}
              </h3>
              <p className="inspector-desc" style={{ color: '#7f9ebc', fontSize: '0.86rem', marginBottom: '12px', lineHeight: '1.4' }}>
                {selectedItem.description}
              </p>

              <div className="inspector-lore-box" style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                <span className="lore-heading" style={{ fontSize: '0.72rem', color: '#00d2ff', display: 'block', marginBottom: '4px' }}>
                  ✦ ITEM LORE:
                </span>
                <p className="lore-text" style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem', color: '#b9d2eb' }}>
                  “{selectedItem.lore}”
                </p>
              </div>

              {/* Stat Bonuses */}
              <div className="inspector-stats-box" style={{ marginBottom: '14px' }}>
                <span className="stats-heading" style={{ fontSize: '0.75rem', color: '#ffd700', display: 'block', marginBottom: '6px' }}>
                  ATTRIBUTE BONUSES AWARDED:
                </span>
                <div className="stats-pills-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(selectedItem.statBonus).map(([attr, val]) => (
                    <span
                      key={attr}
                      className="stat-pill"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      +{val} {attr.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {selectedItem.specialEffect && (
                <div className="special-effect-box" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '8px 10px', borderRadius: '6px', marginBottom: '16px' }}>
                  <span className="fx-label" style={{ fontSize: '0.72rem', color: '#c084fc', display: 'block' }}>
                    PASSIVE SYSTEM RESONANCE:
                  </span>
                  <span className="fx-text" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                    ✦ {selectedItem.specialEffect}
                  </span>
                </div>
              )}

              <div className="inspector-action-row">
                <button
                  className="hud-btn-primary"
                  onClick={() => handleEquipToggle(selectedItem)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.92rem',
                    background: selectedItem.isEquipped
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.4))'
                      : 'linear-gradient(135deg, #00b4d8, #0077b6)',
                    borderColor: selectedItem.isEquipped ? '#ef4444' : '#00f0ff'
                  }}
                >
                  {selectedItem.isEquipped ? '✕ UNEQUIP FROM HUNTER' : '⚡ EQUIP ITEM TO HUNTER BODY'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-inspector" style={{ textAlign: 'center', padding: '40px 20px', color: '#7f9ebc' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🎒</span>
              <p>Select any item from your Backpack below to view its real-world perks and equip it.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Backpack Grid */}
      <div className="hud-card inventory-backpack-card">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="card-heading" style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
            HUNTER BACKPACK ({inventory.length} RELICS & GEAR)
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#7f9ebc' }}>
            Tap an item to inspect or equip
          </span>
        </div>

        <div className="backpack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {inventory.map(item => (
            <div
              key={item.id}
              className={`backpack-item-cell rarity-${item.rarity} ${selectedItem?.id === item.id ? 'active' : ''} ${item.isEquipped ? 'equipped' : ''}`}
              onClick={() => handleSelect(item)}
              style={{
                background: selectedItem?.id === item.id ? 'rgba(0, 210, 255, 0.2)' : 'rgba(10, 20, 38, 0.7)',
                border: selectedItem?.id === item.id ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              role="button"
              tabIndex={0}
            >
              <span className="item-cell-icon" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{item.icon}</span>
              <span className="item-cell-name" style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>{item.name}</span>
              {item.isEquipped && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#00f0ff',
                    color: '#060c1a',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '3px'
                  }}
                >
                  EQUIPPED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
