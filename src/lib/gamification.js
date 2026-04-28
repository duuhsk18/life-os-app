export const LEVELS = [
  { level: 1,  xp: 0,     title: 'Iniciante'    },
  { level: 2,  xp: 500,   title: 'Comprometido' },
  { level: 3,  xp: 1200,  title: 'Disciplinado' },
  { level: 4,  xp: 2500,  title: 'Focado'       },
  { level: 5,  xp: 5000,  title: 'Resiliente'   },
  { level: 6,  xp: 8000,  title: 'Determinado'  },
  { level: 7,  xp: 12000, title: 'Imparável'    },
  { level: 8,  xp: 17000, title: 'Elite'        },
  { level: 9,  xp: 25000, title: 'Mestre'       },
  { level: 10, xp: 35000, title: 'Lendário'     },
]

export const XP_REWARDS = {
  habit_default:    10,
  habit_diet:       20,
  habit_tasks:      15,
  workout_completed: 50,
  perfect_day:      100,
  week_perfect:     500,
}

export const DEFAULT_HABITS = [
  { name: 'Beber 2L de água',    icon: '💧', category: 'saude',         xp_reward: 10 },
  { name: 'Treinar',             icon: '💪', category: 'saude',         xp_reward: 50 },
  { name: 'Ler 20 páginas',      icon: '📖', category: 'desenvolvimento', xp_reward: 10 },
  { name: 'Meditar 10 minutos',  icon: '🧘', category: 'saude',         xp_reward: 10 },
  { name: 'Completar 3 tarefas', icon: '🎯', category: 'produtividade', xp_reward: 15 },
]

export function calculateLevel(totalXP) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function xpToNextLevel(totalXP) {
  const current = calculateLevel(totalXP)
  const idx = LEVELS.findIndex(l => l.level === current.level)
  if (idx === LEVELS.length - 1) return { isMaxLevel: true, xpNeeded: 0, percent: 100 }
  const next = LEVELS[idx + 1]
  const xpInLevel  = totalXP - current.xp
  const xpForNext  = next.xp - current.xp
  return {
    isMaxLevel: false,
    xpNeeded: next.xp - totalXP,
    percent: Math.min(100, Math.round((xpInLevel / xpForNext) * 100)),
  }
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}
