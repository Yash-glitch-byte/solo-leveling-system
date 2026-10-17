// SYSTEM REAWAKEN — Natural Speech Understanding & Intention-to-Mission Engine
// Supports English & Hinglish conversational parsing, intention confirmation, and contextual follow-ups.

import { Quest, QuestCategory, QuestDifficulty } from '../types';

export interface ParsedMissionProposal {
  title: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  durationMinutes: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  attribute: 'strength' | 'vitality' | 'intelligence' | 'focus' | 'discipline' | 'career' | 'communication';
}

export interface ConversationTurn {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  actionRequired?: 'confirm_mission' | 'clarify_time' | 'clarify_domain' | 'none';
  proposedMission?: ParsedMissionProposal;
}

export class SpeechToMissionEngine {
  private pendingProposal: ParsedMissionProposal | null = null;
  private conversationHistory: ConversationTurn[] = [];

  public getHistory(): ConversationTurn[] {
    return this.conversationHistory;
  }

  public getPendingProposal(): ParsedMissionProposal | null {
    return this.pendingProposal;
  }

  public clearProposal(): void {
    this.pendingProposal = null;
  }

  /**
   * Main conversational intelligence parser.
   * Understands English and Hinglish, distinguishes intention from completion,
   * handles conversational follow-ups, and formulates concise responses.
   */
  public processUserInput(
    rawText: string,
    existingQuests: Quest[],
    playerLevel: number
  ): ConversationTurn {
    const text = rawText.trim().toLowerCase();
    const now = Date.now();

    // Log user message
    this.conversationHistory.push({
      sender: 'user',
      text: rawText,
      timestamp: now
    });

    // 1. Check for Confirmation to a Pending Mission Proposal
    if (this.pendingProposal) {
      if (
        text.includes('yes') ||
        text.includes('haan') ||
        text.includes('ha') ||
        text.includes('sure') ||
        text.includes('create') ||
        text.includes('confirm') ||
        text.includes('kar do') ||
        text.includes('bana do') ||
        text === 'y'
      ) {
        const confirmedMission = { ...this.pendingProposal };
        this.pendingProposal = null;

        const reply: ConversationTurn = {
          sender: 'assistant',
          text: `Mission "${confirmedMission.title}" has been registered in your Quest Hub. Focus and conquer it, Hunter.`,
          timestamp: Date.now(),
          actionRequired: 'none',
          proposedMission: confirmedMission
        };
        this.conversationHistory.push(reply);
        return reply;
      }

      if (
        text.includes('no') ||
        text.includes('nahi') ||
        text.includes('cancel') ||
        text.includes('rehne do') ||
        text === 'n'
      ) {
        this.pendingProposal = null;
        const reply: ConversationTurn = {
          sender: 'assistant',
          text: 'Mission proposal cancelled. Tell me what else you would like to tackle.',
          timestamp: Date.now(),
          actionRequired: 'none'
        };
        this.conversationHistory.push(reply);
        return reply;
      }

      // Check for follow-up adjustments (e.g. "make it 30 minutes instead")
      const timeMatch = text.match(/(\d+)\s*(mins?|minutes?|ghante|hours?)/);
      if (timeMatch) {
        let mins = parseInt(timeMatch[1], 10);
        if (timeMatch[2].startsWith('hour') || timeMatch[2].startsWith('ghant')) {
          mins = mins * 60;
        }
        this.pendingProposal.durationMinutes = mins;
        const reply: ConversationTurn = {
          sender: 'assistant',
          text: `Updated target duration to ${mins} minutes. Should I create this mission now?`,
          timestamp: Date.now(),
          actionRequired: 'confirm_mission',
          proposedMission: this.pendingProposal
        };
        this.conversationHistory.push(reply);
        return reply;
      }
    }

    // 2. Query Status Intent ("how many missions left", "show missions", "status")
    if (
      text.includes('how many missions') ||
      text.includes('kitne missions') ||
      text.includes('kitne task') ||
      text.includes('show missions') ||
      text.includes('status report') ||
      text.includes('missions left')
    ) {
      const pending = existingQuests.filter(q => q.status === 'available');
      const reply: ConversationTurn = {
        sender: 'assistant',
        text: `You have ${pending.length} pending mission${pending.length === 1 ? '' : 's'} available today. What domain are we conquering next?`,
        timestamp: Date.now(),
        actionRequired: 'none'
      };
      this.conversationHistory.push(reply);
      return reply;
    }

    // 3. Next Task Recommendation Intent ("what should i do next", "kya karu")
    if (
      text.includes('what should i do') ||
      text.includes('what next') ||
      text.includes('kya karu') ||
      text.includes('recommend') ||
      text.includes('finished my workout') ||
      text.includes('next task')
    ) {
      const pending = existingQuests.filter(q => q.status === 'available');
      if (pending.length > 0) {
        const next = pending[0];
        const reply: ConversationTurn = {
          sender: 'assistant',
          text: `Next recommended directive: "${next.title}" (${next.durationMinutes} mins). Completing this awards +${next.xpReward} EXP.`,
          timestamp: Date.now(),
          actionRequired: 'none'
        };
        this.conversationHistory.push(reply);
        return reply;
      } else {
        const reply: ConversationTurn = {
          sender: 'assistant',
          text: 'All active daily missions are conquered! Enter an Instant Dungeon or declare a new custom dedication.',
          timestamp: Date.now(),
          actionRequired: 'none'
        };
        this.conversationHistory.push(reply);
        return reply;
      }
    }

    // 4. Intention to Complete a Task ("I've finished my workout", "Maine kar liya")
    // NOTE: An intention statement must NEVER mark a task complete automatically without verification!
    if (
      text.includes('finished') ||
      text.includes('completed') ||
      text.includes('ho gaya') ||
      text.includes('kar liya') ||
      text.includes('done with')
    ) {
      const reply: ConversationTurn = {
        sender: 'assistant',
        text: 'Progress reported! To maintain absolute integrity and claim your EXP, please submit verification (quiz, workout log, or code link) in the Quest Hub.',
        timestamp: Date.now(),
        actionRequired: 'none'
      };
      this.conversationHistory.push(reply);
      return reply;
    }

    // 5. Game Mechanics Questions
    if (text.includes('e-ring') || text.includes('ring')) {
      const reply: ConversationTurn = {
        sender: 'assistant',
        text: 'The E-Ring is an origin relic equipped on your finger. It grants +2 Vitality, +2 Focus, and shields you with -15% fatigue reduction against burnout.',
        timestamp: Date.now(),
        actionRequired: 'none'
      };
      this.conversationHistory.push(reply);
      return reply;
    }

    if (text.includes('monarch') || text.includes('shadow')) {
      const reply: ConversationTurn = {
        sender: 'assistant',
        text: `You awaken the Pseudo Monarch at Level 5. Once awakened, you can extract fallen shadows like Commander Igris to receive permanent passive multipliers.`,
        timestamp: Date.now(),
        actionRequired: 'none'
      };
      this.conversationHistory.push(reply);
      return reply;
    }

    // 6. Intention to Mission Parsing (Natural Speech & Hinglish)
    const parsed = this.parseMissionIntention(text, rawText);
    if (parsed) {
      this.pendingProposal = parsed;
      const reply: ConversationTurn = {
        sender: 'assistant',
        text: `Should I create a ${parsed.durationMinutes}-minute ${parsed.title} mission for you?`,
        timestamp: Date.now(),
        actionRequired: 'confirm_mission',
        proposedMission: parsed
      };
      this.conversationHistory.push(reply);
      return reply;
    }

    // 7. General Friendly / Fallback Response
    const reply: ConversationTurn = {
      sender: 'assistant',
      text: `Understood, Hunter. I can create missions, check status, or guide your focus. For example, say: "I'm going to study DSP for 1 hour" or "Aaj mujhe push-ups karna hai".`,
      timestamp: Date.now(),
      actionRequired: 'none'
    };
    this.conversationHistory.push(reply);
    return reply;
  }

  /**
   * Internal parser extracting title, category, duration, and subtasks
   * from English & Hinglish text.
   */
  private parseMissionIntention(text: string, rawText: string): ParsedMissionProposal | null {
    let category: QuestCategory = 'personal';
    let attribute: ParsedMissionProposal['attribute'] = 'discipline';
    let durationMinutes = 30;
    let title = '';

    // Duration extraction: "for one hour", "for 45 mins", "2 ghante", "1 hour"
    if (text.includes('one hour') || text.includes('1 hour') || text.includes('1 ghanta') || text.includes('ek ghanta')) {
      durationMinutes = 60;
    } else if (text.includes('two hours') || text.includes('2 hours') || text.includes('2 ghante') || text.includes('do ghante')) {
      durationMinutes = 120;
    } else {
      const match = text.match(/(\d+)\s*(mins?|minutes?|ghante|hours?)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (match[2].startsWith('hour') || match[2].startsWith('ghant')) {
          durationMinutes = num * 60;
        } else {
          durationMinutes = num;
        }
      }
    }

    // Fitness patterns: "chest workout", "push-ups", "gym", "exercise", "kasrat"
    if (
      text.includes('workout') ||
      text.includes('push-up') ||
      text.includes('pushup') ||
      text.includes('gym') ||
      text.includes('exercise') ||
      text.includes('running') ||
      text.includes('cardio') ||
      text.includes('chest') ||
      text.includes('legs')
    ) {
      category = 'fitness';
      attribute = 'strength';

      if (text.includes('push-up') || text.includes('pushup')) {
        title = 'Physical Push-up & Core Training';
      } else if (text.includes('chest')) {
        title = 'Chest & Upper Body Conditioning';
      } else {
        title = 'Physical Resistance & Mobility Workout';
      }

      return {
        title,
        category,
        difficulty: durationMinutes >= 60 ? 'hard' : 'normal',
        durationMinutes,
        attribute,
        subtasks: [
          { id: `sub-1-${Date.now()}`, title: 'Warm-up & joint mobility prep', completed: false },
          { id: `sub-2-${Date.now()}`, title: 'Execute primary resistance sets', completed: false },
          { id: `sub-3-${Date.now()}`, title: 'Core finisher & cooldown stretch', completed: false }
        ]
      };
    }

    // Coding & Technical patterns: "dsa", "c++", "problems", "code", "programming", "leetcode", "project"
    if (
      text.includes('dsa') ||
      text.includes('c++') ||
      text.includes('code') ||
      text.includes('coding') ||
      text.includes('leetcode') ||
      text.includes('problems') ||
      text.includes('algorithm') ||
      text.includes('typescript') ||
      text.includes('project')
    ) {
      category = 'coding';
      attribute = 'intelligence';

      const problemCountMatch = text.match(/(\d+)\s*(c\+\+|dsa|problems|questions)/);
      const problemCount = problemCountMatch ? problemCountMatch[1] : '2';

      if (text.includes('c++')) {
        title = `C++ Engineering: Solve ${problemCount} Problems`;
      } else if (text.includes('dsa')) {
        title = `Algorithmic DSA: Solve ${problemCount} Challenges`;
      } else {
        title = 'Technical Software Engineering Block';
      }

      return {
        title,
        category,
        difficulty: durationMinutes >= 60 ? 'hard' : 'normal',
        durationMinutes,
        attribute,
        subtasks: [
          { id: `sub-c1-${Date.now()}`, title: 'Implement optimal solution & test boundaries', completed: false },
          { id: `sub-c2-${Date.now()}`, title: 'Document time & space complexity', completed: false }
        ]
      };
    }

    // Study & Academics patterns: "study", "dsp", "reading", "exam", "revision", "padhai", "padhna"
    if (
      text.includes('study') ||
      text.includes('dsp') ||
      text.includes('padhna') ||
      text.includes('padhai') ||
      text.includes('reading') ||
      text.includes('revision') ||
      text.includes('exam') ||
      text.includes('notes')
    ) {
      category = 'study';
      attribute = 'focus';

      let topic = 'Deep Work';
      if (text.includes('dsp')) topic = 'Digital Signal Processing (DSP)';
      else if (text.includes('exam')) topic = 'Exam Preparation';
      else topic = 'Academic Material';

      title = `Deep Study Chamber: ${topic}`;

      return {
        title,
        category,
        difficulty: durationMinutes >= 60 ? 'hard' : 'normal',
        durationMinutes,
        attribute,
        subtasks: [
          { id: `sub-s1-${Date.now()}`, title: `Review core concepts & formulas for ${topic}`, completed: false },
          { id: `sub-s2-${Date.now()}`, title: 'Summarize key insights & test knowledge', completed: false }
        ]
      };
    }

    // Career & Interview patterns: "interview", "resume", "portfolio", "job"
    if (text.includes('interview') || text.includes('resume') || text.includes('portfolio') || text.includes('career')) {
      return {
        title: 'Career Advancement & Interview Preparation',
        category: 'career',
        difficulty: 'normal',
        durationMinutes,
        attribute: 'career',
        subtasks: [
          { id: `sub-car1-${Date.now()}`, title: 'Refine technical portfolio & resume bullet metrics', completed: false },
          { id: `sub-car2-${Date.now()}`, title: 'Practice behavioral and system interview questions', completed: false }
        ]
      };
    }

    // If text contains "going to" or "want to" or "create a mission", extract general title
    if (text.includes('going to') || text.includes('want to') || text.includes('create a mission') || text.includes('karna hai')) {
      const cleanTitle = rawText
        .replace(/i'?m going to/i, '')
        .replace(/i want to/i, '')
        .replace(/create a mission for/i, '')
        .replace(/aaj mujhe/i, '')
        .replace(/karna hai/i, '')
        .replace(/for \d+ (hours?|mins?|minutes?|ghante)/i, '')
        .trim();

      if (cleanTitle.length > 2) {
        return {
          title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
          category: 'personal',
          difficulty: 'normal',
          durationMinutes,
          attribute: 'discipline',
          subtasks: [
            { id: `sub-gen-${Date.now()}`, title: 'Complete targeted session milestone', completed: false }
          ]
        };
      }
    }

    return null;
  }
}

export const speechToMissionEngine = new SpeechToMissionEngine();
