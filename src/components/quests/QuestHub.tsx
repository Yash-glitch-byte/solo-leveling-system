import React, { useState } from 'react';
import { Quest, QuestCategory, QuestDifficulty, AttributeKey } from '../../types';
import { XP_BY_DIFFICULTY } from '../../game/progression';
import { soundEngine } from '../../game/sound';

interface QuestHubProps {
  quests: Quest[];
  onToggleQuest: (questId: string) => void;
  onToggleSubtask: (questId: string, subtaskId: string) => void;
  onAddQuest: (newQuest: Quest) => void;
  onDeleteQuest: (questId: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  onOpenBatchEvidence?: () => void;
}

export const QuestHub: React.FC<QuestHubProps> = ({
  quests,
  onToggleQuest,
  onToggleSubtask,
  onAddQuest,
  onDeleteQuest,
  isCreateModalOpen,
  setIsCreateModalOpen,
  onOpenBatchEvidence
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form State for New Quest
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('coding');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('normal');
  const [duration, setDuration] = useState<number>(30);
  const [attribute, setAttribute] = useState<AttributeKey>('intelligence');
  const [isDaily, setIsDaily] = useState<boolean>(true);
  const [subtasksInput, setSubtasksInput] = useState<string>('');

  const categories = [
    { id: 'all', label: 'ALL DOMAINS' },
    { id: 'fitness', label: 'FITNESS' },
    { id: 'coding', label: 'CODING' },
    { id: 'study', label: 'STUDY' },
    { id: 'career', label: 'CAREER' },
    { id: 'discipline', label: 'DISCIPLINE' },
    { id: 'communication', label: 'COMMUNICATION' }
  ];

  const filteredQuests = quests.filter(q => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedStatus === 'available' && q.status !== 'available') return false;
    if (selectedStatus === 'completed' && q.status !== 'completed') return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedSubtasks = subtasksInput
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map((text, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: text,
        completed: false
      }));

    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Custom Player Objective',
      category,
      difficulty,
      durationMinutes: duration,
      attribute,
      xpReward: XP_BY_DIFFICULTY[difficulty],
      attributePoints: difficulty === 'epic' ? 4 : difficulty === 'hard' ? 3 : 2,
      subtasks: parsedSubtasks,
      status: 'available',
      isDaily
    };

    onAddQuest(newQuest);
    soundEngine.playPing();
    setIsCreateModalOpen(false);
    // Reset fields
    setTitle('');
    setDescription('');
    setSubtasksInput('');
  };

  return (
    <div className="quest-hub-container">
      {/* Top Controls & Filter Bar */}
      <div className="quest-hub-header">
        <div>
          <span className="hud-tag">[OBJECTIVES REGISTRY]</span>
          <h2 className="section-title">QUEST & MISSION CENTER</h2>
        </div>
        <div className="quest-hub-header-actions" style={{ display: 'flex', gap: '10px' }}>
          {onOpenBatchEvidence && (
            <button
              className="hud-btn-secondary batch-quest-trigger-btn"
              onClick={() => {
                soundEngine.playPing();
                onOpenBatchEvidence();
              }}
              title="Submit shared evidence, quiz, or code repo to complete multiple related missions at once"
            >
              📦 BATCH EVIDENCE
            </button>
          )}
          <button
            className="hud-btn-primary add-quest-trigger-btn"
            onClick={() => {
              soundEngine.playPing();
              setIsCreateModalOpen(true);
            }}
          >
            + CREATE CUSTOM QUEST
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="quest-filters-bar">
        <div className="category-chips-list">
          {categories.map(c => (
            <button
              key={c.id}
              className={`filter-chip ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playPing();
                setSelectedCategory(c.id);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="status-toggle-group">
          <button
            className={`status-chip ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('all')}
          >
            ALL ({quests.length})
          </button>
          <button
            className={`status-chip ${selectedStatus === 'available' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('available')}
          >
            AVAILABLE ({quests.filter(q => q.status === 'available').length})
          </button>
          <button
            className={`status-chip ${selectedStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('completed')}
          >
            COMPLETED ({quests.filter(q => q.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="quests-grid">
        {filteredQuests.length === 0 ? (
          <div className="empty-quests-box">
            <span className="empty-icon">📜</span>
            <h3>No missions match this filter</h3>
            <p>Assign a new custom quest to begin your next progression cycle.</p>
          </div>
        ) : (
          filteredQuests.map(q => {
            const isCompleted = q.status === 'completed';
            const verifStatus = q.verificationStatus || (q.verificationTier === 'sensor_verified' ? 'verified' : q.verificationTier === 'self_reported' ? 'self_reported' : 'supported');
            return (
              <div key={q.id} className={`hud-card quest-card ${isCompleted ? 'quest-done' : ''}`}>
                <div className="card-corner tl" />
                <div className="card-corner tr" />
                <div className="card-corner bl" />
                <div className="card-corner br" />

                <div className="quest-card-top">
                  <div className="card-badges">
                    <span className="badge category-badge">{q.category.toUpperCase()}</span>
                    <span className={`badge diff-badge diff-${q.difficulty}`}>
                      {q.difficulty.toUpperCase()}
                    </span>
                    {q.isDaily && <span className="badge daily-badge">DAILY</span>}
                    {isCompleted && (
                      <span className={`badge verif-status-badge verif-${verifStatus}`}>
                        {verifStatus === 'verified' ? '🛡️ VERIFIED' : verifStatus === 'supported' ? '📝 SUPPORTED' : '📋 SELF-REPORTED'}
                      </span>
                    )}
                  </div>
                  <button
                    className="quest-delete-btn"
                    onClick={() => onDeleteQuest(q.id)}
                    title="Delete quest"
                    aria-label="Delete quest"
                  >
                    ✕
                  </button>
                </div>

                <div className="quest-card-main">
                  <div className="quest-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleQuest(q.id)}
                      className="hud-checkbox large"
                      id={`check-${q.id}`}
                    />
                    <label htmlFor={`check-${q.id}`} className="quest-card-title">
                      {q.title}
                    </label>
                  </div>

                  <p className="quest-card-desc">{q.description}</p>

                  {/* Subtask Checklist */}
                  {q.subtasks && q.subtasks.length > 0 && (
                    <div className="quest-subtasks-block">
                      <span className="subtasks-label">OBJECTIVES CHECKLIST:</span>
                      <div className="subtasks-items">
                        {q.subtasks.map(sub => (
                          <div
                            key={sub.id}
                            className={`subtask-item ${sub.completed ? 'done' : ''}`}
                            onClick={() => onToggleSubtask(q.id, sub.id)}
                          >
                            <span className="subtask-box">{sub.completed ? '✓' : '○'}</span>
                            <span className="subtask-text">{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="quest-card-footer">
                  <div className="quest-affinity-info">
                    <span>AFFINITY: <strong>{q.attribute.toUpperCase()}</strong></span>
                    <span>• {q.durationMinutes} MINS</span>
                  </div>
                  <div className="quest-xp-reward">
                    <span>+{q.xpReward} EXP</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE QUEST MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="hud-card create-quest-modal">
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />

            <div className="modal-header">
              <span className="hud-tag">[QUEST ASSIGNMENT PROTOCOL]</span>
              <h3>REGISTER NEW MISSION</h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="create-quest-form">
              <div className="form-group">
                <label>Quest Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Implement Binary Search Tree in C++"
                  className="hud-input"
                />
              </div>

              <div className="form-group">
                <label>Description / Objective Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is the exact definition of done for this quest?"
                  className="hud-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Domain Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as QuestCategory)}
                    className="hud-select"
                  >
                    <option value="coding">Coding & Algorithms</option>
                    <option value="fitness">Fitness & Body</option>
                    <option value="study">Study & Academic</option>
                    <option value="career">Career & Portfolio</option>
                    <option value="discipline">Discipline & Routines</option>
                    <option value="communication">Communication</option>
                    <option value="personal">Personal Goal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty Rating</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as QuestDifficulty)}
                    className="hud-select"
                  >
                    <option value="easy">Easy (+15 XP)</option>
                    <option value="normal">Normal (+30 XP)</option>
                    <option value="hard">Hard (+60 XP)</option>
                    <option value="epic">Epic (+120 XP)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Attribute Resonance</label>
                  <select
                    value={attribute}
                    onChange={e => setAttribute(e.target.value as AttributeKey)}
                    className="hud-select"
                  >
                    <option value="intelligence">Intelligence (INT)</option>
                    <option value="focus">Focus (FOC)</option>
                    <option value="strength">Strength (STR)</option>
                    <option value="vitality">Vitality (VIT)</option>
                    <option value="discipline">Discipline (DIS)</option>
                    <option value="career">Career (CAR)</option>
                    <option value="communication">Communication (COM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration: {duration} Minutes</label>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="hud-slider"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Checklist Subtasks (One per line)</label>
                <textarea
                  rows={3}
                  value={subtasksInput}
                  onChange={e => setSubtasksInput(e.target.value)}
                  placeholder="Step 1: Write tests&#10;Step 2: Implement logic&#10;Step 3: Verify clean code"
                  className="hud-textarea"
                />
              </div>

              <div className="form-checkbox-row">
                <input
                  type="checkbox"
                  id="dailyCheck"
                  checked={isDaily}
                  onChange={e => setIsDaily(e.target.checked)}
                  className="hud-checkbox"
                />
                <label htmlFor="dailyCheck">Pin to Daily Habit Checklist</label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="hud-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="hud-btn-primary">
                  ✦ REGISTER QUEST ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
