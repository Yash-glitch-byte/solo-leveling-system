import React, { useState } from 'react';
import { WorkoutLogEntry, WorkoutSet } from '../../types';
import { soundEngine } from '../../game/sound';

interface FitnessTrackerProps {
  workoutLogs: WorkoutLogEntry[];
  onAddWorkout: (entry: WorkoutLogEntry) => void;
}

export const FitnessTracker: React.FC<FitnessTrackerProps> = ({ workoutLogs, onAddWorkout }) => {
  const [exerciseName, setExerciseName] = useState<string>('Push-ups');
  const [durationMins, setDurationMins] = useState<number>(20);
  const [notes, setNotes] = useState<string>('');
  const [sets, setSets] = useState<WorkoutSet[]>([
    { reps: 12, weightKg: 0 },
    { reps: 12, weightKg: 0 },
    { reps: 10, weightKg: 0 }
  ]);

  const addSet = () => {
    soundEngine.playPing();
    const last = sets[sets.length - 1] || { reps: 10, weightKg: 0 };
    setSets([...sets, { reps: last.reps, weightKg: last.weightKg }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      soundEngine.playPing();
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: keyof WorkoutSet, val: number) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: val };
    setSets(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    soundEngine.playQuestComplete();
    const newEntry: WorkoutLogEntry = {
      id: `wlog-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      exerciseName: exerciseName.trim(),
      sets,
      durationMinutes: durationMins,
      notes: notes.trim()
    };

    onAddWorkout(newEntry);
    setNotes('');
  };

  const popularExercises = ['Push-ups', 'Pull-ups', 'Barbell Squats', 'Deadlifts', 'Dumbbell Press', 'Plank', 'Running / Cardio'];

  return (
    <div className="fitness-tracker-container">
      {/* Header */}
      <div className="fitness-header">
        <div>
          <span className="hud-tag">[BIOLOGICAL CALIBRATION]</span>
          <h2 className="section-title">FITNESS & HEALTH LOGGING</h2>
        </div>
        <p className="fitness-subtitle">
          Log physical training sets, repetitions, and cardiovascular exertion. Consistency here directly feeds your Strength & Vitality attributes.
        </p>
      </div>

      <div className="fitness-layout-grid">
        {/* Left Form: Workout Logger */}
        <div className="hud-card workout-logger-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h3 className="card-heading">RECORD PHYSICAL SESSION</h3>

          <form onSubmit={handleSubmit} className="workout-form">
            <div className="form-group">
              <label>Exercise Name</label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={e => setExerciseName(e.target.value)}
                className="hud-input"
                placeholder="e.g. Weighted Pull-ups"
              />
              <div className="quick-exercise-chips">
                {popularExercises.map(ex => (
                  <button
                    key={ex}
                    type="button"
                    className="quick-chip"
                    onClick={() => {
                      soundEngine.playPing();
                      setExerciseName(ex);
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Duration: {durationMins} Minutes</label>
              <input
                type="range"
                min={5}
                max={90}
                step={5}
                value={durationMins}
                onChange={e => setDurationMins(Number(e.target.value))}
                className="hud-slider"
              />
            </div>

            {/* Dynamic Sets Table */}
            <div className="sets-table-box">
              <div className="sets-header-row">
                <span>SET</span>
                <span>REPS</span>
                <span>WEIGHT (KG)</span>
                <span>ACTION</span>
              </div>
              {sets.map((set, idx) => (
                <div key={idx} className="set-row">
                  <span className="set-num">#{idx + 1}</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={set.reps}
                    onChange={e => updateSet(idx, 'reps', Math.max(1, Number(e.target.value)))}
                    className="hud-input mini"
                  />
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={set.weightKg || 0}
                    onChange={e => updateSet(idx, 'weightKg', Math.max(0, Number(e.target.value)))}
                    className="hud-input mini"
                  />
                  <button
                    type="button"
                    className="delete-set-btn"
                    onClick={() => removeSet(idx)}
                    title="Remove set"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button type="button" className="add-set-row-btn" onClick={addSet}>
                + ADD SET
              </button>
            </div>

            <div className="form-group">
              <label>Workout Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="RPE, energy level, form observations..."
                className="hud-input"
              />
            </div>

            <button type="submit" className="hud-btn-primary log-workout-btn">
              ✦ RECORD WORKOUT & RESTORE VITALITY ✦
            </button>
          </form>
        </div>

        {/* Right List: History of Logged Workouts */}
        <div className="hud-card workout-history-card">
          <div className="card-corner tl" />
          <div className="card-corner tr" />
          <div className="card-corner bl" />
          <div className="card-corner br" />

          <h3 className="card-heading">RECENT PHYSICAL SESSIONS</h3>

          {workoutLogs.length === 0 ? (
            <div className="empty-history-box">
              <span className="empty-icon">🏋️</span>
              <h4>No sessions logged yet</h4>
              <p>Record your first workout session to initiate biometric training history.</p>
            </div>
          ) : (
            <div className="history-entries-list">
              {workoutLogs.slice(-6).reverse().map(log => (
                <div key={log.id} className="history-log-item">
                  <div className="log-top">
                    <span className="log-exercise">{log.exerciseName}</span>
                    <span className="log-date">{log.date} • {log.durationMinutes}m</span>
                  </div>
                  <div className="log-sets-summary">
                    {log.sets.map((s, idx) => (
                      <span key={idx} className="set-tag">
                        Set {idx + 1}: {s.reps} reps {s.weightKg ? `@ ${s.weightKg}kg` : ''}
                      </span>
                    ))}
                  </div>
                  {log.notes && <p className="log-notes">“{log.notes}”</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
