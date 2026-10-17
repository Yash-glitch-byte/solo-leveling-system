import React, { useState } from 'react';
import { Competition, QuestCategory, PlayerProfile } from '../../types';
import { soundEngine } from '../../game/sound';

interface CompetitionHubProps {
  competitions: Competition[];
  player: PlayerProfile;
  onJoinCompetition: (compId: string) => void;
  onClaimVictoryReward: (compId: string) => void;
  onCreateCompetition: (newComp: Competition) => void;
}

export const CompetitionHub: React.FC<CompetitionHubProps> = ({
  competitions,
  player,
  onJoinCompetition,
  onClaimVictoryReward,
  onCreateCompetition
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCompId, setActiveCompId] = useState<string | null>(competitions[0]?.id || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Competition Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<QuestCategory>('coding');
  const [newDurationDays, setNewDurationDays] = useState<number>(7);
  const [newRules, setNewRules] = useState('Verified submissions score 100 pts. Quizzes and code links score 70 pts. Self-reports score 30 pts.');

  const filteredCompetitions = competitions.filter(c => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const selectedComp = competitions.find(c => c.id === activeCompId) || competitions[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundEngine.playLevelUp();
    const startDate = new Date().toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + newDurationDays * 86400000).toISOString().slice(0, 10);

    const comp: Competition = {
      id: `comp-custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom Hunter Arena Competition',
      category: newCat,
      startDate,
      endDate,
      status: 'active',
      rules: newRules,
      scoringCriteria: 'Verified: 100 pts | Supported: 70 pts | Self-Report: 30 pts',
      rewardXp: newDurationDays >= 14 ? 350 : 200,
      rewardTitle: `${newTitle.trim()} Conqueror`,
      joined: true,
      participants: [
        {
          hunterId: player.hunterId || 'HNT-ME',
          name: player.name || 'You',
          avatarIcon: player.avatarIcon || '⚡',
          rank: player.rank,
          score: 100,
          verifiedActions: 1,
          selfReportedActions: 0,
          isCurrentUser: true
        }
      ]
    };

    onCreateCompetition(comp);
    setActiveCompId(comp.id);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="competition-hub-container" style={{ maxWidth: '1020px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="hud-tag" style={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
            ● ARENA COMPETITIONS & VERIFIED LEADERBOARDS
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0 0 0', color: '#fff', fontSize: '1.4rem' }}>
            HUNTER COMPETITION ARENA
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#7f9ebc' }}>
            Participate in timed challenges. Scores strictly differentiate verified evidence from lightweight self-reports.
          </span>
        </div>

        <button
          onClick={() => { soundEngine.playPing(); setIsCreateModalOpen(true); }}
          className="hud-btn-primary"
          style={{ padding: '10px 16px', fontSize: '0.82rem', borderColor: '#f59e0b', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)' }}
        >
          + CREATE CUSTOM CHALLENGE
        </button>
      </div>

      {/* Domain Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {['all', 'coding', 'fitness', 'study', 'discipline'].map(cat => (
          <button
            key={cat}
            onClick={() => { soundEngine.playPing(); setSelectedCategory(cat); }}
            className={`hud-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.78rem', textTransform: 'uppercase' }}
          >
            {cat === 'all' ? '✦ ALL LEAGUES' : cat}
          </button>
        ))}
      </div>

      {/* Arena Split View: List on Left, Detail & Leaderboard on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="competition-split-grid">
        {/* LEFT COLUMN: Challenges Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCompetitions.map(comp => {
            const isSelected = comp.id === selectedComp?.id;
            return (
              <div
                key={comp.id}
                onClick={() => { soundEngine.playPing(); setActiveCompId(comp.id); }}
                className="hud-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                  position: 'relative'
                }}
              >
                <div className="card-corner tl" style={{ borderColor: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)' }} />
                <div className="card-corner tr" style={{ borderColor: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)' }} />
                <div className="card-corner bl" style={{ borderColor: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)' }} />
                <div className="card-corner br" style={{ borderColor: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#00d2ff', textTransform: 'uppercase', fontWeight: 800 }}>
                    {comp.category.toUpperCase()} ARENA
                  </span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: comp.joined ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: comp.joined ? '#34d399' : '#7f9ebc', fontWeight: 700 }}>
                    {comp.joined ? '✓ REGISTERED' : 'UNENROLLED'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {comp.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#7f9ebc', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                  {comp.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
                  <span>⏳ Ends: {comp.endDate}</span>
                  <strong style={{ color: '#fbbf24' }}>🏆 +{comp.rewardXp} EXP</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Challenge Detail & Transparent Leaderboard */}
        {selectedComp && (
          <div className="hud-card" style={{ padding: '20px', position: 'relative' }}>
            <div className="card-corner tl" style={{ borderColor: '#00f0ff' }} />
            <div className="card-corner tr" style={{ borderColor: '#00f0ff' }} />
            <div className="card-corner bl" style={{ borderColor: '#00f0ff' }} />
            <div className="card-corner br" style={{ borderColor: '#00f0ff' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span className="hud-tag" style={{ borderColor: '#00f0ff', color: '#00f0ff' }}>
                  ARENA DOSSIER & SCORING MATRIX
                </span>
                <h3 style={{ margin: '6px 0 0 0', color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  {selectedComp.title}
                </h3>
              </div>

              {(() => {
                const userPart = selectedComp.participants.find(p => p.isCurrentUser);
                const userScore = userPart ? userPart.score : 0;
                const isEnded = new Date().toISOString().slice(0, 10) >= selectedComp.endDate;

                if (!selectedComp.joined) {
                  return (
                    <button
                      onClick={() => { soundEngine.playLevelUp(); onJoinCompetition(selectedComp.id); }}
                      className="hud-btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                    >
                      ENTER ARENA
                    </button>
                  );
                }

                if (selectedComp.claimed) {
                  return (
                    <button
                      className="hud-btn-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.78rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                      disabled
                    >
                      ✓ REWARDS CLAIMED
                    </button>
                  );
                }

                if (userScore <= 0 && !isEnded) {
                  return (
                    <button
                      className="hud-btn-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.78rem',
                        background: 'rgba(0, 210, 255, 0.05)',
                        borderColor: 'rgba(0, 210, 255, 0.25)',
                        color: '#7f9ebc',
                        cursor: 'not-allowed'
                      }}
                      title="Log verified tasks to score points before claiming arena victory rewards"
                      disabled
                    >
                      ⏳ ARENA IN PROGRESS
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => { soundEngine.playLevelUp(); onClaimVictoryReward(selectedComp.id); }}
                    className="hud-btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.78rem', background: '#10b981', borderColor: '#10b981', color: '#051810' }}
                  >
                    CLAIM REWARDS
                  </button>
                );
              })()}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#e0f2fe', margin: '0 0 14px 0', lineHeight: '1.45' }}>
              {selectedComp.description}
            </p>

            {/* Transparent Scoring Formula */}
            <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Transparent Scoring Calculation
              </span>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.76rem', color: '#7f9ebc' }}>
                {selectedComp.scoringCriteria}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
                <span style={{ color: '#34d399' }}>✓ Verified: 100 Pts</span>
                <span style={{ color: '#38bdf8' }}>📄 Supported: 70 Pts</span>
                <span style={{ color: '#94a3b8' }}>⏱️ Self-Report: 30 Pts</span>
              </div>
            </div>

            {/* Real Authenticated Leaderboard */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#fff', fontSize: '0.86rem', textTransform: 'uppercase' }}>
                  Arena Leaderboard ({selectedComp.participants.length} Hunter{selectedComp.participants.length === 1 ? '' : 's'})
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#7f9ebc' }}>Ranked by Points</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedComp.participants
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div
                      key={p.hunterId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: p.isCurrentUser ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: p.isCurrentUser ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: idx === 0 ? '#fbbf24' : '#7f9ebc', fontWeight: 800 }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '1.2rem' }}>{p.avatarIcon}</span>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.86rem', display: 'block' }}>
                            {p.name} {p.isCurrentUser && '(You)'}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#7f9ebc' }}>
                            {p.rank} • {p.verifiedActions} Verified Proofs
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
                          {p.score}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#7f9ebc' }}>PTS</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Custom Challenge Modal */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="hud-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontFamily: 'var(--font-display)' }}>
              CREATE CUSTOM ARENA CHALLENGE
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#7f9ebc', margin: '0 0 16px 0' }}>
              Launch a timed challenge for your guild or self-progression with fair scoring.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#00d2ff', display: 'block', marginBottom: '4px' }}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 10-Day DSA Mastery Sprint"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid #00d2ff', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What is the objective of this challenge?"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>Domain</label>
                  <select
                    value={newCat}
                    onChange={e => setNewCat(e.target.value as QuestCategory)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                  >
                    <option value="coding">Coding</option>
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                    <option value="discipline">Discipline</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>Duration</label>
                  <select
                    value={newDurationDays}
                    onChange={e => setNewDurationDays(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={21}>21 Days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="hud-btn-primary" style={{ flex: 1, padding: '10px' }}>
                  LAUNCH ARENA CHALLENGE
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#7f9ebc', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
