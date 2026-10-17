#pragma once
#include <string>
#include <vector>
#include <memory>
#include "ProgressionEngine.hpp"
#include "Equipment.hpp"

namespace Reawaken {

struct PlayerStats {
    int strength = 10;
    int vitality = 10;
    int intelligence = 10;
    int focus = 10;
    int discipline = 10;
    int career = 10;
    int communication = 10;
};

class Player {
public:
    std::string name;
    std::string alias;
    int level = 1;
    int currentXp = 0;
    int requiredXp = 100;
    int statPoints = 0;
    HunterRank rank = HunterRank::E_Rank;
    PlayerStats baseStats;
    int fatigue = 0; // 0 to 100%
    int streak = 1;

    std::vector<EquipmentItem> inventory;
    std::unique_ptr<EquipmentItem> equippedRing;

    Player(std::string name = "Sung Jin-woo", std::string alias = "Shadow Monarch")
        : name(std::move(name)), alias(std::move(alias)) {
        requiredXp = calculateRequiredXp(level);
        rank = getRankForLevel(level);

        // Equip The E-Ring by default
        equippedRing = std::make_unique<EquipmentItem>(createERing());
        equippedRing->isEquipped = true;
    }

    void awardXp(int xpGained) {
        LevelUpResult result = processXpGain(level, currentXp, xpGained);
        level = result.newLevel;
        rank = result.newRank;
        currentXp = result.remainingXp;
        requiredXp = result.newRequiredXp;
        statPoints += result.statPointsAwarded;
    }

    bool allocateStat(const std::string& attrName) {
        if (statPoints <= 0) return false;
        statPoints--;
        if (attrName == "strength") baseStats.strength++;
        else if (attrName == "vitality") baseStats.vitality++;
        else if (attrName == "intelligence") baseStats.intelligence++;
        else if (attrName == "focus") baseStats.focus++;
        else if (attrName == "discipline") baseStats.discipline++;
        else if (attrName == "career") baseStats.career++;
        else if (attrName == "communication") baseStats.communication++;
        else {
            statPoints++; // refund invalid attribute
            return false;
        }
        return true;
    }

    // Effective Stats = Base Stats + Equipment Buffs
    PlayerStats getEffectiveStats() const {
        PlayerStats effective = baseStats;
        if (equippedRing) {
            effective.vitality += equippedRing->statBonus.vitality;
            effective.focus += equippedRing->statBonus.focus;
        }
        return effective;
    }
};

} // namespace Reawaken
