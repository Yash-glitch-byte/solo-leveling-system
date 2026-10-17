import React, { useState } from 'react';
import { soundEngine } from '../../game/sound';

interface InteractiveTutorialProps {
  onClose: () => void;
  onCompleteTutorial: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onClose,
  onCompleteTutorial
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const tutorialSteps = [
    {
      title: 'WELCOME TO SYSTEM REAWAKEN',
      badge: 'PROTOCOL 01',
      icon: '⚡',
      headline: 'The Real-Life RPG Progression Engine',
      description: 'System Reawaken turns your daily actions into a character leveling journey. You begin as an E-Rank hunter and advance by taking real-world action across fitness, coding, study, career, and discipline.',
      tip: 'Remember: Real progress in the real world is what powers your Hunter rank.'
    },
    {
      title: 'STATUS WINDOW & ATTRIBUTES',
      badge: 'PROTOCOL 02',
      icon: '📊',
      headline: 'Level, EXP & Character Attributes',
      description: 'Every quest grants EXP and boosts specific attributes: Strength (physical), Vitality (recovery), Intelligence (learning), Focus (deep work), Discipline (habits), Career (portfolio/interviews), and Communication (networking/speaking). Leveling up grants +3 free stat points to allocate however you wish.',
      tip: 'Tap the "+" button next to any attribute on your Status Window to spend points.'
    },
    {
      title: 'THE E-RING & EQUIPMENT',
      badge: 'PROTOCOL 03',
      icon: '💍',
      headline: 'Equipping Relics & The E-Ring of Origin',
      description: 'As an awakened hunter, you are equipped with The E-Ring in your Ring slot. It provides +2 Vitality, +2 Focus, and mitigates -15% fatigue penalty when you miss daily tasks. Equip weapons, armor, and accessories to boost your focus.',
      tip: 'Inspect items in the INVENTORY tab to view relic lore and stat multipliers.'
    },
    {
      title: 'INSTANT DUNGEONS (FOCUS CHAMBER)',
      badge: 'PROTOCOL 04',
      icon: '🗝️',
      headline: 'Zero-Distraction Timed Sprints',
      description: 'Enter a Dungeon Chamber to lock in for 20 to 60 minutes of uninterrupted study or coding. Our timer is resilient: it maintains exact second-by-second accuracy even if your browser tab sleeps or refreshes.',
      tip: 'Clearing a dungeon chamber grants bonus Focus points and relieves 20% fatigue!'
    },
    {
      title: 'THE PSEUDO MONARCH SYSTEM',
      badge: 'PROTOCOL 05',
      icon: '👑',
      headline: 'Sovereign Shadow Authority',
      description: 'Upon attaining Level 5 (or vanquishing a Milestone Boss), you unlock the Pseudo Monarch system. Extract iconic shadow commanders (Igris, Tank, Iron, Beru) into your vanguard to gain permanent passive combat multipliers.',
      tip: 'Ruler\'s Authority boosts focus chamber EXP by +15% permanently.'
    },
    {
      title: 'CLOUD SYNC & OFFLINE PROTOCOL',
      badge: 'PROTOCOL 06',
      icon: '☁️',
      headline: 'Play on Mobile & PC Seamlessly',
      description: 'Your progress is saved locally first, so you can play 100% offline. Enable Cloud Sync in Settings to continue with the same hunter profile across your phone and PC without losing levels.',
      tip: 'You can also export a JSON save file anytime in Settings for safe backup.'
    }
  ];

  const stepData = tutorialSteps[currentStep];

  const handleNext = () => {
    soundEngine.playPing();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      soundEngine.playLevelUp();
      onCompleteTutorial();
      onClose();
    }
  };

  const handlePrev = () => {
    soundEngine.playPing();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="hud-card tutorial-modal-card">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div className="tutorial-header">
          <span className="hud-tag">[SYSTEM TUTORIAL ARCHIVE]</span>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close tutorial">
            ✕
          </button>
        </div>

        <div className="tutorial-card-body">
          <div className="tutorial-badge-row">
            <span className="step-badge">{stepData.badge}</span>
            <span className="step-counter">STEP {currentStep + 1} OF {tutorialSteps.length}</span>
          </div>

          <div className="tutorial-icon-display">{stepData.icon}</div>
          <h2 className="tutorial-headline">{stepData.headline}</h2>
          <p className="tutorial-body-text">{stepData.description}</p>

          <div className="tutorial-tip-box">
            <span className="tip-tag">SYSTEM TIP:</span>
            <span className="tip-text">{stepData.tip}</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="tutorial-footer-actions">
          <button
            className="hud-btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            ← PREVIOUS
          </button>

          <div className="tutorial-dots-nav">
            {tutorialSteps.map((_, i) => (
              <span
                key={i}
                className={`tut-dot ${i === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(i)}
              />
            ))}
          </div>

          <button className="hud-btn-primary" onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? '✦ COMPLETE TUTORIAL' : 'NEXT STEP →'}
          </button>
        </div>
      </div>
    </div>
  );
};
