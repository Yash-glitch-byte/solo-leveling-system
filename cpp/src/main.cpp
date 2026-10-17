#include <iostream>
#include <cassert>
#include "ProgressionEngine.hpp"
#include "Player.hpp"
#include "Equipment.hpp"
#include "PseudoMonarch.hpp"

using namespace Reawaken;

void runUnitTests() {
    std::cout << "========================================" << std::endl;
    std::cout << "[SYSTEM REAWAKEN] Running C++ Core Verification" << std::endl;
    std::cout << "========================================" << std::endl;

    // Test 1: Level XP Calculation
    assert(calculateRequiredXp(1) == 100);
    std::cout << "✓ Test 1 Passed: Level 1 requires 100 XP" << std::endl;

    // Test 2: Player Initialization & E-Ring Equipping
    Player player("TestHunter", "The Awakened");
    assert(player.level == 1);
    assert(player.rank == HunterRank::E_Rank);
    assert(player.equippedRing != nullptr);
    assert(player.equippedRing->name == "The E-Ring (Awakened Ring of Origin)");
    
    PlayerStats effective = player.getEffectiveStats();
    assert(effective.vitality == 12); // Base 10 + 2 from E-Ring
    assert(effective.focus == 12);    // Base 10 + 2 from E-Ring
    std::cout << "✓ Test 2 Passed: Player initialized with The E-Ring equipped (+2 VIT, +2 FOC)" << std::endl;

    // Test 3: XP Awarding & Level Up
    player.awardXp(120); // 100 to level up to Lv 2, 20 XP leftover
    assert(player.level == 2);
    assert(player.currentXp == 20);
    assert(player.statPoints == 3);
    std::cout << "✓ Test 3 Passed: Level up to Level 2 awards +3 stat points with 20 leftover XP" << std::endl;

    // Test 4: Stat Point Allocation
    bool allocSuccess = player.allocateStat("strength");
    assert(allocSuccess == true);
    assert(player.baseStats.strength == 11);
    assert(player.statPoints == 2);
    std::cout << "✓ Test 4 Passed: Allocated 1 point to Strength successfully" << std::endl;

    // Test 5: Pseudo Monarch System
    PseudoMonarchSystem monarch;
    assert(!monarch.isUnlocked); // Level 2 is < 5
    assert(!monarch.unlockMonarch(player.level));

    // Award XP to level 5
    player.awardXp(800);
    assert(player.level >= 5);
    bool unlocked = monarch.unlockMonarch(player.level);
    assert(unlocked == true);
    std::cout << "✓ Test 5 Passed: Pseudo Monarch unlocked upon reaching Level 5+" << std::endl;

    // Test 6: Shadow Extraction (Igris)
    bool extractIgris = monarch.extractShadow("shadow-igris", player.level);
    assert(extractIgris == true);
    assert(monarch.shadows[0].extracted == true);
    std::cout << "✓ Test 6 Passed: Shadow Commander 'Igris' extracted successfully via ARISE" << std::endl;

    std::cout << "========================================" << std::endl;
    std::cout << "ALL 6 C++ CORE VERIFICATION TESTS PASSED!" << std::endl;
    std::cout << "========================================" << std::endl;
}

int main(int argc, char* argv[]) {
    runUnitTests();
    return 0;
}
