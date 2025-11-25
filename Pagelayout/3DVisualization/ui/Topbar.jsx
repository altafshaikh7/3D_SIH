
import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, ChevronRight, Bell, AlertTriangle } from 'lucide-react';




// --- Fuzzy Search Helpers ---

// Calculate Levenshtein distance between two strings
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const indicator = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + indicator // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

// Calculate match score (0-100)
const getMatchScore = (item, query) => {
    const nameLower = item.name.toLowerCase();
    const idLower = item.id.toLowerCase();
    const typeLower = item.type.toLowerCase();
    const q = query.toLowerCase().trim();
    
    // 1. Exact matches (Highest priority)
    if (nameLower === q || idLower === q) return 100;
    
    // 2. Starts with matches
    if (nameLower.startsWith(q) || idLower.startsWith(q)) return 90;

    // 3. Contains matches
    if (nameLower.includes(q) || idLower.includes(q)) return 80;

    // 4. Token-based Fuzzy Match (Handle typos and multi-word queries)
    const targetTokens = [
        ...nameLower.split(/[\s-_]+/), 
        ...idLower.split(/[\s-_]+/), 
        typeLower
    ].filter(t => t.length > 0);
    
    const queryTokens = q.split(/[\s-_]+/).filter(t => t.length > 0);
    
    if (queryTokens.length === 0) return 0;

    let totalTokenScore = 0;
    let matchedTokens = 0;

    // Check each word in the query against all words in the target
    for (const qToken of queryTokens) {
        let bestTokenScore = 0;
        
        for (const tToken of targetTokens) {
            // A. Substring match for token
            if (tToken.includes(qToken)) {
                bestTokenScore = Math.max(bestTokenScore, 70); 
            } 
            // B. Typo tolerance (Levenshtein)
            else if (qToken.length >= 3) { // Only fuzzy match if query token is 3+ chars
                 const dist = levenshteinDistance(qToken, tToken);
                 // Allow tolerance proportional to length (approx 30-40%)
                 const tolerance = Math.max(2, Math.floor(qToken.length * 0.4));
                 
                 if (dist <= tolerance) {
                     // Score reduces as distance increases
                     const fuzzyScore = 60 - (dist * 10);
                     bestTokenScore = Math.max(bestTokenScore, fuzzyScore);
                 }
            }
        }

        if (bestTokenScore > 0) {
            totalTokenScore += bestTokenScore;
            matchedTokens++;
        }
    }

    // We only consider it a match if a significant portion of query tokens matched
    // (e.g. if I type "Left Trans", both should match something)
    const matchRatio = matchedTokens / queryTokens.length;
    
    if (matchRatio >= 0.5) { // At least half the words matched
        return totalTokenScore / queryTokens.length;
    }

    return 0;
};

const Topbar = ({ title, onSearchSelect, alarmCount = 0 }) => {
  const [time, setTime] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate a search index of all major components in the scene
  const searchIndex = useMemo(() => {
      const items = [];
      
      // Control Rooms
      items.push({ id: 'CR-MAIN', name: 'Main Control HQ', type: 'unknown' });
      items.push({ id: 'CR-GEN', name: 'Side B Control Room', type: 'unknown' });
      items.push({ id: 'GEN-01', name: 'Turbo-Generator Unit 1', type: 'generator' });
      items.push({ id: 'BAT-BLDG', name: 'Battery Room Annex', type: 'unknown' });
      items.push({ id: 'BAT-110V-DC', name: '110V DC Battery Bank', type: 'unknown' });

      // Transformers (Left and Right Sides)
      ['L', 'R'].forEach(side => {
          const sideName = side === 'L' ? 'Left' : 'Right';
          for(let i = 1; i <= 8; i++) {
              items.push({ id: `T-${side}-${i}`, name: `${sideName} Side Transformer ${i}`, type: 'transformer' });
              items.push({ id: `GANTRY-LINE-${side}-${i}`, name: `${sideName} Gantry Tower ${i}`, type: 'unknown' });
              // Breakers
              for(let phase = 0; phase < 3; phase++) {
                  const phaseName = ['A', 'B', 'C'][phase];
                  items.push({ id: `CB-${side}-${i}-${phase}`, name: `${sideName} Breaker ${i} Ph-${phaseName}`, type: 'breaker' });
              }
          }
      });

      return items;
  }, []);

  const filteredItems = useMemo(() => {
      if (!searchText || searchText.trim() === '') return [];
      
      return searchIndex
          .map(item => ({ item, score: getMatchScore(item, searchText) }))
          .filter(result => result.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(result => result.item)
          .slice(0, 8); // Limit to top 8 results
  }, [searchText, searchIndex]);

  const handleSelect = (item) => {
      if (onSearchSelect) onSearchSelect(item);
      setSearchText(item.name);
      setShowResults(false);
  };

  return (
    <div className="w-full h-16 flex items-center justify-center px-8 bg-transparent relative z-50">
      {/* Search Bar - Centered */}
      <div className="w-full max-w-xl relative">
         <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-black transition-colors" />
            </div>
            <input 
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white text-black placeholder-slate-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black sm:text-sm transition-all duration-200 shadow-sm"
                placeholder="Search component (e.g. Trnsformr, T-L-1)..."
                value={searchText}
                onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
            />
            {searchText && (
                <button 
                    onClick={() => {
                        setSearchText('');
                        setShowResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-black"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
         </div>

         {/* Search Results Dropdown */}
         {showResults && searchText && (
             <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto custom-scrollbar overflow-x-hidden">
                 {filteredItems.length > 0 ? (
                     filteredItems.map((item) => (
                         <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                         >
                             <div>
                                 <div className="text-sm font-medium text-black group-hover:text-slate-900">
                                     {item.name}
                                 </div>
                                 <div className="text-xs text-slate-500 font-mono">
                                     ID: {item.id} <span className="mx-1">•</span> <span className="capitalize">{item.type}</span>
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                         </button>
                     ))
                 ) : (
                     <div className="px-4 py-4 text-center text-slate-500 text-sm">
                         No components found matching "{searchText}"
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Right Side: Alarms & Time */}
      <div className="absolute right-8 flex items-center gap-6">
        
        {/* Alarm Counter */}
        <div className="relative cursor-help group flex items-center justify-center">
           <div className={`p-2 rounded-full transition-colors ${alarmCount > 0 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-slate-400'}`}>
               <Bell size={24} />
           </div>
           {alarmCount > 0 && (
               <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                   {alarmCount > 9 ? '9+' : alarmCount}
               </span>
           )}
           
           {/* Alarm Tooltip/Dropdown */}
           {alarmCount > 0 && (
               <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-red-200 rounded-xl shadow-xl p-4 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 transform translate-y-2 group-hover:translate-y-0">
                   <div className="flex items-center gap-2 text-red-600 mb-2 border-b border-slate-100 pb-2">
                       <AlertTriangle size={16} />
                       <span className="font-bold text-xs tracking-wider">SYSTEM ALERTS</span>
                   </div>
                   <p className="text-xs text-slate-600 leading-relaxed">
                       There {alarmCount === 1 ? 'is' : 'are'} <span className="font-bold text-black">{alarmCount}</span> unacknowledged alarm{alarmCount === 1 ? '' : 's'} requiring immediate attention.
                   </p>
               </div>
           )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

        {/* Time Display */}
        <div className="hidden lg:flex flex-col items-end text-black font-mono">
            <span className="text-lg font-bold leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="text-xs text-slate-500">{time.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
