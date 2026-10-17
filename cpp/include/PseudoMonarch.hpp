#pragma once
#include <string>
#include <vector>
#include "Player.hpp"

namespace Reawaken {

struct ShadowCommander {
    std::string id;
    std::string name;
    std::string title;
    bool extracted = false;
    bool deployed = false;
    int strengthBonus = 0;
    int disciplineBonus = 0;
    int requiredLevel = 5;
};

class PseudoMonarchSystem {
public:
    bool isUnlocked = false;
    bool rulersAuthorityActive = true;
    bool shadowDomainActive = true;
    std::vector<ShadowCommander> shadows;

    PseudoMonarchSystem() {
        shadows.push_back({"shadow-igris", "Igris", "Blood-Red Commander", false, true, 6, 4, 5});
        shadows.push_back({"shadow-tank", "Tank", "Ice Bear Alpha", false, false, 4, 2, 8});
        shadows.push_back({"shadow-iron", "Iron", "Obsidian Shield", false, false, 5, 3, 12});
        shadows.push_back({"shadow-beru", "Beru", "King of the Swarm", false, false, 10, 8, 25});
    }

    bool unlockMonarch(int playerLevel) {
        if (playerLevel >= 5) {
            isUnlocked = true;
            return true;
        }
        return false;
    }

    bool extractShadow(const std::string& shadowId, int playerLevel) {
        if (!isUnlocked) return false;
        for (auto& s : shadows) {
            if (s.id == shadowId && playerLevel >= s.requiredLevel) {
                s.extracted = true;
                return true;
            }
        }
        return false;
    }
};

} // namespace Reawaken
