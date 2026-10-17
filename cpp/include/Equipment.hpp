#pragma once
#include <string>

namespace Reawaken {

enum class EquipmentSlot {
    Weapon,
    Armor,
    Ring,
    Accessory
};

enum class ItemRarity {
    Common,
    Rare,
    Epic,
    Legendary,
    Mythic
};

struct AttributeBonus {
    int strength = 0;
    int vitality = 0;
    int intelligence = 0;
    int focus = 0;
    int discipline = 0;
    int career = 0;
    int communication = 0;
};

class EquipmentItem {
public:
    std::string id;
    std::string name;
    EquipmentSlot slot;
    ItemRarity rarity;
    std::string description;
    std::string lore;
    AttributeBonus statBonus;
    std::string specialEffect;
    bool isEquipped = false;

    EquipmentItem(std::string id, std::string name, EquipmentSlot slot, ItemRarity rarity,
                  AttributeBonus bonus, std::string effect, std::string desc = "", std::string lore = "")
        : id(std::move(id)), name(std::move(name)), slot(slot), rarity(rarity),
          statBonus(bonus), specialEffect(std::move(effect)), description(std::move(desc)), lore(std::move(lore)) {}
};

inline EquipmentItem createERing() {
    AttributeBonus bonus;
    bonus.vitality = 2;
    bonus.focus = 2;
    return EquipmentItem(
        "item-e-ring-origin",
        "The E-Ring (Awakened Ring of Origin)",
        EquipmentSlot::Ring,
        ItemRarity::Rare,
        bonus,
        "-15% Fatigue accumulation on missed habits",
        "A sacred cyan ring bestowed upon newly awakened hunters in their darkest hour.",
        "Forged from obsidian and mana crystal. Shields the hunter from exhaustion."
    );
}

} // namespace Reawaken
