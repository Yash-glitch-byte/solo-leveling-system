# SYSTEM REAWAKEN — C++ CORE PROGRESSION ENGINE
Welcome, Hunter! This directory contains the **pure C++14/17 implementation** of the RPG game systems for **SYSTEM REAWAKEN (The System)**.

Because you are learning C++, this codebase is structured to be **clean, modular, and easy to edit**. You can modify formulas, add weapons, create new shadow commanders, and compile native executables directly on your PC!

---

## 📁 File Structure

| File | Purpose | What You Can Edit |
|---|---|---|
| `include/ProgressionEngine.hpp` | Core XP curves & Hunter Ranks | Change XP required per level (`calculateRequiredXp`), add new ranks. |
| `include/Equipment.hpp` | Weapons, Armor, & The E-Ring | Add new weapons, rings, and armor with custom stat multipliers. |
| `include/Player.hpp` | Player stats & Stat Allocation | Modify base attributes (Strength, Vitality, Intelligence, Focus, etc.). |
| `include/PseudoMonarch.hpp` | Level 5+ Monarch & Shadow Army | Add new Shadow Commanders (e.g. Beru, Bellion) and Ruler's Authority passives. |
| `src/main.cpp` | Test runner & Interactive Demo | Add your own C++ gameplay tests and verify your changes. |

---

## 🛠️ How to Compile & Run Your C++ Code

You can compile this code with any standard C++ compiler (`g++`, `clang++`, or Visual Studio).

### Option 1: Fast Single-Command Build (MinGW / GCC)
Open your terminal in the `solo-leveling-system` folder and run:
```bash
g++ -std=c++14 -I cpp/include cpp/src/main.cpp -o cpp_engine.exe
./cpp_engine.exe
```

### Option 2: Using CMake
```bash
cd cpp
mkdir build && cd build
cmake ..
cmake --build .
./reawaken_core.exe
```

---

## 🎮 Code Examples: How to Customize Your Game in C++

### 1. Adding a New Shadow Commander
Open `cpp/include/PseudoMonarch.hpp`. Look at the `initializeShadows()` function:
```cpp
// Add your own custom Shadow!
shadows.push_back({
    "shadow-beru",
    "Beru, Ant King Commander",
    "My King! Your will is my supreme command!",
    "Commander",
    10, // Level required to extract
    false
});
```

### 2. Adding a New Relic Weapon
Open `cpp/include/Equipment.hpp`. You can define a new item:
```cpp
EquipmentItem demonSword(
    "demon-sword-01",
    "Demon King's Longsword",
    ItemSlot::Weapon,
    ItemRarity::Legendary,
    "A lightning-imbued broadsword wielded by the Monarch of White Flames.",
    {15, 0, 5, 10, 0, 0, 0}, // +15 STR, +5 INT, +10 FOC
    0.0f
);
```

### 3. Adjusting the XP Formula
Open `cpp/include/ProgressionEngine.hpp`:
```cpp
inline uint64_t calculateRequiredXp(uint32_t level) {
    if (level <= 1) return 100;
    // Tweak this multiplier to make leveling faster or slower!
    return static_cast<uint64_t>(100.0 * std::pow(level, 1.35));
}
```

---

## 📱 How C++ Connects with the Mobile/PC App
- **The C++ Engine (`cpp/`)**: Contains the true object-oriented game logic, stats calculations, and algorithmic verification that you can practice and compile locally.
- **The Cross-Platform Shell (`src/`)**: Runs the user interface on iPhone, Android, and Web browsers, ensuring you can use the system as a real-life habit tracker on your phone everywhere you go.
