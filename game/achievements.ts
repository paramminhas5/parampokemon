// Achievement system — tracks milestones, persists to localStorage.

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "explore" | "battle" | "collect" | "special";
};

export const ACHIEVEMENTS: Achievement[] = [
  // Exploration
  { id: "first_steps",    name: "First Steps",       description: "Leave Pallet Town",                    icon: "👟", category: "explore" },
  { id: "world_traveler", name: "World Traveler",    description: "Visit all 10 zones",                   icon: "🌍", category: "explore" },
  { id: "interior_all",   name: "Home Inspector",    description: "Enter all 10 building interiors",      icon: "🏠", category: "explore" },
  { id: "easter_egg",     name: "Easter Egg Hunter", description: "Find a hidden easter egg",             icon: "🥚", category: "explore" },
  { id: "speed_walker",   name: "Speed Walker",      description: "Take 1000 steps",                     icon: "🏃", category: "explore" },

  // Battle
  { id: "first_win",      name: "First Victory",     description: "Win your first gym battle",            icon: "⚔️", category: "battle" },
  { id: "halfway",        name: "Halfway There",     description: "Earn 5 gym badges",                   icon: "🎖️", category: "battle" },
  { id: "champion",       name: "Champion",          description: "Defeat StatusQuo and become champion", icon: "👑", category: "battle" },
  { id: "route_master",   name: "Route Master",      description: "Defeat all 9 route trainers",         icon: "🗡️", category: "battle" },
  { id: "no_faint",       name: "Untouchable",       description: "Win a gym battle without fainting",    icon: "💪", category: "battle" },
  { id: "super_move",     name: "Super Effective",   description: "Land a super effective hit",           icon: "★",  category: "battle" },
  { id: "crit_king",      name: "Critical King",     description: "Land 5 critical hits total",          icon: "⚡", category: "battle" },
  { id: "berry_user",     name: "Berry Smart",       description: "Use a berry in battle",               icon: "🍓", category: "battle" },

  // Collection
  { id: "first_catch",    name: "First Catch",       description: "Catch your first creature",            icon: "✦",  category: "collect" },
  { id: "catch_all",      name: "Gotta Catch Em All",description: "Catch all 9 creatures",               icon: "📖", category: "collect" },
  { id: "skill_first",    name: "Quick Learner",     description: "Learn your first skill berry",        icon: "🍇", category: "collect" },
  { id: "skill_all",      name: "Skill Master",      description: "Learn all skill berries",             icon: "🎓", category: "collect" },
  { id: "evolution",      name: "Evolved",           description: "Evolve to Mermalion",                 icon: "🔄", category: "collect" },
  { id: "final_form",     name: "Final Form",        description: "Evolve to Merlord",                   icon: "🔱", category: "collect" },

  // Special
  { id: "completionist",  name: "Completionist",     description: "100% the game — all badges, creatures, skills", icon: "💎", category: "special" },
];

// ─── Persistence ────────────────────────────────────────────────

const STORAGE_KEY = "pq_achievements";

export function loadAchievements(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

export function saveAchievements(earned: Set<string>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

export function unlockAchievement(earned: Set<string>, id: string): { earned: Set<string>; isNew: boolean } {
  if (earned.has(id)) return { earned, isNew: false };
  const next = new Set(earned);
  next.add(id);
  saveAchievements(next);
  return { earned: next, isNew: true };
}

// ─── Check conditions ───────────────────────────────────────────

export type GameStats = {
  badges: number;
  creatures: number;
  skills: number;
  zones_visited: number;
  interiors_visited: number;
  steps: number;
  route_trainers_defeated: number;
  crits_landed: number;
  berries_used: number;
  fainted_in_current_battle: boolean;
  super_effective_landed: boolean;
};

/** Returns list of newly unlocked achievement IDs based on current stats */
export function checkAchievements(stats: GameStats, current: Set<string>): string[] {
  const newly: string[] = [];
  const check = (id: string, condition: boolean) => {
    if (condition && !current.has(id)) newly.push(id);
  };

  check("first_steps",    stats.zones_visited >= 2);
  check("world_traveler", stats.zones_visited >= 10);
  check("interior_all",   stats.interiors_visited >= 10);
  check("speed_walker",   stats.steps >= 1000);
  check("first_win",      stats.badges >= 1);
  check("halfway",        stats.badges >= 5);
  check("champion",       stats.badges >= 9);
  check("route_master",   stats.route_trainers_defeated >= 9);
  check("super_move",     stats.super_effective_landed);
  check("crit_king",      stats.crits_landed >= 5);
  check("berry_user",     stats.berries_used >= 1);
  check("first_catch",    stats.creatures >= 1);
  check("catch_all",      stats.creatures >= 9);
  check("skill_first",    stats.skills >= 1);
  check("skill_all",      stats.skills >= 9);
  check("evolution",       stats.badges >= 4);
  check("final_form",     stats.badges >= 8);
  check("completionist",  stats.badges >= 9 && stats.creatures >= 9 && stats.skills >= 9);

  return newly;
}
