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
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

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

  const slots: Array<{ key: keyof EquippedGear; label: string; icon: string }> = [
    { key: 'weapon', label: 'WEAPON', icon: '🗡️' },
    { key: 'armor', label: 'ARMOR', icon: '🛡️' },
    { key: 'ring', label: 'RING (E-RING)', icon: '💍' },
    { key: 'accessory', label: 'ACCESSORY', icon: '📿' }
  ];

  return (
    <div className="inventory-view-container">
      {/* Top Header */}
      <div className="inventory-header">
        <div>
          <span className="hud-tag">[HUNTER VAULT & EQUIPMENT SLOTS]</span>
          <h2 className="section-title">EQUIPMENT & INVENTORY MATRIX</h2>
        </div>
        <button
          className="hud-btn-secondary tutorial-pill-btn"
          onClick={() => {
            soundEngine.playPing();
            setShowTutorial(!showTutorial);
          }}
        >
          📖 EQUIPMENT TUTORIAL
        </button>
      </div>

      {/* Equipment Tutorial Banner */}
      {showTutorial && (
        <div className="hud-card equipment-tutorial-banner">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h4 className="tutorial-title">✦ HOW EQUIPMENT & THE E-RING OPERATE</h4>
          <p className="tutorial-text">
            Equipment directly multiplies your biological and cognitive attributes. Gear provides passive resistance to burnout, increases XP from coding/study quests, and prevents fatigue accumulation.
          </p>
          <ul className="tutorial-bullets">
            <li><strong>The E-Ring</strong>: Bestowed to all awakened hunters. Keep it equipped in your Ring slot for permanent +2 Vitality, +2 Focus, and -15% fatigue mitigation.</li>
            <li><strong>Weapons & Armor</strong>: Enhance Strength and physical stamina during workout routines.</li>
            <li><strong>Accessories</strong>: Amplify deep focus durations in Instant Dungeon chambers.</li>
          </ul>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="inventory-layout-grid">
        {/* Left: Equipped Gear Loadout */}
        <div className="hud-card equipped-loadout-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h3 className="card-heading">ACTIVE LOADOUT SLOTS</h3>

          <div className="equipped-slots-grid">
            {slots.map(slot => {
              const equipped = equippedGear[slot.key];
              return (
                <div
                  key={slot.key}
                  className={`equipped-slot-card ${equipped ? 'filled' : 'empty'} rarity-${equipped?.rarity || 'common'}`}
                  onClick={() => equipped && handleSelect(equipped)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="slot-meta">
                    <span className="slot-icon">{slot.icon}</span>
                    <span className="slot-name">{slot.label}</span>
                  </div>

                  {equipped ? (
                    <div className="slot-equipped-info">
                      <h4 className="equipped-item-title">{equipped.name}</h4>
                      <span className="equipped-item-rarity">{equipped.rarity.toUpperCase()}</span>
                      <button
                        className="unequip-mini-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnequipItem(slot.key);
                        }}
                      >
                        UNEQUIP
                      </button>
                    </div>
                  ) : (
                    <div className="slot-empty-notice">
                      <span>[EMPTY SLOT]</span>
                    </div>
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
              <div className="inspector-top-row">
                <span className={`rarity-badge badge-${selectedItem.rarity}`}>
                  {selectedItem.rarity.toUpperCase()} {selectedItem.slot.toUpperCase()}
                </span>
                <span className="item-icon-display">{selectedItem.icon}</span>
              </div>

              <h3 className="inspector-title">{selectedItem.name}</h3>
              <p className="inspector-desc">{selectedItem.description}</p>

              <div className="inspector-lore-box">
                <span className="lore-heading">RELIC LORE:</span>
                <p className="lore-text">“{selectedItem.lore}”</p>
              </div>

              {/* Stat Bonuses */}
              <div className="inspector-stats-box">
                <span className="stats-heading">ATTRIBUTE BONUSES:</span>
                <div className="stats-pills-row">
                  {Object.entries(selectedItem.statBonus).map(([attr, val]) => (
                    <span key={attr} className="stat-pill">
                      +{val} {attr.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {selectedItem.specialEffect && (
                <div className="special-effect-box">
                  <span className="fx-label">PASSIVE RESONANCE:</span>
                  <span className="fx-text">✦ {selectedItem.specialEffect}</span>
                </div>
              )}

              <div className="inspector-action-row">
                <button
                  className={`hud-btn-primary ${selectedItem.isEquipped ? 'unequip-style' : 'equip-style'}`}
                  onClick={() => handleEquipToggle(selectedItem)}
                >
                  {selectedItem.isEquipped ? 'UNEQUIP FROM LOADOUT' : '✦ EQUIP TO ACTIVE SLOT'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-inspector">
              <p>Select an item from inventory to inspect attributes and relic lore.</p>
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

        <h3 className="card-heading">INVENTORY BACKPACK ({inventory.length} RELICS)</h3>

        <div className="backpack-grid">
          {inventory.map(item => (
            <div
              key={item.id}
              className={`backpack-item-cell rarity-${item.rarity} ${selectedItem?.id === item.id ? 'active' : ''} ${item.isEquipped ? 'equipped' : ''}`}
              onClick={() => handleSelect(item)}
              role="button"
              tabIndex={0}
            >
              <span className="item-cell-icon">{item.icon}</span>
              <span className="item-cell-name">{item.name}</span>
              {item.isEquipped && <span className="cell-equipped-tag">EQUIPPED</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
