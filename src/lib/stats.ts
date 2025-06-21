export interface BattleData {
  mode: string
  stage: string
  result: 'win' | 'lose'
  kills: number
  deaths: number
  assists: number
  paint_point: number
  weapon: string
  played_time: string
}

export interface Battle {
  id: string
  battle_data: BattleData
  played_at: string
}

export interface UserStats {
  totalBattles: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  kdRatio: number
  avgPaintPoints: number
  
  // モード別統計
  modeStats: Record<string, {
    battles: number
    winRate: number
    avgKD: number
  }>
  
  // ブキ別統計
  weaponStats: Record<string, {
    battles: number
    winRate: number
    avgKD: number
  }>
  
  // 最近の傾向
  recentTrend: {
    last10WinRate: number
    improvementDirection: 'up' | 'down' | 'stable'
  }
}

export function calculateUserStats(battles: Battle[]): UserStats {
  if (battles.length === 0) {
    return {
      totalBattles: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      kdRatio: 0,
      avgPaintPoints: 0,
      modeStats: {},
      weaponStats: {},
      recentTrend: {
        last10WinRate: 0,
        improvementDirection: 'stable'
      }
    }
  }

  const totalBattles = battles.length
  const wins = battles.filter(b => b.battle_data.result === 'win').length
  const winRate = (wins / totalBattles) * 100

  // 基本統計
  const totalKills = battles.reduce((sum, b) => sum + b.battle_data.kills, 0)
  const totalDeaths = battles.reduce((sum, b) => sum + b.battle_data.deaths, 0)
  const totalAssists = battles.reduce((sum, b) => sum + b.battle_data.assists, 0)
  const totalPaintPoints = battles.reduce((sum, b) => sum + b.battle_data.paint_point, 0)

  const avgKills = totalKills / totalBattles
  const avgDeaths = totalDeaths / totalBattles
  const avgAssists = totalAssists / totalBattles
  const kdRatio = totalDeaths > 0 ? totalKills / totalDeaths : totalKills
  const avgPaintPoints = totalPaintPoints / totalBattles

  // モード別統計
  const modeStats: Record<string, { battles: number; winRate: number; avgKD: number }> = {}
  const modeGroups = battles.reduce((groups, battle) => {
    const mode = battle.battle_data.mode
    if (!groups[mode]) groups[mode] = []
    groups[mode].push(battle)
    return groups
  }, {} as Record<string, Battle[]>)

  Object.entries(modeGroups).forEach(([mode, modeBattles]) => {
    const modeWins = modeBattles.filter(b => b.battle_data.result === 'win').length
    const modeKills = modeBattles.reduce((sum, b) => sum + b.battle_data.kills, 0)
    const modeDeaths = modeBattles.reduce((sum, b) => sum + b.battle_data.deaths, 0)
    
    modeStats[mode] = {
      battles: modeBattles.length,
      winRate: (modeWins / modeBattles.length) * 100,
      avgKD: modeDeaths > 0 ? modeKills / modeDeaths : modeKills
    }
  })

  // ブキ別統計
  const weaponStats: Record<string, { battles: number; winRate: number; avgKD: number }> = {}
  const weaponGroups = battles.reduce((groups, battle) => {
    const weapon = battle.battle_data.weapon
    if (!groups[weapon]) groups[weapon] = []
    groups[weapon].push(battle)
    return groups
  }, {} as Record<string, Battle[]>)

  Object.entries(weaponGroups).forEach(([weapon, weaponBattles]) => {
    const weaponWins = weaponBattles.filter(b => b.battle_data.result === 'win').length
    const weaponKills = weaponBattles.reduce((sum, b) => sum + b.battle_data.kills, 0)
    const weaponDeaths = weaponBattles.reduce((sum, b) => sum + b.battle_data.deaths, 0)
    
    weaponStats[weapon] = {
      battles: weaponBattles.length,
      winRate: (weaponWins / weaponBattles.length) * 100,
      avgKD: weaponDeaths > 0 ? weaponKills / weaponDeaths : weaponKills
    }
  })

  // 最近の傾向（最新10試合）
  const recent10 = battles.slice(0, 10)
  const recent10Wins = recent10.filter(b => b.battle_data.result === 'win').length
  const last10WinRate = recent10.length > 0 ? (recent10Wins / recent10.length) * 100 : 0

  // 改善傾向の計算（最新10試合 vs 全体）
  let improvementDirection: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(last10WinRate - winRate) > 5) {
    improvementDirection = last10WinRate > winRate ? 'up' : 'down'
  }

  return {
    totalBattles,
    winRate: Math.round(winRate * 100) / 100,
    avgKills: Math.round(avgKills * 100) / 100,
    avgDeaths: Math.round(avgDeaths * 100) / 100,
    avgAssists: Math.round(avgAssists * 100) / 100,
    kdRatio: Math.round(kdRatio * 100) / 100,
    avgPaintPoints: Math.round(avgPaintPoints),
    modeStats,
    weaponStats,
    recentTrend: {
      last10WinRate: Math.round(last10WinRate * 100) / 100,
      improvementDirection
    }
  }
}

// 最強・最弱の分析
export function getStrongestWeakestModes(stats: UserStats) {
  const modes = Object.entries(stats.modeStats)
    .filter(([_, data]) => data.battles >= 3) // 3試合以上のモードのみ
    .sort(([_, a], [__, b]) => b.winRate - a.winRate)

  return {
    strongest: modes[0] || null,
    weakest: modes[modes.length - 1] || null
  }
}

export function getRecommendedWeapons(stats: UserStats) {
  const weapons = Object.entries(stats.weaponStats)
    .filter(([_, data]) => data.battles >= 2) // 2試合以上のブキのみ
    .sort(([_, a], [__, b]) => b.winRate - a.winRate)

  return weapons.slice(0, 3) // トップ3のブキ
}