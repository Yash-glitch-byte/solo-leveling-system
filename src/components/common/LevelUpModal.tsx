import React from 'react';
import { LevelUpResult } from '../../game/progression';
import { soundEngine } from '../../game/sound';

interface LevelUpModalProps {
  result: LevelUpResult;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ result, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="hud-card levelup-ceremony-modal">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div className="levelup-aura-glow"></div>

        <div className="levelup-pill">[ SYSTEM ANNOUNCEMENT ]</div>
        <h1 className="levelup-heading">LEVEL UP ACHIEVED!</h1>
        <div className="new-level-display">
          <span className="lvl-prefix">NEW LEVEL</span>
          <span className="lvl-digits">{result.newLevel}</span>
        </div>

        {result.didRankUp && (
          <div className="rank-up-banner">
            ✦ HUNTER RANK PROMOTION: <strong>{result.newRank.toUpperCase()}</strong> ✦
          </div>
        )}

        <div className="levelup-rewards-box">
          <div className="reward-line">
            <span className="reward-bullet">✦</span>
            <span>+{result.statPointsAwarded} Free Stat Points Allocated</span>
          </div>
          <div className="reward-line">
            <span className="reward-bullet">✦</span>
            <span>Biological Fatigue Relieved (-30%)</span>
          </div>
          <div className="reward-line">
            <span className="reward-bullet">✦</span>
            <span>Synaptic Focus Multiplier Strengthened</span>
          </div>
        </div>

        <button
          className="hud-btn-primary claim-levelup-btn"
          onClick={() => {
            soundEngine.playPing();
            onClose();
          }}
        >
          CLAIM REWARDS & CONTINUE
        </button>
      </div>
    </div>
  );
};
