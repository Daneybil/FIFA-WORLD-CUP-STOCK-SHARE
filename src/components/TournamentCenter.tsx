import React, { useState } from 'react';
import { MatchFixture, CountryShare, ShareHolding } from '../types';
import { Trophy, Calendar, RefreshCw, Award, PlayCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface TournamentCenterProps {
  fixtures: MatchFixture[];
  countries: CountryShare[];
  holdings?: ShareHolding[];
  initialTab?: 'fixtures' | 'groups' | 'knockout';
  lastSyncTime?: string | null;
  lastResponseTime?: number | null;
  numTeamsLoaded?: number;
  numFixturesLoaded?: number;
  numStandingsLoaded?: number;
  apiSuccessCount?: number;
  apiFailedCount?: number;
  apiLoading?: boolean;
  apiError?: string | null;
  onManualTriggerSync?: () => void;
}

export default function TournamentCenter({ 
  fixtures, 
  countries, 
  holdings = [], 
  initialTab = 'fixtures',
  lastSyncTime = null,
  lastResponseTime = null,
  numTeamsLoaded = 0,
  numFixturesLoaded = 0,
  numStandingsLoaded = 0,
  apiSuccessCount = 1,
  apiFailedCount = 0,
  apiLoading = false,
  apiError = null,
  onManualTriggerSync
}: TournamentCenterProps) {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'groups' | 'knockout'>(initialTab);
  const [matchFilter, setMatchFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Starred country state inside Tournament Center for additional custom support bookmarks
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_starred');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleStar = (countryId: string) => {
    setStarredIds(prev => {
      const next = prev.includes(countryId) 
        ? prev.filter(id => id !== countryId) 
        : [...prev, countryId];
      localStorage.setItem('world_cup_shares_starred', JSON.stringify(next));
      return next;
    });
  };

  const isSupported = (countryId: string) => {
    const hasHolding = holdings.some(h => h.countryId === countryId && h.sharesQuantity > 0);
    return hasHolding || starredIds.includes(countryId);
  };
  
  // Find country objects
  const getCountry = (teamId: string) => {
    if (teamId === 'TBD') {
      return {
        id: 'TBD',
        name: 'To Be Decided',
        flag: '🏳️',
        currentPrice: 0.00,
        winningSettlementPrice: 0,
        potentialReturn: 0,
        group: 'A',
        ranking: 0,
        popularityScore: 0,
        trending: 'stable' as const,
        change24h: 0,
        availableShares: 0,
        statistics: { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, matchesPlayed: 0 },
        description: 'Team TBD'
      };
    }
    return countries.find((c) => c.id === teamId);
  };

  // Group standings compiler
  const groupStandingNations = (groupName: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H') => {
    return countries
      .filter((c) => c.group === groupName)
      .map((c) => {
        const stats = c.statistics;
        const pts = stats.wins * 3 + stats.draws * 1;
        const gd = stats.goalsScored - stats.goalsConceded;
        return { ...c, pts, gd };
      })
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.ranking - a.ranking;
      });
  };

  const uniqueGroups: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H')[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="bg-[#0b0e14] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[#212739] gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
              World Championship Live Data Center
            </h2>
            <p className="text-sm text-[#8c94a5] mt-1">
              Active statistics, match schedules, and live bracket valuations. Sourced dynamically from secure feeds.
            </p>
          </div>

          {/* Sub Navigation tabs */}
          <div className="bg-[#11141e] p-1.5 rounded-xl border border-[#212a3f] flex items-center self-center md:self-start">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeTab === 'fixtures'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'text-[#9099ab] hover:text-white'
              }`}
            >
              Match Fixtures
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'text-[#9099ab] hover:text-white'
              }`}
            >
              Group Standings
            </button>
            <button
              onClick={() => setActiveTab('knockout')}
              className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeTab === 'knockout'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'text-[#9099ab] hover:text-white'
              }`}
            >
              Bracket Progress
            </button>
          </div>
        </div>

        {/* Supported Nations Tracker Grid & World Squads Matrix */}
        <div className="bg-[#10131c] border border-[#212739] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1f2638] pb-4 gap-4">
            <div>
              <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">SUPPORTED TEAMS DATABASE</span>
              <h3 className="text-xl font-bold font-display text-white">Direct Team Investment Ledger</h3>
            </div>
            <div className="text-xs text-gray-400">
              Manage your supported nations and track active and eliminated squads dynamically.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Active Supported (Green dot) */}
            <div className="bg-[#0b0e14] p-4.5 rounded-xl border border-emerald-500/15 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2234]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Active Supported</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                    {countries.filter(c => isSupported(c.id) && (c.status === 'ACTIVE' || c.status === 'CHAMPION')).length} Active
                  </span>
                </div>
                
                <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {countries.filter(c => isSupported(c.id) && (c.status === 'ACTIVE' || c.status === 'CHAMPION')).length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic py-8 text-center leading-normal">You are not supporting any active team yet. Buy shares in the market or support from the squad list on the right!</p>
                  ) : (
                    countries.filter(c => isSupported(c.id) && (c.status === 'ACTIVE' || c.status === 'CHAMPION')).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 bg-[#121622] border border-[#1f2637] rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{c.flag}</span>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{c.name}</p>
                            <p className="text-[9px] text-[#8c94a5] font-mono">Index: ${c.currentPrice.toFixed(2)} (Group {c.group})</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleStar(c.id)}
                          className="p-1 text-amber-400 hover:text-gray-400 transition-colors cursor-pointer text-sm"
                          title="Remove support"
                        >
                          ★
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Eliminated Supported (Red dot) */}
            <div className="bg-[#0b0e14] p-4.5 rounded-xl border border-red-500/15 hover:border-red-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2234]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Eliminated Supported</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                    {countries.filter(c => isSupported(c.id) && c.status === 'ELIMINATED').length} Out
                  </span>
                </div>
                
                <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {countries.filter(c => isSupported(c.id) && c.status === 'ELIMINATED').length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic py-8 text-center leading-normal">No supported nations have been eliminated yet.</p>
                  ) : (
                    countries.filter(c => isSupported(c.id) && c.status === 'ELIMINATED').map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 bg-[#121622] border border-[#1f2637]/60 rounded-lg opacity-60">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl grayscale">{c.flag}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-300 leading-tight">{c.name}</p>
                            <p className="text-[9px] text-gray-500 font-mono">Final Index: ${c.currentPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleStar(c.id)}
                          className="p-1 text-amber-500/40 hover:text-gray-400 transition-colors cursor-pointer text-sm"
                          title="Remove support"
                        >
                          ★
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: All Squads List (48 Nations) */}
            <div className="bg-[#0b0e14] p-4.5 rounded-xl border border-[#212739] hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2234]">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">All Squad Nations</h4>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                    48 Teams (FIFA)
                  </span>
                </div>
                
                <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {countries.map(c => {
                    const active = c.status === 'ACTIVE' || c.status === 'CHAMPION';
                    const supported = isSupported(c.id);
                    return (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-[#121622] hover:bg-[#1a2031] border border-[#1f2637] rounded-lg transition-colors">
                        <div className="flex flex-row items-center space-x-2">
                          <span className="text-lg">{c.flag}</span>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{c.name}</p>
                            <span className={`text-[8px] font-mono uppercase px-1 rounded leading-none ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'}`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleStar(c.id)}
                          className={`text-[10px] px-2 py-1 rounded font-bold cursor-pointer transition-colors ${supported ? 'bg-amber-500 text-black' : 'bg-[#1a2133] text-[#a0afca] hover:bg-amber-500/20'}`}
                        >
                          {supported ? '★ Supported' : '☆ Support'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TAB 1: fixtures list */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" /> Current Cup Calendar
              </h3>
              <span className="px-2.5 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono font-bold tracking-wider uppercase">
                Feeds Connected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-[#121622] p-2 border border-[#212739] rounded-xl">
              <button
                type="button"
                onClick={() => setMatchFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  matchFilter === 'all'
                    ? 'bg-[#d4af37] text-black font-extrabold'
                    : 'text-[#9099ab] hover:text-white hover:bg-white/5'
                }`}
              >
                All Matches ({fixtures.length})
              </button>
              <button
                type="button"
                onClick={() => setMatchFilter('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  matchFilter === 'live'
                    ? 'bg-rose-500 text-white font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                    : 'text-rose-400 hover:text-white hover:bg-rose-500/10'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Live Matches ({fixtures.filter(f => f.status === 'Live').length})
              </button>
              <button
                type="button"
                onClick={() => setMatchFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  matchFilter === 'upcoming'
                    ? 'bg-indigo-600 text-white font-extrabold'
                    : 'text-[#9099ab] hover:text-white hover:bg-white/5'
                }`}
              >
                Upcoming Matches ({fixtures.filter(f => f.status === 'Scheduled').length})
              </button>
              <button
                type="button"
                onClick={() => setMatchFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  matchFilter === 'completed'
                    ? 'bg-emerald-600 text-white font-extrabold'
                    : 'text-[#9099ab] hover:text-white hover:bg-white/5'
                }`}
              >
                Completed Matches ({fixtures.filter(f => f.status === 'Finished').length})
              </button>
            </div>

            {(() => {
              const filteredFixtures = fixtures.filter((f) => {
                if (matchFilter === 'live') return f.status === 'Live';
                if (matchFilter === 'upcoming') return f.status === 'Scheduled';
                if (matchFilter === 'completed') return f.status === 'Finished';
                return true;
              });

              if (filteredFixtures.length === 0) {
                return (
                  <div className="p-12 text-center bg-[#11141e] border border-[#212739] rounded-xl text-xs text-gray-500">
                    No matches found matching the specified status class descriptor in this live session pool.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredFixtures.map((fixture) => {
                    const home = getCountry(fixture.homeTeamId);
                    const away = getCountry(fixture.awayTeamId);

                    if (!home || !away) return null;

                    const isLive = fixture.status === 'Live';
                    const isFinished = fixture.status === 'Finished';

                    return (
                      <div
                        key={fixture.id}
                        className="bg-[#11141e] border border-[#212739] hover:border-[#d4af37]/45 rounded-xl p-5 transition-all duration-200 relative group flex flex-col justify-between"
                      >
                        {/* Fixture header status */}
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest font-bold pb-3.5 border-b border-[#212c3f] mb-4 text-gray-500">
                          <span>{fixture.stage} ⏤ {fixture.date}</span>
                          
                          {isLive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 animate-pulse">
                              ● LIVE 1st Half
                            </span>
                          ) : isFinished ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Final Result
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#1f2638] text-gray-400 border border-[#2c3750]">
                              Scheduled
                            </span>
                          )}
                        </div>

                        {/* Scoreboard layout */}
                        <div className="grid grid-cols-7 items-center text-center py-2.5">
                          {/* Home flag & label */}
                          <div className="col-span-2 flex flex-col items-center space-y-1.5 focus:scale-105 transition-all">
                            <span className="text-3xl">{home.flag}</span>
                            <span className="text-xs font-bold text-white tracking-tight">{home.name}</span>
                            <span className="text-[10px] text-gray-500 font-semibold font-mono">${home.currentPrice.toFixed(2)}</span>
                          </div>

                          {/* Home score */}
                          <div className="col-span-1 text-2xl font-black font-mono text-white">
                            {fixture.homeScore !== null ? fixture.homeScore : '⏤'}
                          </div>

                          {/* Versus separator */}
                          <div className="col-span-1 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-600 font-mono tracking-wider">VS</span>
                          </div>

                          {/* Away score */}
                          <div className="col-span-1 text-2xl font-black font-mono text-white">
                            {fixture.awayScore !== null ? fixture.awayScore : '⏤'}
                          </div>

                          {/* Away flag & label */}
                          <div className="col-span-2 flex flex-col items-center space-y-1.5 focus:scale-105 transition-all">
                            <span className="text-3xl">{away.flag}</span>
                            <span className="text-xs font-bold text-white tracking-tight">{away.name}</span>
                            <span className="text-[10px] text-gray-500 font-semibold font-mono">${away.currentPrice.toFixed(2)}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: group standings */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d4af37]" /> Dynamic Standing Matrix (Groups)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueGroups.map((grpName) => {
                const standingNationsList = groupStandingNations(grpName);

                return (
                  <div 
                    key={grpName} 
                    className="bg-[#11141e] border border-[#212739] rounded-xl overflow-hidden shadow-lg"
                  >
                    <div className="px-4.5 py-3.5 bg-[#171b26]/60 border-b border-[#212739] flex justify-between items-center">
                      <span className="font-extrabold text-white text-xs tracking-wider uppercase font-display">
                        Group {grpName}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold font-mono">STANDINGS</span>
                    </div>

                    <table className="w-full text-xs text-left border-collapse font-mono">
                      <thead>
                        <tr className="bg-[#151a26]/40 text-gray-500 uppercase tracking-wider text-[9px] font-bold border-b border-[#202737]">
                          <th className="py-2.5 px-4 font-sans font-semibold">Team</th>
                          <th className="py-2.5 px-2 text-center">W</th>
                          <th className="py-2.5 px-2 text-center">D</th>
                          <th className="py-2.5 px-2 text-center">L</th>
                          <th className="py-2.5 px-2 text-center">GD</th>
                          <th className="py-2.5 px-4 text-center text-white">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#182132]/30 text-white font-semibold">
                        {standingNationsList.map((team, idx) => {
                          const isTopTwo = idx < 2;

                          return (
                            <tr 
                              key={team.id} 
                              className={`hover:bg-[#161a25]/60 transition-colors ${
                                isTopTwo ? 'bg-blue-600/5' : ''
                              }`}
                            >
                              <td className="py-3 px-4 font-sans font-bold flex items-center space-x-2">
                                <span className="text-gray-500 w-3 text-center">{idx + 1}</span>
                                <span className="text-base">{team.flag}</span>
                                <span className={isTopTwo ? 'text-[#d4af37]' : 'text-gray-300'}>{team.name}</span>
                              </td>
                              <td className="py-3 px-2 text-center text-gray-400">{team.statistics.wins}</td>
                              <td className="py-3 px-2 text-center text-gray-400">{team.statistics.draws}</td>
                              <td className="py-3 px-2 text-center text-gray-400">{team.statistics.losses}</td>
                              <td className={`py-3 px-2 text-center ${team.gd > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {team.gd > 0 ? '+' : ''}{team.gd}
                              </td>
                              <td className="py-3 px-4 text-center font-black text-white text-sm">{team.pts}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    <div className="bg-[#141824]/40 p-2 text-center text-[9px] text-gray-500 font-mono tracking-wider border-t border-[#1e2536]">
                      *TOP 2 ADVANCE TO ROUND OF 16
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: knockout nodes */}
        {activeTab === 'knockout' && (
          <div className="space-y-6">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#d4af37]" /> Grand Knockout Road Matrix
            </h3>

            {/* Bracket visualization nodes */}
            <div className="bg-[#11141e] border border-[#212739] p-6 rounded-xl shadow-lg relative overflow-x-auto min-w-[700px]">
              
              <div className="grid grid-cols-3 gap-4 text-center relative">
                
                {/* Quarter Finals */}
                <div className="space-y-4 relative flex flex-col justify-center">
                  <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">Quarter-Finals</span>
                  {(() => {
                    const qfMatches = fixtures.filter(f => f.stage === 'Quarter-Finals');
                    if (qfMatches.length === 0) {
                      return <p className="text-xs text-gray-500 italic py-4">Awaiting Quarter-Finalists...</p>;
                    }
                    return qfMatches.slice(0, 4).map(f => {
                      const home = getCountry(f.homeTeamId);
                      const away = getCountry(f.awayTeamId);
                      return (
                        <div key={f.id} className="space-y-2 bg-[#171c2b] p-3 rounded-lg border border-[#2a3449] max-w-xs w-full mx-auto text-xs text-left">
                          <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-1 border-b border-[#212a3d] pb-1">
                            <span>QF ID: {f.id}</span>
                            <span>{f.date}</span>
                          </div>
                          <div className="flex justify-between text-white font-semibold font-mono">
                            <span className="truncate">{home?.flag} {home?.name || f.homeTeamId}</span>
                            <span>{f.homeScore !== null ? f.homeScore : '—'}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 font-mono">
                            <span className="truncate">{away?.flag} {away?.name || f.awayTeamId}</span>
                            <span>{f.awayScore !== null ? f.awayScore : '—'}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Semi-Finals link */}
                <div className="space-y-4 relative flex flex-col justify-center">
                  <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">Semi-Finals</span>
                  {(() => {
                    const sfMatches = fixtures.filter(f => f.stage === 'Semi-Finals');
                    if (sfMatches.length === 0) {
                      return <p className="text-xs text-gray-500 italic py-4">Awaiting Semi-Finalists...</p>;
                    }
                    return sfMatches.slice(0, 2).map(f => {
                      const home = getCountry(f.homeTeamId);
                      const away = getCountry(f.awayTeamId);
                      return (
                        <div key={f.id} className="space-y-2 bg-[#1a233b] p-3 rounded-lg border border-[#d4af37]/35 max-w-xs w-full mx-auto text-xs text-left">
                          <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-1 border-b border-[#2a3452] pb-1">
                            <span>SF ID: {f.id}</span>
                            <span>{f.date}</span>
                          </div>
                          <div className="flex justify-between text-[#d4af37] font-semibold font-mono">
                            <span className="truncate">{home?.flag} {home?.name || f.homeTeamId}</span>
                            <span>{f.homeScore !== null ? f.homeScore : '—'}</span>
                          </div>
                          <div className="flex justify-between text-white font-mono">
                            <span className="truncate">{away?.flag} {away?.name || f.awayTeamId}</span>
                            <span>{f.awayScore !== null ? f.awayScore : '—'}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* GRAND FINAL */}
                <div className="space-y-4 relative flex flex-col justify-center items-center">
                  <span className="text-[10px] font-mono font-black text-[#d4af37] tracking-widest uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> GRAND CUP FINAL
                  </span>
                  
                  {(() => {
                    const finalMatch = fixtures.find(f => f.stage === 'Final');
                    if (!finalMatch) {
                      return (
                        <div className="text-center p-6 bg-gradient-to-b from-[#1c2235] to-[#121622] rounded-xl border border-[#d4af37]/60 max-w-xs w-full">
                          <Trophy className="w-12 h-12 text-[#d4af37] mx-auto animate-bounce mb-3.5" />
                          <p className="text-xs uppercase font-extrabold text-white tracking-widest">WORLD CUP FINALS</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">July 19, 2026 ⏤ MetLife Arena</p>
                          <div className="mt-4 p-2.5 bg-black rounded text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                            Awaiting Grand Finalists...
                          </div>
                        </div>
                      );
                    }
                    const home = getCountry(finalMatch.homeTeamId);
                    const away = getCountry(finalMatch.awayTeamId);
                    return (
                      <div className="text-center p-6 bg-gradient-to-b from-[#1c2235] to-[#121622] rounded-xl border border-[#d4af37]/60 max-w-xs w-full">
                        <Trophy className="w-12 h-12 text-[#d4af37] mx-auto animate-bounce mb-3.5" />
                        <p className="text-xs uppercase font-extrabold text-white tracking-widest">WORLD CUP FINALS</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">{finalMatch.date} ⏤ MetLife Arena</p>
                        
                        <div className="my-4 p-3 bg-black/40 rounded-lg space-y-2 text-left">
                          <div className="flex justify-between items-center text-xs font-bold text-white">
                            <span className="truncate">{home?.flag} {home?.name || finalMatch.homeTeamId}</span>
                            <span className="font-mono text-sm">{finalMatch.homeScore !== null ? finalMatch.homeScore : '—'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-white">
                            <span className="truncate">{away?.flag} {away?.name || finalMatch.awayTeamId}</span>
                            <span className="font-mono text-sm">{finalMatch.awayScore !== null ? finalMatch.awayScore : '—'}</span>
                          </div>
                        </div>
                        
                        <div className="p-2.5 bg-black rounded text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          Winner settlements: <span className="text-[#d4af37] font-bold font-mono">Payout settled dynamically</span> per active rules
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
