#pragma once
#include <string>
#include <cmath>
#include <algorithm>

namespace Reawaken {

enum class HunterRank {
    E_Rank,
    D_Rank,
    C_Rank,
    B_Rank,
    A_Rank,
    S_Rank,
    National_Level
};

inline std::string rankToString(HunterRank rank) {
    switch (rank) {
        case HunterRank::E_Rank: return "E-Rank";
        case HunterRank::D_Rank: return "D-Rank";
        case HunterRank::C_Rank: return "C-Rank";
        case HunterRank::B_Rank: return "B-Rank";
        case HunterRank::A_Rank: return "A-Rank";
        case HunterRank::S_Rank: return "S-Rank";
        case HunterRank::National_Level: return "National Level";
        default: return "E-Rank";
    }
}

inline HunterRank getRankForLevel(int level) {
    if (level >= 100) return HunterRank::National_Level;
    if (level >= 70) return HunterRank::S_Rank;
    if (level >= 50) return HunterRank::A_Rank;
    if (level >= 35) return HunterRank::B_Rank;
    if (level >= 20) return HunterRank::C_Rank;
    if (level >= 10) return HunterRank::D_Rank;
    return HunterRank::E_Rank;
}

/**
 * Standard progression XP formula identical to frontend TypeScript engine.
 */
inline int calculateRequiredXp(int level) {
    if (level <= 1) return 100;
    return static_cast<int>(std::round(100.0 * std::pow(1.18, level - 1) + (level - 1) * 25.0));
}

struct LevelUpResult {
    int newLevel;
    HunterRank newRank;
    int remainingXp;
    int newRequiredXp;
    int statPointsAwarded;
    bool didRankUp;
};

inline LevelUpResult processXpGain(int currentLevel, int currentXp, int xpGained) {
    int level = currentLevel;
    int xp = currentXp + xpGained;
    int required = calculateRequiredXp(level);
    int totalStatPoints = 0;
    HunterRank initialRank = getRankForLevel(currentLevel);

    while (xp >= required) {
        xp -= required;
        level += 1;
        totalStatPoints += 3;
        required = calculateRequiredXp(level);
    }

    HunterRank finalRank = getRankForLevel(level);

    return {
        level,
        finalRank,
        xp,
        required,
        totalStatPoints,
        finalRank != initialRank
    };
}

} // namespace Reawaken
