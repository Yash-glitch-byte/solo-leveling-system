# ⚔️ SYSTEM REAWAKEN — Real-Life RPG Self-Improvement System

> **[SYSTEM NOTIFICATION: A new Player has awakened.]**  
> Turn your daily life into a playable dark fantasy RPG. Execute focus sessions in Instant Dungeons, complete real-world habit quests, conquer milestone monarch bosses, advance across interactive skill trees, and level up your character attributes.

---

## ✨ System Architecture & Features

### 1. ⚡ Hunter Status & Character Matrix
- **Level & EXP Scaling**: Smooth mathematical curve (`calculateRequiredXp`) with progressive leveling and hunter ranks (`E-Rank` up to `National Level`).
- **Core Attributes**:
  - **STR (Strength)**: Physical training, resistance conditioning, and endurance.
  - **VIT (Vitality)**: Sleep hygiene, hydration, and biological recovery.
  - **INT (Intelligence)**: Deep study, conceptual synthesis, and reading.
  - **FOC (Focus)**: Uninterrupted focus chamber sessions.
  - **DIS (Discipline)**: Routine consistency and habit execution.
  - **CAR (Career)**: Technical projects, portfolio, and interview preparation.
  - **COM (Communication)**: Articulation, speaking, and interpersonal outreach.
- **Stat Point Allocation**: Earn free stat points on each level-up to customize your build.
- **Fatigue Gauge**: Biological fatigue accumulates during intense effort and is purged via recovery quests, sleep, and completed dungeons.

### 2. 📜 Quest & Mission Registry
- **Multi-Domain Habits**: Fitness, Programming & Tech Systems, Academic Study, Career Polish, Daily Discipline, and Communication.
- **Checklist Subtasks**: Break complex missions into bite-sized actionable steps.
- **Custom Quest Creation**: Define custom goals, difficulties (Easy, Normal, Hard, Epic), estimated duration, attribute resonance, and XP rewards.
- **Anti-Duplication Protection**: Prevents double-claiming while allowing flexible status management.

### 3. 🗝️ Instant Dungeons (Deep Focus Chamber)
- **Zero-Distraction Pomodoro Sanctum**: Dedicated focus screen with real-time countdown clock.
- **State Resilience**: Uses real-time delta timestamps so timers remain 100% accurate across browser tab suspension, navigation, or page reloads.
- **Chamber Templates**:
  - *Training Grounds* (Physical conditioning)
  - *Deep Theory* (Academic study)
  - *Algorithm Chamber* (Data structures & code implementation)
  - *Career Vault* (Portfolio & application sprints)
  - *Custom Forge* (User-configurable sprint timer and checklist)
- **Survival Rewards**: Conquering dungeons grants bonus EXP, +2 Focus attribute points, and fatigue relief.

### 4. 🌌 Challenge Campaigns
- **21-Day Awakening**: Momentum accelerator designed to forge unbreakable initial routines.
- **66-Day Evolution**: Comprehensive transformation protocol based on habit automation science.
- **Active Rest Days**: Built-in scheduled recovery days that protect mental stamina and celebrate rest rather than penalizing it.

### 5. 🗡️ Monarch Boss Battles
- Real-world milestone challenges that dismantle psychological barriers:
  - **Chronos, The Procrastination Monarch**: Conquered through scheduled phone-free deep work sprints.
  - **Null, The Algorithmic Leviathan**: Defeated by solving complex DSA problems and architecting clean systems.
  - **Vindicator, The Gatekeeper Sovereign**: Vanquished via recorded technical mock interviews and resume impact metrics.
  - **Aegis, The Iron Colossus**: Bested through rigorous physical training milestones.
- **Interactive Boss HP**: Each completed combat objective deals massive damage to the boss's HP bar.
- **Unique Titles**: Triumph awards permanent hunter titles such as *"Vanquisher of Delay"* and *"Code Architect"*.

### 6. 🌳 Neural Skill Trees
- Visual mastery paths spanning **Coding & Architecture**, **Career & Articulation**, and **Physical Engine**.
- Prerequisite-driven node unlocking with multi-tier ranks.

### 7. 🏋️ Biometric Fitness Tracker
- Log exercises, sets, reps, and resistance weights.
- History log with recent training summaries that feed directly into Strength and Vitality.

### 8. 🧠 Rule-Based System Advisor
- Analyzes daily workload to prevent schedule overload and burnout.
- Recommends the single highest-leverage next quest to eliminate decision paralysis.
- Issues motivational anime-style system alerts.

### 9. 📊 Pure SVG Analytics
- Lightweight client-side SVG visualizations:
  - 7-Day EXP Acquisition Velocity (Area chart)
  - Daily Focus Chamber Duration (Bar chart)
  - Mission Domain Distribution breakdown
- Optimized for instant rendering on lightweight laptops (Intel i3 / low GPU).

### 10. 🔊 Web Audio Procedural Synthesizer
- 100% client-side synthesized sound effects using the browser's native Web Audio API (zero external audio files, zero network lag):
  - Chimes, fanfares, portal hums, metallic slashes, and level-up resonance.
  - Optional **432Hz Alpha Focus Ambient Drone** for sustained concentration.
  - Independent SFX, Ambient, and Master volume toggles.

### 11. 💾 100% Offline Persistence & Portability
- All hunter data saves locally in browser `localStorage`.
- Built-in **Export JSON Backup** and **Restore JSON Backup** for easy multi-device migration.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Vanilla Cyberpunk / Dark Fantasy CSS (Zero heavy utility overhead, glassmorphism, scanlines, neon borders)
- **Sound**: Web Audio API (Procedural synthesis)
- **Deployment**: Automated GitHub Pages workflow (`.github/workflows/deploy.yml`)

---

## 🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Yash-glitch-byte/solo-leveling-system.git
   cd solo-leveling-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

*“Your previous chapter has ended. Stand up and awaken.”*
