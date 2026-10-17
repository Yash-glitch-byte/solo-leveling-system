import React, { useState } from 'react';
import { SkillNode } from '../../types';
import { soundEngine } from '../../game/sound';

interface SkillTreeViewProps {
  skills: SkillNode[];
  onUpgradeSkill: (skillId: string) => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({ skills, onUpgradeSkill }) => {
  const [activeTree, setActiveTree] = useState<'coding' | 'career' | 'fitness'>('coding');

  const filteredSkills = skills.filter(s => s.treeId === activeTree);

  const handleUpgrade = (skill: SkillNode) => {
    soundEngine.playLevelUp();
    onUpgradeSkill(skill.id);
  };

  return (
    <div className="skill-tree-container">
      {/* Header */}
      <div className="skill-tree-header">
        <div>
          <span className="hud-tag">[NEURAL PROGRESSION MATRIX]</span>
          <h2 className="section-title">SKILL TREE & MASTERY PATHS</h2>
        </div>

        {/* Tree Selector Tabs */}
        <div className="skill-tree-tabs">
          <button
            className={`tree-tab-btn ${activeTree === 'coding' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playPing();
              setActiveTree('coding');
            }}
          >
            💻 CODING & ARCHITECTURE
          </button>
          <button
            className={`tree-tab-btn ${activeTree === 'career' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playPing();
              setActiveTree('career');
            }}
          >
            💼 CAREER & ARTICULATION
          </button>
          <button
            className={`tree-tab-btn ${activeTree === 'fitness' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playPing();
              setActiveTree('fitness');
            }}
          >
            🏋️ PHYSICAL ENGINE
          </button>
        </div>
      </div>

      <p className="skill-tree-subtitle">
        Advance your real-world technical and physical abilities. Unlocking prerequisite nodes opens higher-tier disciplines.
      </p>

      {/* Nodes Grid */}
      <div className="skill-nodes-grid">
        {filteredSkills.map(node => {
          const isMax = node.level >= node.maxLevel;
          const isLocked = !node.unlocked;

          return (
            <div
              key={node.id}
              className={`hud-card skill-node-card ${isLocked ? 'locked' : ''} ${isMax ? 'maxed' : ''}`}
            >
              <div className="card-corner tl" />
              <div className="card-corner tr" />
              <div className="card-corner bl" />
              <div className="card-corner br" />

              <div className="node-top-row">
                <span className={`node-status-badge ${isLocked ? 'locked' : isMax ? 'mastered' : 'unlocked'}`}>
                  {isLocked ? 'LOCKED 🔒' : isMax ? 'MASTERED 👑' : `RANK ${node.level}/${node.maxLevel}`}
                </span>
                <div className="node-affinities">
                  {node.attributeAffinities.map(a => (
                    <span key={a} className="affinity-mini-tag">{a.slice(0, 3).toUpperCase()}</span>
                  ))}
                </div>
              </div>

              <h3 className="node-title">{node.title}</h3>
              <p className="node-desc">{node.description}</p>

              <div className="node-milestones-box">
                <span className="milestones-heading">MASTERY MILESTONES:</span>
                <ul className="milestones-list">
                  {node.milestones.map((m, idx) => (
                    <li key={idx} className={idx < node.level ? 'achieved' : ''}>
                      <span className="bullet">{idx < node.level ? '✓' : '○'}</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="node-footer">
                {!isLocked && !isMax && (
                  <button
                    className="hud-btn-primary upgrade-node-btn"
                    onClick={() => handleUpgrade(node)}
                  >
                    ✦ UPGRADE RANK (+1)
                  </button>
                )}
                {isMax && <div className="mastered-label">MAX RANK ACHIEVED</div>}
                {isLocked && <div className="prereq-label">Prerequisites required</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
