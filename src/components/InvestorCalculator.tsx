import React, { useState, useEffect } from 'react';
import { CountryShare } from '../types';
import { 
  ChevronDown,
  Sparkles,
  Trophy,
  Mail,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface InvestorCalculatorProps {
  countries: CountryShare[];
  onNavigateMarket?: () => void;
  presetCountryId?: string;
  activeLanguage?: string;
}

export default function InvestorCalculator({ 
  countries = [], 
  onNavigateMarket,
  presetCountryId,
  activeLanguage = 'English'
}: InvestorCalculatorProps) {
  
  // Standard fallback country matches the image example precisely
  const fallbackCountry: CountryShare = {
    id: 'uruguay',
    name: 'Uruguay',
    flag: '🇺🇾',
    rating: 4,
    currentPrice: 17.50,
    winningSettlementPrice: 100.00,
    potentialReturn: 5.71,
    group: 'H',
    ranking: 12,
    popularityScore: 82,
    trending: 'up',
    change24h: 3.5,
    availableShares: 250000,
    status: 'ACTIVE',
    statistics: { wins: 4, draws: 1, losses: 1, goalsScored: 12, goalsConceded: 4, matchesPlayed: 6 },
    description: 'A solid contender from South America.'
  };

  const activeCountries = countries.length > 0 
    ? countries.filter(c => c.status !== 'ELIMINATED') 
    : [fallbackCountry];

  // Selected country state
  const [selectedCountryId, setSelectedCountryId] = useState<string>(() => {
    if (presetCountryId && activeCountries.some(c => c.id === presetCountryId)) {
      return presetCountryId;
    }
    const uruguay = activeCountries.find(c => c.name.toLowerCase() === 'uruguay');
    return uruguay?.id || activeCountries[0]?.id || 'uruguay';
  });

  const selectedCountry = activeCountries.find(c => c.id === selectedCountryId) || activeCountries[0];

  // Stake (Investment Amount) input state - defaults to $2,625.00 from the screenshot
  const [stakeInput, setStakeInput] = useState<string>('2,625.00');
  const [showTooltip, setShowTooltip] = useState(false);

  // Price calculations
  const currentPrice = selectedCountry?.currentPrice || 17.50;
  const winningValuePerShare = selectedCountry?.winningSettlementPrice || 100.00;

  const getNumericalStake = () => {
    const cleanStr = stakeInput.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
  };

  const stakeAmount = getNumericalStake();
  
  // Return Multiplier: winning value / entry price
  const multiplier = currentPrice > 0 ? winningValuePerShare / currentPrice : 0;
  
  // Shares count = Stake Amount / current price
  const sharesCount = currentPrice > 0 ? stakeAmount / currentPrice : 0;
  
  // Potential winning value = shares * winningValuePerShare
  const potentialWinningValue = sharesCount * winningValuePerShare;
  
  // Potential Net Profit = Potential winning value - original stake
  const potentialProfit = potentialWinningValue - stakeAmount;

  // Formatting values on focus/blur
  const handleBlur = () => {
    const amt = getNumericalStake();
    setStakeInput(amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleFocus = () => {
    const amt = getNumericalStake();
    setStakeInput(amt === 0 ? '' : amt.toString());
  };

  // Localized Translation Dictionary
  const translations: Record<string, Record<string, string>> = {
    "English": {
      "calc_title": "FIFA World Cup",
      "calc_title2": "Portfolio Calculator",
      "calc_subtitle": "Analyze and simulate your potential portfolio returns.",
      "select_team": "1. SELECT NATIONAL TEAM",
      "current_price": "Current Share Price",
      "investment_amt": "Investment Amount",
      "stake_capital": "Stake your capital",
      "winning_value": "Potential Winning Value per share",
      "multiplier": "Potential Return Multiplier",
      "settlement_if": "Guaranteed settlement if",
      "wins_tournament": "wins the tournament.",
      "potential_profit": "Potential Profit",
      "calc_returns": "Calculate My Returns",
      "advantages_title": "Strategic Portfolio Advantages & Operations",
      "advantages_desc": "When you predict dynamic tournament progressions with high-potential contenders like {team}, you secure highly secure positions protected by robust liquidity pools. Our platform matches predicted allocations with direct smart escrow contracts to guarantee full settlement transparency.",
      "liquid_title": "Fully Liquid Asset Class",
      "liquid_desc": "Exit your active positions, bank partial gains, or realign allocations dynamically as match trends progress in real-time.",
      "settle_title": "Automatic Fast Settlements",
      "settle_desc": "Winning positions are executed instantly upon match completion, routing settlements directly into your master balance.",
      "help_title": "Need professional help?",
      "help_desc": "Submit a priority ticket directly to our elite assistance concierge desk.",
      "support_email": "support@worldcupstock.space",
      "concierge_online": "Concierge Ticket desk online",
      "response_time": "Response time within 10 minutes",
      "open_ticket": "Open Ticket",
      "tooltip_text": "This potential multiplier shows the compound growth factor of your capital from the current entry price up to the final champion settlement."
    },
    "العربية (Arabic)": {
      "calc_title": "كأس العالم فيفا",
      "calc_title2": "حاسبة المحفظة الاستثمارية",
      "calc_subtitle": "تحليل ومحاكاة العوائد المحتملة لمحفظتك الاستثمارية.",
      "select_team": "١. اختر المنتخب الوطني",
      "current_price": "سعر السهم الحالي",
      "investment_amt": "مبلغ الاستثمار",
      "stake_capital": "استثمر رأس مالك",
      "winning_value": "قيمة الفوز المحتملة للسهم الواحد",
      "multiplier": "مضاعف العائد المحتمل",
      "settlement_if": "تسوية مضمونة إذا فاز منتخب",
      "wins_tournament": "بالبطولة.",
      "potential_profit": "الربح المحتمل",
      "calc_returns": "احسب عوائدي",
      "advantages_title": "المزايا الاستراتيجية للمحفظة والعمليات التشغيلية",
      "advantages_desc": "عندما تتوقع مسارات البطولة الديناميكية لفرق ذات إمكانات واعدة مثل {team}، فإنك تؤمن مراكز قوية ومحمية بمجمعات سيولة مدعومة بالكامل. تطابق منصتنا المخصصات المتوقعة مع عقود ضمان ذكية ومباشرة لضمان شفافية التسوية المطلقة.",
      "liquid_title": "فئة أصول مرنة وعالية السيولة",
      "liquid_desc": "اخرج من مراكزك الاستثمارية النشطة، أو جمد أرباحك الجزئية، أو أعد توزيع الحصص بمرونة مع تغير اتجاهات المباريات في الوقت الفعلي.",
      "settle_title": "تسويات تلقائية فائقة السرعة",
      "settle_desc": "يتم تنفيذ المراكز الفائزة على الفور وبشكل آلي بمجرد انتهاء البطولة، مما يضيف المبالغ مباشرة إلى رصيدك الرئيسي.",
      "help_title": "هل تحتاج لمساعدة احترافية تخص استثماراتك؟",
      "help_desc": "أرسل تذكرة ذات أولوية مباشرة للحصول على مساعدة عاجلة من فريق الدعم المتخصص.",
      "support_email": "support@worldcupstock.space",
      "concierge_online": "مكتب تذاكر المساعدة والدعم متصل الآن",
      "response_time": "وقت الاستجابة المتوقع في غضون ١٠ دقائق",
      "open_ticket": "افتح تذكرة دعم",
      "tooltip_text": "يوضح هذا المضاعف المحتمل عامل النمو المركب لرأس مالك المستثمر بدءاً من سعر الدخول الحالي وحتى القيمة النهائية للتسوية عند الفوز بالبطولة."
    },
    "Español (Spanish)": {
      "calc_title": "FIFA Copa Mundial",
      "calc_title2": "Calculadora de Portafolio",
      "calc_subtitle": "Analice y simule los retornos potenciales de su cartera de inversiones.",
      "select_team": "1. SELECCIONAR SELECCIÓN NACIONAL",
      "current_price": "Precio Actual de la Acción",
      "investment_amt": "Monto de Inversión",
      "stake_capital": "Asegure su capital",
      "winning_value": "Valor de Ganancia Potencial por acción",
      "multiplier": "Multiplicador de Retorno Potencial",
      "settlement_if": "Liquidación garantizada si",
      "wins_tournament": "gana el torneo.",
      "potential_profit": "Beneficio Potencial",
      "calc_returns": "Calcular Mis Retornos",
      "advantages_title": "Ventajas y Operaciones de Portafolio Estratégico",
      "advantages_desc": "Cuando predice progresiones dinámicas del torneo con contendientes de alto potencial como {team}, asegura posiciones altamente seguras protegidas por sólidas reservas de liquidez. Nuestra plataforma combina las asignaciones previstas con contratos de custodia inteligentes directos para garantizar la total transparencia de la liquidación.",
      "liquid_title": "Clase de Activo Totalmente Líquido",
      "liquid_desc": "Salga de sus posiciones activas, asegure ganancias parciales o realinee asignaciones dinámicamente a medida que avanzan las tendencias de los partidos en tiempo real.",
      "settle_title": "Liquidaciones Rápidas Automáticas",
      "settle_desc": "Las posiciones ganadoras se ejecutan instantáneamente al completarse el partido, dirigiendo las liquidaciones directamente a su saldo principal.",
      "help_title": "¿Necesita ayuda profesional?",
      "help_desc": "Envíe un ticket de prioridad directamente a nuestra mesa de conserjería de asistencia de élite.",
      "support_email": "support@worldcupstock.space",
      "concierge_online": "Mesa de asistencia activa",
      "response_time": "Tiempo de respuesta en menos de 10 minutos",
      "open_ticket": "Abrir Ticket",
      "tooltip_text": "Este multiplicador potencial muestra el factor de crecimiento compuesto de su capital desde el precio de entrada actual hasta la liquidación final del campeón."
    },
    "Português (Portuguese)": {
      "calc_title": "FIFA Copa do Mundo",
      "calc_title2": "Calculadora de Portfólio",
      "calc_subtitle": "Analise e simule os retornos potenciais do seu portfólio de investimentos.",
      "select_team": "1. SELECIONAR SELEÇÃO NACIONAL",
      "current_price": "Preço Atual por Ação",
      "investment_amt": "Valor do Investimento",
      "stake_capital": "Aporte seu capital",
      "winning_value": "Valor de Ganho Potencial por ação",
      "multiplier": "Multiplicador de Retorno Potencial",
      "settlement_if": "Liquidação garantizada se",
      "wins_tournament": "vencer o torneio.",
      "potential_profit": "Lucro Potencial",
      "calc_returns": "Calcular Meus Retornos",
      "advantages_title": "Vantagens e Operações Estratégicas do Portfólio",
      "advantages_desc": "Quando você prevê progressões dinâmicas do torneio com candidatos de alto potencial como {team}, você garante posições altamente seguras protegidas por pools de liquidez robustos. Nossa plataforma combina as alocações previstas com contratos de garantia inteligente diretos para garantir total transparência de liquidação.",
      "liquid_title": "Classe de Ativos Totalmente Líquidos",
      "liquid_desc": "Saia de suas posições ativas, garanta lucros parciais ou realinhe alocações dinamicamente conforme as tendências das partidas avançam em tempo real.",
      "settle_title": "Liquidações Rápidas Automáticas",
      "settle_desc": "As posições vencedoras são executadas instantaneamente após a conclusão da partida, direcionando as liquidações diretamente para o seu saldo principal.",
      "help_title": "Precisa de ajuda profissional?",
      "help_desc": "Envie um tíquete de prioridade diretamente para o nosso balcão de atendimento de elite.",
      "support_email": "support@worldcupstock.space",
      "concierge_online": "Mesa de atendimento ativa",
      "response_time": "Tempo de resposta em menos de 10 minutos",
      "open_ticket": "Abrir Chamado",
      "tooltip_text": "Este multiplicador potencial mostra o fator de crescimento composto do seu capital, desde o preço de entrada atual até a liquidação final do campeão."
    },
    "Français (French)": {
      "calc_title": "FIFA Coupe du Monde",
      "calc_title2": "Calculateur de Portefeuille",
      "calc_subtitle": "Analysez et simulez les rendements potentiels de votre portefeuille d'investissements.",
      "select_team": "1. SÉLECTIONNER L'ÉQUIPE NATIONALE",
      "current_price": "Prix Actuel de l'Action",
      "investment_amt": "Montant de l'Investissement",
      "stake_capital": "Engager votre capital",
      "winning_value": "Valeur de Gain Potentielle par action",
      "multiplier": "Multiplicateur de Rendement Potentiel",
      "settlement_if": "Règlement garanti si",
      "wins_tournament": "remporte le tournoi.",
      "potential_profit": "Bénéfice Potentiel",
      "calc_returns": "Calculer Mes Rendements",
      "advantages_title": "Avantages Stratégiques et Opérations du Portefeuille",
      "advantages_desc": "Lorsque vous prédisez des progressions dynamiques de tournois avec des prétendants à fort potentiel comme {team}, vous sécurisez des positions hautement protégées par des pools de liquidités solides. Notre plateforme associe les allocations prévues à des contrats d'escrow intelligents directs pour garantir une transparence totale des règlements.",
      "liquid_title": "Classe d'Actifs Entièrement Liquide",
      "liquid_desc": "Sortez de vos positions actives, encaissez des gains partiels ou réalignez vos allocations de manière dynamique au fur et à mesure que les tendances des matchs évoluent en temps réel.",
      "settle_title": "Règlements Automatiques Rapides",
      "settle_desc": "Les positions gagnantes sont exécutées instantanément à la fin du match, acheminant les règlements directement vers votre solde principal.",
      "help_title": "Besoin d'aide professionnelle ?",
      "help_desc": "Soumettez un ticket prioritaire directement à notre bureau d'assistance d'élite.",
      "support_email": "support@worldcupstock.space",
      "concierge_online": "Bureau d'assistance actif",
      "response_time": "Temps de réponse de moins de 10 minutes",
      "open_ticket": "Ouvrir un Ticket",
      "tooltip_text": "Ce multiplicateur potentiel montre le facteur de croissance composé de votre capital depuis le prix d'entrée actuel jusqu'au règlement final du champion."
    }
  };

  const tLocal = (key: string, variables?: Record<string, string>) => {
    const langDict = translations[activeLanguage] || translations['English'];
    let text = langDict[key] || translations['English'][key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, v);
      });
    }
    return text;
  };

  const isRTL = activeLanguage === 'العربية (Arabic)';

  return (
    <div className="bg-[#030407] min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-white font-sans relative overflow-hidden" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Luxurious visual backdrops matching the gold trophy stadium atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#133723]/30 via-transparent to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-[#251e10]/20 via-transparent to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-9 relative z-10">
        
        {/* Luxury Title Block */}
        <div className="text-center space-y-4">
          <h1 
            className="text-4xl sm:text-5xl font-black font-display tracking-tight text-center uppercase leading-tight"
            style={{
              background: 'linear-gradient(to bottom, #fffae8 0%, #ffd07d 35%, #d4af37 70%, #85630e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.6))'
            }}
          >
            {tLocal('calc_title')}<br />{tLocal('calc_title2')}
          </h1>
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#00ffb0] max-w-md mx-auto drop-shadow-[0_0px_10px_rgba(0,255,176,0.3)] text-center">
            {tLocal('calc_subtitle')}
          </p>
        </div>

        {/* SECTION 1: SELECT NATIONAL TEAM CARD */}
        <div className="bg-gradient-to-b from-[#d4af37]/35 via-[#1b202a]/90 to-[#0c0f15] p-[1.5px] rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
          <div className="bg-gradient-to-b from-[#10141e] to-[#070a0f] rounded-[22.5px] p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
            <div className="space-y-2.5 flex-1 text-left">
              <label className="text-[10.5px] font-black uppercase text-[#ffd07d]/70 tracking-widest block font-display">
                {tLocal('select_team')}
              </label>
              
              {/* Beautiful Select box with premium metallic beveled rim */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#ffd07d]/50 via-[#2e374d]/50 to-[#b58b2a]/15 rounded-xl pointer-events-none p-[1.5px]">
                  <div className="w-full h-full bg-[#0d1016] rounded-xl" />
                </div>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full relative z-10 bg-transparent text-white font-extrabold text-base pl-4.5 pr-12 py-4 rounded-xl focus:outline-none appearance-none cursor-pointer flex items-center gap-2"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {activeCountries.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0e1118] text-white font-bold py-2">
                      {c.flag} &nbsp;&nbsp;{c.name}
                    </option>
                  ))}
                </select>
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 ${isRTL ? 'left-4.5' : 'right-4.5'}`}>
                  <ChevronDown className="w-5 h-5 text-[#ffd366]" />
                </div>
              </div>
            </div>

            {/* Current Share Price display matching mockup style */}
            <div className={`flex flex-col justify-center sm:pl-6 shrink-0 pt-2 sm:pt-0 ${isRTL ? 'text-left' : 'text-right'}`}>
              <span className="text-[10.5px] font-black uppercase text-amber-200/55 tracking-widest block font-display">
                {tLocal('current_price')}
              </span>
              <span 
                className="text-3.5xl sm:text-4xl font-black font-mono tracking-tight text-[#00ffb0] mt-1"
                style={{
                  textShadow: '0 0 20px rgba(0, 255, 176, 0.5)'
                }}
              >
                ${currentPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: MAIN METRICS DISPLAY CARD */}
        <div className="bg-gradient-to-b from-[#d4af37]/35 via-[#161a23]/90 to-[#07090d] p-[1.5px] rounded-[26px] shadow-[0_20px_55px_rgba(0,0,0,0.95)]">
          <div className="bg-gradient-to-b from-[#111520] to-[#080a0f] rounded-[24.5px] p-6 sm:p-8 space-y-7 relative overflow-hidden">
            
            {/* Grid layout precisely matching mockup columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Investment Input & Winning Value */}
              <div className="space-y-6 text-left">
                
                {/* Investment Amount (STAKE YOUR CAPITAL - VERY BIG DESIGN) */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-[#ffd07d]/85 uppercase tracking-wider block font-display">
                    {tLocal('investment_amt')}
                  </label>
                  
                  {/* Stake input with embedded styled box - scaled extremely big & spacious! */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ffd07d]/60 via-[#2e374d]/50 to-[#b58b2a]/30 rounded-2xl pointer-events-none p-[1.5px]">
                      <div className="w-full h-full bg-[#0a0d13] rounded-2xl" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-center px-6 py-6 bg-[#0a0d13]/95 rounded-2xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] gap-3">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-400 uppercase tracking-widest font-display">{tLocal('stake_capital')}</span>
                      <div className="flex items-center justify-between w-full" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span className="text-3xl font-black text-[#00ffb0] drop-shadow-[0_0_10px_rgba(0,255,176,0.4)]">$</span>
                        <input
                          type="text"
                          value={stakeInput}
                          onChange={(e) => setStakeInput(e.target.value)}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          placeholder="0.00"
                          className={`w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-[#00ffb0] focus:outline-none placeholder-emerald-500/30 ${isRTL ? 'text-left pl-3' : 'text-right'}`}
                          style={{
                            textShadow: '0 0 25px rgba(0, 255, 176, 0.65)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Potential Winning Value per share */}
                <div className="space-y-1 pt-1 text-left">
                  <span className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider block leading-normal">
                    {tLocal('winning_value')}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                    ${winningValuePerShare.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Right Column: Multiplier precisely as reference */}
              <div className={`space-y-3 sm:pl-7 text-left ${isRTL ? 'sm:pr-7 sm:pl-0 sm:border-r border-l-0' : 'sm:pl-7 sm:border-l'} border-[#202737]/70`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">
                    {tLocal('multiplier')}
                  </span>
                  
                  {/* Glowing 3D Coin Help trigger matching reference */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="w-6 h-6 rounded-full bg-gradient-to-b from-[#ffd07d] to-[#9a7815] flex items-center justify-center shadow-[0_2px_10px_rgba(212,175,55,0.45)] active:scale-90 transition-transform cursor-pointer border border-white/30"
                    >
                      <Trophy className="w-3 h-3 text-black" />
                    </button>
                    {showTooltip && (
                      <div className={`absolute top-8 w-60 bg-[#111522] border border-[#d4af37]/60 p-3.5 rounded-xl text-[11px] text-gray-300 shadow-2xl z-30 font-bold leading-normal ${isRTL ? 'left-0' : 'right-0'}`}>
                        {tLocal('tooltip_text')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Massive Gold Multiplier */}
                <div 
                  className="text-5.5xl sm:text-6xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(to bottom, #fffae0 0%, #ffd17b 30%, #d4af37 70%, #85630e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0px 3px 8px rgba(212,175,55,0.3))'
                  }}
                >
                  {multiplier.toFixed(2)}x
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed font-bold">
                  {tLocal('settlement_if')} {selectedCountry?.name || 'team'} {tLocal('wins_tournament')}
                </p>
              </div>

            </div>

            {/* SEPARATE POTENTIAL PROFIT BOX WITH MASSIVE DISPLAY AND LUXURY METALLIC GLOW */}
            <div className="bg-gradient-to-b from-[#d4af37]/40 via-[#161a22] to-[#403418]/60 p-[1.5px] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
              <div className="bg-gradient-to-b from-[#0a0d14] to-[#04060b] rounded-[14.5px] p-6.5 sm:p-7.5 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffd07d]/40 to-transparent" />
                
                <span className="text-[12px] sm:text-sm font-black uppercase tracking-widest text-[#ffd07d] block font-display">
                  {tLocal('potential_profit')}
                </span>
                
                {/* Emerald glowing value scaled very big */}
                <div 
                  className="text-4.5xl sm:text-6xl font-black font-mono tracking-tight text-[#00ffb0] mt-3 animate-pulse"
                  style={{
                    textShadow: '0 0 35px rgba(0, 255, 176, 0.75)'
                  }}
                >
                  +{potentialProfit >= 0 ? '' : '-'}${Math.abs(potentialProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM CTA BUTTON WITH GLOWING GREEN AURA */}
        <div className="pt-2 text-center relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#00ffb0] to-[#00b0ff] rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />
          
          <button
            onClick={onNavigateMarket}
            className="relative z-10 w-full sm:w-85 py-4.5 px-10 bg-gradient-to-b from-[#ffe094] via-[#d4af37] to-[#99730a] text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-full shadow-[0_8px_32px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border-t border-white/50"
          >
            {tLocal('calc_returns')}
          </button>
        </div>

        {/* EXPANSIVE DETAILS, POSITIVE COMMENTARY AND SUPPORT CONCIERGE GATEWAY */}
        <div className="bg-gradient-to-b from-[#111520] to-[#080a0e] rounded-3xl p-6 sm:p-8 border border-[#202737]/70 space-y-7 mt-10 shadow-2xl relative text-left">
          
          <div className="space-y-3.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#ffd07d] uppercase tracking-wider font-display flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#ffd07d] shrink-0" />
              {tLocal('advantages_title')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
              {tLocal('advantages_desc', { team: selectedCountry?.name || 'Uruguay' })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0a0d13] p-4.5 rounded-xl border border-[#202737]/45 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-[#00ffb0]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-[10.5px] font-black uppercase tracking-wider block">{tLocal('liquid_title')}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-bold leading-normal">
                {tLocal('liquid_desc')}
              </p>
            </div>

            <div className="bg-[#0a0d13] p-4.5 rounded-xl border border-[#202737]/45 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-[#ffd07d]">
                <Zap className="w-4 h-4 shrink-0" />
                <span className="text-[10.5px] font-black uppercase tracking-wider block">{tLocal('settle_title')}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-bold leading-normal">
                {tLocal('settle_desc')}
              </p>
            </div>
          </div>

          {/* CUSTOM SUPPORT & OPEN TICKET GATEWAY */}
          <div className="border-t border-[#202737]/70 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">{tLocal('help_title')}</h4>
                <p className="text-[11px] text-gray-400 font-bold">{tLocal('help_desc')}</p>
              </div>
              <a 
                href={`mailto:${tLocal('support_email')}`} 
                className="inline-flex items-center gap-2 text-xs font-black text-[#d4af37] hover:text-[#ffdf8a] transition-colors uppercase tracking-wider font-mono"
              >
                <Mail className="w-4 h-4" />
                <span>{tLocal('support_email')}</span>
              </a>
            </div>

            <div className="bg-gradient-to-r from-[#d4af37]/10 to-teal-500/5 p-4.5 rounded-2xl border border-[#d4af37]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center shrink-0 border border-[#d4af37]/25">
                  <MessageSquare className="w-5 h-5 text-[#ffd366]" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#ffd07d] block font-display">{tLocal('concierge_online')}</span>
                  <span className="text-[10px] font-bold text-gray-400">{tLocal('response_time')}</span>
                </div>
              </div>

              <button 
                onClick={() => window.open(`mailto:${tLocal('support_email')}`)}
                className="px-4.5 py-2.5 bg-gradient-to-b from-[#ffd07d] to-[#b58b2a] hover:brightness-110 text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{tLocal('open_ticket')}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
