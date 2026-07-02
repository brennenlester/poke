import {
  addItem,
  consumeMaterial,
  getMaterialCount,
} from "../inventory/playerInventory";

export type CraftRecipe = {
  id: string;
  name: string;
  outputItemId: string;
  materials: { materialId: string; count: number }[];
};

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "ember-charm",
    name: "Ember Charm",
    outputItemId: "ember-charm",
    materials: [
      { materialId: "ember-ash", count: 2 },
      { materialId: "folklore-dust", count: 1 },
    ],
  },
  {
    id: "moss-salve",
    name: "Moss Salve",
    outputItemId: "moss-salve",
    materials: [
      { materialId: "moss-fiber", count: 2 },
      { materialId: "folklore-dust", count: 1 },
    ],
  },
];

export function canCraft(recipe: CraftRecipe): boolean {
  return recipe.materials.every(
    (m) => getMaterialCount(m.materialId) >= m.count,
  );
}

export function craftItem(recipe: CraftRecipe): boolean {
  if (!canCraft(recipe)) {
    return false;
  }
  for (const m of recipe.materials) {
    if (!consumeMaterial(m.materialId, m.count)) {
      return false;
    }
  }
  addItem(recipe.outputItemId);
  return true;
}
