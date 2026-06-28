import React, { useState } from 'react';
import { Users, Coins, TrendingUp, Trophy, Calendar, Activity, BookOpen, ShieldCheck, UserPlus, LogIn, FileText, Play, AlertTriangle, Youtube, ExternalLink, Tv, Gift, HelpCircle } from 'lucide-react';
import { MarketStat } from '../types';

interface HeroSectionProps {
  stats: MarketStat;
  onNavigateToMarket: () => void;
  onNavigateToTournament?: () => void;
  onSelectTab?: (tab: 'all' | 'trending' | 'speculative' | 'group') => void;
  onNavigateToSection?: (section: 'dashboard' | 'market' | 'live-data' | 'tournament' | 'how-it-works' | 'admin' | 'support' | 'referral' | 'calculator') => void;
  onTriggerCreateAccount?: () => void;
  onTriggerLogin?: () => void;
  activeLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
}

export default function HeroSection({ 
  stats, 
  onNavigateToMarket, 
  onNavigateToTournament, 
  onSelectTab,
  onNavigateToSection,
  onTriggerCreateAccount,
  onTriggerLogin,
  activeLanguage = 'English',
  onChangeLanguage
}: HeroSectionProps) {
  const [playClicked, setPlayClicked] = useState(false);

  // Localized Dictionary for Hero Content - Supports 13 world languages
  const translations: Record<string, Record<string, string>> = {
    "English": {
      "badge": "🏆 WORLD'S BEST FOOTBALL STOCK MARKETPLACE",
      "main_title": "Own Shares In Your Favorite World Cup Team",
      "main_sub": "Buy shares in teams to win big if they become champions!",
      "millionaire_title": "✨ PERFECT OPPORTUNITY TO BECOME A MILLIONAIRE! ✨",
      "millionaire_desc": "This World Cup match is coming to change lives forever! It is your absolute perfect time and opportunity to become a millionaire. Buy shares now at an ultra-cheaper rate and win bigger when the country you support wins the championship!",
      "video_title": "🔴 FIFA LIVE The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner",
      "click_to_play": "CLICK TO PLAY STREAM",
      "buy_shares_now": "Buy Shares Now",
      "view_teams": "View Tournament Teams",
      "market_tab": "World Cup Market",
      "market_sub": "Equities & Indexes",
      "live_tab": "Live Data Center",
      "live_sub": "Fixtures & Scores",
      "tournament_tab": "Tournament & Teams",
      "tournament_sub": "Standings & Groups",
      "support_tab": "Support Center",
      "support_sub": "Official Desk",
      "how_tab": "How It Works",
      "how_sub": "Platform Guide",
      "refer_tab": "Refer & Earn",
      "refer_sub": "15% Wallet Bonus",
      "register": "Register",
      "register_sub": "Create Account",
      "login": "Login",
      "login_sub": "Existing User",
      "calc_tab": "World Cup Stock Calculator",
      "calc_sub": "Simulate Returns",
      "security_title": "100% Platform & Account Safety",
      "security_desc": "All transactions, wallets, and shared assets are protected with end-to-end security and real-time monitoring.",
      "backed_col": "SAFE DEPOSITS",
      "backed_val": "100% PROTECTED",
      "audits": "VERIFIED SYSTEM",
      "secured": "100% SECURED",
      "index_title": "Tournaments & Teams Index:",
      "squads": "⚽ All Squads",
      "trending": "🔥 Trending"
    },
    "العربية (Arabic)": {
      "badge": "🏆 أفضل سوق لتداول أسهم كرة القدم في العالم",
      "main_title": "امتلك أسهماً في فريقك المفضل بكأس العالم",
      "main_sub": "اشترِ أسهم المنتخبات لتربح مكاسب هائلة إذا أصبحوا أبطالاً!",
      "millionaire_title": "✨ الفرصة المثالية لتصبح مليونيراً! ✨",
      "millionaire_desc": "مباريات كأس العالم هذه قادمة لتغير حياتك إلى الأبد! إنها فرصتك ووقتك المثالي تماماً لتصبح مليونيراً. اشترِ الأسهم الآن بأسعار رخيصة جداً واربح مكاسب أكبر عندما يتوج البلد الذي تدعمه بالبطولة!",
      "video_title": "🔴 بث مباشر فيفا: حفل جوائز الأفضل لعام ٢٠٢٥ | عشاء الاحتفال بالبطل",
      "click_to_play": "انقر لتشغيل البث المباشر",
      "buy_shares_now": "اشترِ الأسهم الآن",
      "view_teams": "عرض منتخبات البطولة",
      "market_tab": "سوق كأس العالم",
      "market_sub": "الأسهم والمؤشرات",
      "live_tab": "مركز البيانات المباشر",
      "live_sub": "المباريات والنتائج",
      "tournament_tab": "البطولة والفرق",
      "tournament_sub": "الترتيب والمجموعات",
      "support_tab": "مركز الدعم الفني",
      "support_sub": "المكتب الرسمي",
      "how_tab": "كيف تعمل المنصة",
      "how_sub": "دليل الاستثمار",
      "refer_tab": "شارك واربح",
      "refer_sub": "١٥٪ مكافأة محفظة",
      "register": "تسجيل جديد",
      "register_sub": "إنشاء حساب",
      "login": "تسجيل الدخول",
      "login_sub": "مستثمر حالي",
      "calc_tab": "حاسبة أسهم كأس العالم",
      "calc_sub": "محاكاة العوائد",
      "security_title": "أمان وحماية كاملة للمنصة",
      "security_desc": "جميع المعاملات المالية والمحافظ والأسهم محمية بالكامل بتشفير مصرفي ومراقبة نشطة.",
      "backed_col": "إيداعات آمنة",
      "backed_val": "محمي بنسبة ١٠٠٪",
      "audits": "نظام موثق",
      "secured": "آمن ومحمي ١٠٠٪",
      "index_title": "فهرس البطولة والفرق:",
      "squads": "⚽ جميع المنتخبات",
      "trending": "🔥 الأكثر تداولاً"
    },
    "Español (Spanish)": {
      "badge": "🏆 EL MEJOR MERCADO DE VALORES DE FÚTBOL DEL MUNDO",
      "main_title": "Sea dueño de acciones de su equipo favorito de la Copa Mundial",
      "main_sub": "¡Compre acciones de equipos para ganar en grande si se convierten en campeones!",
      "millionaire_title": "✨ ¡OPORTUNIDAD PERFECTA PARA CONVERTIRSE EN MILLONARIO! ✨",
      "millionaire_desc": "¡Este partido de la Copa Mundial viene para cambiar vidas para siempre! Es tu momento y oportunidad perfectos para convertirte en millonario. ¡Compre acciones ahora a un precio ultra-barato y gane más cuando el país que apoya gane el campeonato!",
      "video_title": "🔴 FIFA EN VIVO The Best FIFA Football Awards™ 2025 | Cena de Gala FIFA",
      "click_to_play": "HAGA CLIC PARA REPRODUCIR",
      "buy_shares_now": "Comprar Acciones Ahora",
      "view_teams": "Ver Equipos del Torneo",
      "market_tab": "Mercado Mundial",
      "market_sub": "Acciones e Índices",
      "live_tab": "Centro de Datos",
      "live_sub": "Partidos y Resultados",
      "tournament_tab": "Torneo y Equipos",
      "tournament_sub": "Posiciones y Grupos",
      "support_tab": "Centro de Soporte",
      "support_sub": "Mesa Oficial",
      "how_tab": "Cómo Funciona",
      "how_sub": "Guía de la Plataforma",
      "refer_tab": "Recomendar y Ganar",
      "refer_sub": "Bono de Cartera 15%",
      "register": "Registrarse",
      "register_sub": "Crear Cuenta",
      "login": "Iniciar Sesión",
      "login_sub": "Usuario Existente",
      "calc_tab": "Calculadora de Acciones",
      "calc_sub": "Simular Retornos",
      "security_title": "Seguridad de Plataforma y Cuenta al 100%",
      "security_desc": "Todas las transacciones, saldos y acciones están totalmente protegidos con cifrado de grado bancario y seguridad verificada.",
      "backed_col": "DEPÓSITOS SEGUROS",
      "backed_val": "100% PROTEGIDO",
      "audits": "SISTEMA VERIFICADO",
      "secured": "100% SEGURO",
      "index_title": "Índice de Torneos y Equipos:",
      "squads": "⚽ Todos los Equipos",
      "trending": "🔥 Tendencias"
    },
    "Português (Portuguese)": {
      "badge": "🏆 O MELHOR MERCADO DE AÇÕES DE FUTEBOL DO MUNDO",
      "main_title": "Seja Dono de Ações da Sua Seleção Favorita da Copa do Mundo",
      "main_sub": "Compre ações de seleções para ganhar muito se elas forem campeãs!",
      "millionaire_title": "✨ OPORTUNIDADE PERFEITA PARA SE TORNAR UM MILIONÁRIO! ✨",
      "millionaire_desc": "Esta Copa do Mundo está chegando para mudar vidas para sempre! É o seu momento e oportunidade perfeitos para se tornar um milionário. Compre ações agora a uma taxa super barata e ganhe muito mais quando o país que você apoia ganhar o campeonato!",
      "video_title": "🔴 FIFA AO VIVO The Best FIFA Football Awards™ 2025 | Jantar de Gala FIFA",
      "click_to_play": "CLIQUE PARA REPRODUZIR",
      "buy_shares_now": "Comprar Ações Agora",
      "view_teams": "Ver Seleções do Torneio",
      "market_tab": "Mercado da Copa",
      "market_sub": "Ações e Índices",
      "live_tab": "Central de Jogos",
      "live_sub": "Partidas e Placar",
      "tournament_tab": "Torneio e Seleções",
      "tournament_sub": "Tabela e Grupos",
      "support_tab": "Central de Suporte",
      "support_sub": "Mesa Oficial",
      "how_tab": "Como Funciona",
      "how_sub": "Guia do Usuário",
      "refer_tab": "Indique e Ganhe",
      "refer_sub": "Bônus de Carteira 15%",
      "register": "Registrar",
      "register_sub": "Criar Conta",
      "login": "Entrar",
      "login_sub": "Usuário Existente",
      "calc_tab": "Calculadora da Copa",
      "calc_sub": "Simular Retornos",
      "security_title": "100% Segurança de Plataforma e Conta",
      "security_desc": "Todas as transações, saldos e ações estão totalmente protegidos com criptografia de nível bancário e segurança verificada.",
      "backed_col": "DEPÓSITOS SEGUROS",
      "backed_val": "100% PROTEGIDO",
      "audits": "SISTEMA VERIFICADO",
      "secured": "100% SEGURO",
      "index_title": "Índice de Torneios e Seleções:",
      "squads": "⚽ Todas as Seleções",
      "trending": "🔥 Tendências"
    },
    "Français (French)": {
      "badge": "🏆 LE MEILLEUR MARCHÉ D'ACTIONS DE FOOTBALL AU MONDE",
      "main_title": "Possédez des Actions de Votre Équipe Préférée de la Coupe du Monde",
      "main_sub": "Achetez des actions pour gagner gros si elles deviennent championnes !",
      "millionaire_title": "✨ L'OPPORTUNITÉ PARFAITE DE DEVENIR MILLIONNAIRE ! ✨",
      "millionaire_desc": "Ce match de la Coupe du Monde va changer des vies pour toujours ! C'est le moment idéal pour devenir millionnaire. Achetez des actions à un tarif ultra-avantageux et gagnez encore plus lorsque le pays que vous soutenez remporte le championnat !",
      "video_title": "🔴 FIFA EN DIRECT The Best FIFA Football Awards™ 2025 | Dîner Officiel de Gala",
      "click_to_play": "CLIQUEZ POUR REPRODUIRE",
      "buy_shares_now": "Acheter des Actions",
      "view_teams": "Voir les Équipes",
      "market_tab": "Marché de la Coupe",
      "market_sub": "Actions et Indices",
      "live_tab": "Centre des Matchs",
      "live_sub": "Rencontres et Scores",
      "tournament_tab": "Tournoi & Équipes",
      "tournament_sub": "Classement et Groupes",
      "support_tab": "Support Center",
      "support_sub": "Bureau Officiel",
      "how_tab": "Comment ça marche",
      "how_sub": "Guide d'Investissement",
      "refer_tab": "Parrainer & Gagner",
      "refer_sub": "15% Bonus Portefeuille",
      "register": "S'inscrire",
      "register_sub": "Créer Compte",
      "login": "Se Connecter",
      "login_sub": "Utilisateur Existant",
      "calc_tab": "Calculateur d'Actions",
      "calc_sub": "Simuler les Gains",
      "security_title": "Sécurité 100% Plateforme & Comptes",
      "security_desc": "Toutes les transactions, soldes et actions sont entièrement protégés par un cryptage de niveau bancaire et une sécurité vérifiée.",
      "backed_col": "DÉPÔTS SÉCURISÉS",
      "backed_val": "100% PROTÉGÉ",
      "audits": "SYSTÈME VÉRIFIÉ",
      "secured": "100% SÉCURISÉ",
      "index_title": "Index des Équipes:",
      "squads": "⚽ Toutes les Équipes",
      "trending": "🔥 Tendances"
    },
    "Deutsch (German)": {
      "badge": "🏆 DER WELTBESTE FUSSBALL-AKTIENMARKT",
      "main_title": "Besitzen Sie Aktien Ihres Lieblings-WM-Teams",
      "main_sub": "Kaufen Sie Aktien von Teams, um groß zu gewinnen, wenn sie Weltmeister werden!",
      "millionaire_title": "✨ PERFEKTE GELEGENHEIT, MILLIONÄR ZU WERDEN! ✨",
      "millionaire_desc": "Dieses WM-Turnier wird Leben für immer verändern! Es ist Ihre absolut perfekte Gelegenheit, Millionär zu werden. Kaufen Sie jetzt Aktien zu extrem günstigen Preisen und gewinnen Sie groß, wenn das Land, das Sie unterstützen, die Meisterschaft gewinnt!",
      "video_title": "🔴 FIFA LIVE The Best FIFA Football Awards™ 2025 | Gala-Celebration Dinner",
      "click_to_play": "KLICKEN, UM STREAM ABZUSPIELEN",
      "buy_shares_now": "Aktien jetzt kaufen",
      "view_teams": "WM-Teams anzeigen",
      "market_tab": "WM-Markt",
      "market_sub": "Aktien & Indizes",
      "live_tab": "Live-Datenzentrum",
      "live_sub": "Spiele & Stände",
      "tournament_tab": "Turnier & Teams",
      "tournament_sub": "Tabellen & Gruppen",
      "support_tab": "Support-Center",
      "support_sub": "Offizielle Hilfe",
      "how_tab": "Wie es funktioniert",
      "how_sub": "Anleitung",
      "refer_tab": "Freunde werben",
      "refer_sub": "15% Wallet-Bonus",
      "register": "Registrieren",
      "register_sub": "Konto erstellen",
      "login": "Einloggen",
      "login_sub": "Anleger Login",
      "calc_tab": "WM-Aktienrechner",
      "calc_sub": "Gewinne simulieren",
      "security_title": "100% Plattform- & Kontosicherheit",
      "security_desc": "Alle Transaktionen, Salden und Aktien sind durch erstklassige Verschlüsselung und geprüfte Sicherheitsverfahren geschützt.",
      "backed_col": "SICHERE EINLAGEN",
      "backed_val": "100% GESCHÜTZT",
      "audits": "GEPRÜFTES SYSTEM",
      "secured": "100% GESICHERT",
      "index_title": "Turnier- & Team-Verzeichnis:",
      "squads": "⚽ Alle Mannschaften",
      "trending": "🔥 Angesagt"
    },
    "Italiano (Italian)": {
      "badge": "🏆 IL MIGLIOR MERCATO AZIONARIO DI CALCIO AL MONDO",
      "main_title": "Possiedi Azioni della Tua Squadra del Cuore dei Mondiali",
      "main_sub": "Acquista azioni per vincere alla grande se diventano campioni!",
      "millionaire_title": "✨ OPPORTUNITÀ PERFETTA PER DIVENTARE MILIONARIO! ✨",
      "millionaire_desc": "Questa Coppa del Mondo cambierà le vite per sempre! È il tuo momento ideale per diventare milionario. Acquista subito le azioni a un prezzo ultra-economico e vinci ancora di più quando il paese che tifi vince il campionato!",
      "video_title": "🔴 FIFA LIVE The Best FIFA Football Awards™ 2025 | Cena di Gala FIFA",
      "click_to_play": "CLICCA PER RIPRODURRE LO STREAM",
      "buy_shares_now": "Compra Azioni Ora",
      "view_teams": "Vedi Squadre del Torneo",
      "market_tab": "Mercato Mondiali",
      "market_sub": "Azioni e Indici",
      "live_tab": "Centro Dati Live",
      "live_sub": "Risultati e Calendari",
      "tournament_tab": "Torneo e Squadre",
      "tournament_sub": "Classifiche e Gruppi",
      "support_tab": "Support Center",
      "support_sub": "Mesa Ufficiale",
      "how_tab": "Come Funziona",
      "how_sub": "Guida della Piattaforma",
      "refer_tab": "Invita e Guadagna",
      "refer_sub": "15% Wallet Bonus",
      "register": "Registrati",
      "register_sub": "Crea Account",
      "login": "Accedi",
      "login_sub": "Investitore Esistente",
      "calc_tab": "Calcolatore Azioni",
      "calc_sub": "Simula Guadagni",
      "security_title": "Sicurezza al 100% di Piattaforma e Account",
      "security_desc": "Tutte le transazioni, i saldi e le azioni sono protetti con crittografia di livello bancario e sicurezza verificata.",
      "backed_col": "DEPOSITI SICURI",
      "backed_val": "100% PROTETTO",
      "audits": "SISTEMA VERIFICATO",
      "secured": "100% PROTETTO",
      "index_title": "Indice Tornei e Squadre:",
      "squads": "⚽ Tutte le Squadre",
      "trending": "🔥 Di Tendenza"
    },
    "日本語 (Japanese)": {
      "badge": "🏆 世界最高のサッカー株式取引所",
      "main_title": "お気に入りのワールドカップチームの株式を所有しよう",
      "main_sub": "チームの株式を購入し、優勝した際に莫大な利益を手に入れましょう！",
      "millionaire_title": "✨ 億万長者になるための完璧なチャンス！ ✨",
      "millionaire_desc": "このワールドカップの戦いは人生を永遠に変えるものです！億万長者になるための絶対的に完璧なタイミングと機会です。今すぐ格安の価格で株式を購入し、応援する国が優勝した際により大きなリターンを手にしましょう！",
      "video_title": "🔴 FIFA ライブ配信 The Best FIFA Football Awards™ 2025 | 授賞記念祝賀会",
      "click_to_play": "クリックして配信を再生",
      "buy_shares_now": "今すぐ株式を購入",
      "view_teams": "トーナメントチームを見る",
      "market_tab": "サッカー株式市場",
      "market_sub": "株式＆インデックス",
      "live_tab": "ライブデータセンター",
      "live_sub": "日程＆スコア",
      "tournament_tab": "大会＆全チーム",
      "tournament_sub": "順位表＆グループ",
      "support_tab": "サポートセンター",
      "support_sub": "公式デスク",
      "how_tab": "ご利用ガイド",
      "how_sub": "投資ガイダンス",
      "refer_tab": "友達を招待",
      "refer_sub": "15%の残高ボーナス",
      "register": "会員登録",
      "register_sub": "アカウント新規作成",
      "login": "ログイン",
      "login_sub": "既存ユーザー",
      "calc_tab": "ワールドカップ株計算機",
      "calc_sub": "シミュレーター",
      "security_title": "100% 安全なプラットフォーム＆アカウント保護",
      "security_desc": "すべての取引、残高、保有株式は、銀行レベル of 暗号化と検証済みセキュリティによって安全に保護されています。",
      "backed_col": "安全な預金管理",
      "backed_val": "100% 保護済み",
      "audits": "システム監査完了",
      "secured": "100% 安全保障",
      "index_title": "大会＆チーム別インデックス:",
      "squads": "⚽ すべての代表チーム",
      "trending": "🔥 急上昇中"
    },
    "中文 (Chinese)": {
      "badge": "🏆 全球领先的足球队股权股票交易中心",
      "main_title": "购买并拥有您心仪的世界杯国家队股票",
      "main_sub": "购买队伍股权，若他们夺冠，您将赢得丰厚的超级回报！",
      "millionaire_title": "✨ 成为百万富翁的绝佳完美机会！ ✨",
      "millionaire_desc": "这届世界杯即将彻底改变无数人的命运！这是您成为百万富翁的绝对完美时机。现在以极低的极优价格购买股票，在您支持的国家夺冠时赚取数倍的超级巨额回报！",
      "video_title": "🔴 国际足联现场直播：2025 年度最佳颁奖典礼 | 冠军庆功晚宴",
      "click_to_play": "点击播放实时直播",
      "buy_shares_now": "立即购买股票",
      "view_teams": "查看参赛国家队",
      "market_tab": "世界杯股市",
      "market_sub": "个股与大盘指数",
      "live_tab": "赛事数据中心",
      "live_sub": "实时赛程与积分",
      "tournament_tab": "锦标赛与球队",
      "tournament_sub": "小组赛出线形势",
      "support_tab": "客服中心",
      "support_sub": "官方交易支持",
      "how_tab": "运作原理",
      "how_sub": "新手入市指南",
      "refer_tab": "邀请新客赢奖",
      "refer_sub": "得15%钱包充值金",
      "register": "立即开户",
      "register_sub": "注册新投资账户",
      "login": "登录交易",
      "login_sub": "老客户登录",
      "calc_tab": "世界杯股票收益计算器",
      "calc_sub": "预估投资回报",
      "security_title": "100% 平台与账户资金安全保障",
      "security_desc": "所有交易、余额和持仓股票均受到银行级加密与多重安全防护，确保资金万无一失。",
      "backed_col": "安全存款保护",
      "backed_val": "100% 安全保障",
      "audits": "系统合规审计",
      "secured": "100% 投资安全保障",
      "index_title": "锦标赛与参赛队索引:",
      "squads": "⚽ 查看全部国家队",
      "trending": "🔥 热门榜单"
    },
    "Türkçe (Turkish)": {
      "badge": "🏆 DÜNYANIN EN İYİ FUTBOL HİSSE SENEDİ BORSASI",
      "main_title": "Favori Dünya Kupası Takımınızın Hisselerine Sahip Olun",
      "main_sub": "Şampiyon olurlarsa büyük kazanmak için takımların hisselerini satın alın!",
      "millionaire_title": "✨ MİLYONER OLMAK İÇİN MÜKEMMEL BİR FIRSAT! ✨",
      "millionaire_desc": "Bu Dünya Kupası maçı hayatları sonsuza dek değiştirmek için geliyor! Milyoner olmak için mutlak mükemmel zamanınız ve fırsatınız. Şimdi hisseleri ultra ucuz fiyattan satın alın ve desteklediğiniz ülke şampiyon olduğunda daha büyük kazanın!",
      "video_title": "🔴 FIFA CANLI YAYIN The Best FIFA Football Awards™ 2025 | FIFA Kutlama Yemeği",
      "click_to_play": "YAYINI BAŞLATMAK İÇİN TIKLAYIN",
      "buy_shares_now": "Hisse Satın Al",
      "view_teams": "Turnuva Takımlarını Gör",
      "market_tab": "Dünya Kupası Borsası",
      "market_sub": "Hisseler & Endeksler",
      "live_tab": "Canlı Veri Merkezi",
      "live_sub": "Fikstürler & Skorlar",
      "tournament_tab": "Turnuva & Takımlar",
      "tournament_sub": "Puan Durumu & Gruplar",
      "support_tab": "Destek Merkezi",
      "support_sub": "Resmi Masa",
      "how_tab": "Nasıl Çalışır",
      "how_sub": "Platform Kılavuzu",
      "refer_tab": "Davet Et & Kazan",
      "refer_sub": "%15 Cüzdan Bonusu",
      "register": "Kayıt Ol",
      "register_sub": "Hesap Oluştur",
      "login": "Giriş Yap",
      "login_sub": "Yatırımcı Girişi",
      "calc_tab": "Dünya Kupası Hesaplayıcı",
      "calc_sub": "Getiriyi Hesapla",
      "security_title": "%100 Güvenli Platform ve Hesap Koruması",
      "security_desc": "Tüm işlemler, bakiyeler ve hisseler banka düzeyinde şifreleme ve doğrulanmış güvenlik sistemleri ile korunmaktadır.",
      "backed_col": "GÜVENLİ MEVDUAT",
      "backed_val": "%100 KORUMALI",
      "audits": "DOĞRULANMIŞ SİSTEM",
      "secured": "%100 GÜVENLİ",
      "index_title": "Turnuva & Takım Endeksi:",
      "squads": "⚽ Tüm Kadrolar",
      "trending": "🔥 Trendler"
    },
    "Nederlands (Dutch)": {
      "badge": "🏆 'S WERELDS BESTE VOETBAL AANDELENMARKT",
      "main_title": "Bezit Aandelen in Jouw Favoriete WK-Team",
      "main_sub": "Koop aandelen in teams om groots te winnen als ze kampioen worden!",
      "millionaire_title": "✨ DE PERFECTE KANS OM MILJONAIR TE WORDEN! ✨",
      "millionaire_desc": "Dit WK is er om levens voorgoed te veranderen! Dit is jouw absolute perfecte moment en kans om miljonair te worden. Koop nu aandelen tegen een ultra-goedkoop tarief en win groter wanneer het land dat jij steunt het kampioenschap wint!",
      "video_title": "🔴 FIFA LIVE The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner",
      "click_to_play": "KLIK OM STREAM AF TE SPELEN",
      "buy_shares_now": "Koop Aandelen Nu",
      "view_teams": "Bekijk Toernooiteams",
      "market_tab": "Wereldbeker Markt",
      "market_sub": "Aandelen & Indexen",
      "live_tab": "Live Wedstrijdcentrum",
      "live_sub": "Uitslagen & Standen",
      "tournament_tab": "Toernooi & Teams",
      "tournament_sub": "Groepen & Stand",
      "support_tab": "Support desk",
      "support_sub": "Officiële Support",
      "how_tab": "Hoe het werkt",
      "how_sub": "Platform Handleiding",
      "refer_tab": "Nieuwe Klant Actie",
      "refer_sub": "15% Bonus Saldo",
      "register": "Registreren",
      "register_sub": "Account Aanmaken",
      "login": "Inloggen",
      "login_sub": "Bestaande Belegger",
      "calc_tab": "WK Aandelenrechner",
      "calc_sub": "Simuleer Rendement",
      "security_title": "100% Platform- & Accountbeveiliging",
      "security_desc": "Alle transacties, saldi en aandelen zijn volledig beveiligd met bankkwaliteit encryptie en geverifieerde veiligheid.",
      "backed_col": "VEILIGE DEPOSITO'S",
      "backed_val": "100% BEVEILIGD",
      "audits": "GEVERIFIEERD SYSTEEM",
      "secured": "100% BEVEILIGD",
      "index_title": "Toernooien & Teams Index:",
      "squads": "⚽ Alle Selecties",
      "trending": "🔥 Trending"
    },
    "Русский (Russian)": {
      "badge": "🏆 ЛУЧШАЯ В МИРЕ БИРЖА ФУТБОЛЬНЫХ АКЦИЙ",
      "main_title": "Владейте акциями своей любимой сборной ЧМ",
      "main_sub": "Покупайте акции команд, чтобы выиграть по-крупному, если они станут чемпионами!",
      "millionaire_title": "✨ ИДЕАЛЬНЫЙ ШАНС СТАТЬ МИЛЛИОНЕРОМ! ✨",
      "millionaire_desc": "Этот чемпионат мира призван изменить жизни навсегда! Это ваше абсолютно идеальное время и возможность стать миллионером. Покупайте акции прямо сейчас по сверхнизким ценам и выигрывайте по-крупному, когда страна, которую вы поддерживаете, завоюет кубок!",
      "video_title": "🔴 FIFA LIVE Церемония наград The Best FIFA Football Awards™ 2025 | Праздничный ужин в эфире",
      "click_to_play": "НАЖМИТЕ ДЛЯ ПРОСМОТРА ТРАНСЛЯЦИИ",
      "buy_shares_now": "Купить акции сейчас",
      "view_teams": "Посмотреть все сборные",
      "market_tab": "Рынок ЧМ",
      "market_sub": "Акции и Индексы",
      "live_tab": "Центр матчей ЧМ",
      "live_sub": "Счет и Расписание",
      "tournament_tab": "Турнир и Команды",
      "tournament_sub": "Таблицы и Группы",
      "support_tab": "Техподдержка",
      "support_sub": "Официальный стол",
      "how_tab": "Как это работает",
      "how_sub": "Руководство инвестора",
      "refer_tab": "Партнерская программа",
      "refer_sub": "15% Бонус на баланс",
      "register": "Регистрация",
      "register_sub": "Открыть счет",
      "login": "Вход",
      "login_sub": "Для инвесторов",
      "calc_tab": "Калькулятор доходности",
      "calc_sub": "Моделировать прибыль",
      "security_title": "100% безопасность платформы и аккаунтов",
      "security_desc": "Все транзакции, балансы и акции полностью защищены сквозным шифрованием банковского уровня и проверенными системами безопасности.",
      "backed_col": "БЕЗОПАСНЫЕ ДЕПОЗИТЫ",
      "backed_val": "100% ЗАЩИЩЕНО",
      "audits": "ПРОВЕРЕННАЯ СИСТЕМА",
      "secured": "100% ЗАЩИЩЕНО",
      "index_title": "Каталог турниров и сборных:",
      "squads": "⚽ Все сборные",
      "trending": "🔥 Тренды дня"
    },
    "한국어 (Korean)": {
      "badge": "🏆 세계 최고의 축구 국가대표팀 주식 거래소",
      "main_title": "당신이 사랑하는 월드컵 국가대표팀의 주주가 되십시오",
      "main_sub": "팀 주식을 매수하고, 해당 국가가 챔피언이 되었을 때 엄청난 이익을 차지하십시오!",
      "millionaire_title": "✨ 백만장자가 될 수 있는 절대적인 절호의 기회! ✨",
      "millionaire_desc": "이번 월드컵 경기는 인생을 영원히 바꿀 것입니다! 백만장자가 될 수 있는 완벽한 시기이자 기회입니다. 지금 매우 저렴한 우대 가격으로 주식을 선점하고, 응원하는 국가가 우승 트로피를 차지할 때 엄청난 잭팟을 터뜨리십시오!",
      "video_title": "🔴 FIFA 생중계: 2025 더 베스트 FIFA 풋볼 어워드™ | 우승 축하 디너 갈라쇼",
      "click_to_play": "클릭하여 실시간 중계 보기",
      "buy_shares_now": "국가대표팀 주식 매수하기",
      "view_teams": "토너먼트 참가팀 확인",
      "market_tab": "월드컵 주식시장",
      "market_sub": "대표주 & 인덱스",
      "live_tab": "실시간 데이터 센터",
      "live_sub": "경기 일정 및 라이브 스코어",
      "tournament_tab": "대회 현황 및 팀",
      "tournament_sub": "그룹 스테이지 및 순위",
      "support_tab": "고객지원팀",
      "support_sub": "공식 전용창구",
      "how_tab": "이용방법 가이드",
      "how_sub": "투자 교육 매뉴얼",
      "refer_tab": "초대코드 리워드",
      "refer_sub": "예치금 15% 보너스 지급",
      "register": "회원가입",
      "register_sub": "계좌 신규 개설",
      "login": "로그인",
      "login_sub": "기존 주주 로그인",
      "calc_tab": "월드컵 주식 계산기",
      "calc_sub": "시뮬레이션 도구",
      "security_title": "100% 플랫폼 및 자산 계정 안전 보장",
      "security_desc": "모든 거래 내역, 예치금 잔액, 보유 주식은 은행 수준의 최고급 암호화 기술과 검증된 보안 체계로 철저히 보호됩니다.",
      "backed_col": "안전 예치 보호",
      "backed_val": "100% 안전 보장",
      "audits": "보안성 감사 완료",
      "secured": "100% 자산 보호 처리됨",
      "index_title": "锦标赛 및 대표팀 인덱스:",
      "squads": "⚽ 전체 국가대표팀 스쿼드",
      "trending": "🔥 화제의 급상승 종목"
    }
  };

  const tLocal = (key: string) => {
    const langDict = translations[activeLanguage] || translations['English'];
    return langDict[key] || translations['English'][key] || key;
  };

  const splitMainTitle = (lang: string, fullTitle: string): [string, string] => {
    const splits: Record<string, [string, string]> = {
      "English": ["Own Shares In Your", "Favorite World Cup Team"],
      "العربية (Arabic)": ["امتلك أسهماً في", "فريقك المفضل بكأس العالم"],
      "Español (Spanish)": ["Sea dueño de acciones de su", "equipo favorito de la Copa Mundial"],
      "Português (Portuguese)": ["Seja Dono de Ações da Sua", "Seleção Favorita da Copa do Mundo"],
      "Français (French)": ["Possédez des Actions de Votre", "Équipe Préférée de la Coupe du Monde"],
      "Deutsch (German)": ["Besitzen Sie Aktien", "Ihres Lieblings-WM-Teams"],
      "Italiano (Italian)": ["Possiedi Azioni della Tua", "Squadra del Cuore dei Mondiali"],
      "日本語 (Japanese)": ["お気に入りの", "ワールドカップチームの株式を所有しよう"],
      "中文 (Chinese)": ["购买并拥有您心仪的", "世界杯国家队股票"],
      "Türkçe (Turkish)": ["Favori", "Dünya Kupası Takımınızın Hisselerine Sahip Olun"],
      "Nederlands (Dutch)": ["Bezit Aandelen in Jouw", "Favoriete WK-Team"],
      "Русский (Russian)": ["Владейте акциями своей", "любимой сборной ЧМ"],
      "한국어 (Korean)": ["당신이 사랑하는", "월드컵 국가대표팀의 주주가 되십시오"]
    };
    return splits[lang] || [fullTitle, ""];
  };

  const isRTL = activeLanguage === 'العربية (Arabic)';

  return (
    <div className="relative pb-1" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      
      {/* Immersive Stadium Hero Background Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        
        {/* Centered Golden Badge Pill */}
        <div className="inline-flex items-center space-x-2 bg-[#d4af37]/10 border border-[#d4af37]/35 rounded-full px-5 py-2 mb-6 shadow-[0_0_15px_rgba(212,175,55,0.1)] select-none">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#d4af37] font-sans">
            {tLocal('badge')}
          </span>
        </div>

        {/* Dynamic Display Typography Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display uppercase tracking-tight leading-[0.95] mb-4.5 max-w-5xl mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          {(() => {
            const [p1, p2] = splitMainTitle(activeLanguage, tLocal('main_title'));
            return (
              <>
                {p1} <span className="text-[#ffd053] block sm:inline">{p2}</span>
              </>
            );
          })()}
        </h1>

        <p className="text-sm sm:text-lg md:text-xl font-bold text-gray-300 tracking-wide max-w-3xl mx-auto mb-9 font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {tLocal('main_sub')}
        </p>

        {/* Glowing Perfect Opportunity Millionaire Container */}
        <div className="w-full max-w-4xl mx-auto mb-11 p-[1.5px] rounded-2xl bg-gradient-to-r from-[#ffd700]/40 via-[#222c42]/80 to-[#ffd700]/40 shadow-[0_10px_40px_rgba(212,175,55,0.15)] select-none">
          <div className="bg-gradient-to-b from-[#111726]/98 to-[#0b0e17]/98 rounded-[15px] p-6 sm:p-8 text-center border border-white/5">
            <h3 className="text-sm sm:text-base font-black text-[#ffd053] font-display uppercase tracking-wider mb-2.5 drop-shadow-[0_2px_8px_rgba(255,208,83,0.4)]">
              {tLocal('millionaire_title')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-3xl mx-auto">
              {tLocal('millionaire_desc')}
            </p>
          </div>
        </div>

        {/* Fully Interactive FIFA LIVE Streaming & Award Presentation Video Hub */}
        <div id="hero-presentation-video" className="w-full max-w-4xl mx-auto bg-[#0a0d16] border-2 border-[#d4af37] rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(212,175,55,0.25)] mb-11 select-none">
          {/* Top video panel status bar */}
          <div className="bg-[#101423] px-4 py-3 border-b border-[#d4af37]/30 flex items-center justify-between text-left">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="font-extrabold text-xs sm:text-sm text-white font-sans tracking-wide uppercase leading-none">
                {tLocal('video_title')}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-0.5 bg-red-600 rounded text-[9px] font-black text-white uppercase tracking-wider">
              Live Stream
            </div>
          </div>

          {/* Interactive Player Frame */}
          <div className="relative aspect-video w-full bg-[#05060b] flex items-center justify-center">
            {!playClicked ? (
              <div 
                className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center bg-cover bg-center group"
                style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url("/image-2.jpg")' }}
                onClick={() => setPlayClicked(true)}
              >
                {/* Big pulse play icon inside a premium circle button */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-110 group-hover:scale-110 active:scale-95 duration-200 cursor-pointer">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current translate-x-0.5" />
                </div>
                <button
                  className="mt-4 px-6 py-2.5 bg-black/80 hover:bg-[#d4af37] border border-[#d4af37] hover:border-black rounded-full text-white hover:text-black font-extrabold font-mono text-xs tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] cursor-pointer"
                >
                  {tLocal('click_to_play')}
                </button>
              </div>
            ) : (
              <iframe 
                id="hero-presentation-video-frame"
                className="w-full h-full"
                src="https://www.youtube.com/embed/g6bE49qD_Wc?autoplay=1" 
                title="FIFA Live Stream Presentation"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Action Buttons matching screenshot closely */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full select-none mb-8">
          <button
            onClick={onNavigateToMarket}
            className="px-10 py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-bold font-display text-xs rounded-lg shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:from-white hover:to-[#fbbf24] transition-all duration-300 transform active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            {tLocal('buy_shares_now')}
          </button>
          
          <button
            onClick={onNavigateToTournament || onNavigateToMarket}
            className="px-8 py-3.5 bg-[#141822] hover:bg-[#1f2433] border border-[#2e3545] rounded-lg text-white font-medium text-xs transition-all duration-200 text-center cursor-pointer uppercase tracking-wider"
          >
            {tLocal('view_teams')}
          </button>
        </div>

        {/* ==================== PROFESSIONAL INVESTOR NAVIGATION MENU ==================== */}
        <div id="investor-navigation-menu" className="w-full max-w-5xl bg-[#0b0e17]/95 border-2 border-[#d4af37] rounded-2xl p-2 sm:p-3 shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-10 select-none mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full text-left">
            
            {/* Column 1: World Cup Market */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (onNavigateToSection) onNavigateToSection('market');
                  else onNavigateToMarket();
                }}
                className="h-full flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <TrendingUp className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                <div className="text-center md:text-left">
                  <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">{tLocal('market_tab')}</span>
                  <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">{tLocal('market_sub')}</span>
                </div>
              </button>
            </div>

            {/* Column 2: Live Data Center */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigateToSection?.('live-data')}
                className="h-full flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <Activity className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                <div className="text-center md:text-left">
                  <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">{tLocal('live_tab')}</span>
                  <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">{tLocal('live_sub')}</span>
                </div>
              </button>
            </div>

            {/* Column 3: Tournament & Teams (with Support Center under it) */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (onNavigateToSection) onNavigateToSection('tournament');
                  else if (onNavigateToTournament) onNavigateToTournament();
                }}
                className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <Trophy className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                <div className="text-center md:text-left">
                  <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">{tLocal('tournament_tab')}</span>
                  <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">{tLocal('tournament_sub')}</span>
                </div>
              </button>

              <button
                onClick={() => onNavigateToSection?.('support')}
                className="flex flex-col md:flex-row items-center justify-center gap-2 px-3 py-2 bg-[#121623] hover:bg-[#1b2135] border border-[#d4af37]/25 hover:border-[#d4af37]/60 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <HelpCircle className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform shrink-0" />
                <div className="text-center md:text-left">
                  <span className="block font-extrabold text-[10px] tracking-wider uppercase text-[#d4af37]">{tLocal('support_tab')}</span>
                  <span className="hidden md:block text-[8px] text-gray-400 font-medium font-sans">{tLocal('support_sub')}</span>
                </div>
              </button>
            </div>

            {/* Column 4: How It Works (with Refer & Earn under it) */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigateToSection?.('how-it-works')}
                className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <FileText className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                <div className="text-center md:text-left">
                  <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">{tLocal('how_tab')}</span>
                  <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">{tLocal('how_sub')}</span>
                </div>
              </button>

              <button
                onClick={() => onNavigateToSection?.('referral')}
                className="flex flex-col md:flex-row items-center justify-center gap-2 px-3 py-2 bg-[#121623] hover:bg-[#1b2135] border border-[#d4af37]/25 hover:border-[#d4af37]/60 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
              >
                <Gift className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform shrink-0" />
                <div className="text-center md:text-left">
                  <span className="block font-extrabold text-[10px] tracking-wider uppercase text-emerald-400">{tLocal('refer_tab')}</span>
                  <span className="hidden md:block text-[8px] text-gray-400 font-medium font-sans">{tLocal('refer_sub')}</span>
                </div>
              </button>
            </div>

            {/* Column 5: Create Account, Login, Calculator & Language Drodown */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 w-full">
                <button
                  onClick={() => {
                    if (onTriggerCreateAccount) onTriggerCreateAccount();
                    else onNavigateToSection?.('how-it-works');
                  }}
                  className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 px-2.5 py-4 bg-[#d4af37] hover:bg-white text-black rounded-xl transition-all transform active:scale-95 cursor-pointer group"
                >
                  <UserPlus className="w-4.5 h-4.5 text-black group-hover:scale-110 transition-transform shrink-0" />
                  <div className="text-center md:text-left">
                    <span className="block font-black text-[11px] tracking-wider uppercase leading-none">{tLocal('register')}</span>
                    <span className="hidden md:block text-[8px] text-black/80 font-semibold font-sans mt-0.5">{tLocal('register_sub')}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onTriggerLogin) onTriggerLogin();
                    else onNavigateToSection?.('how-it-works');
                  }}
                  className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 px-2.5 py-4 bg-[#d4af37] hover:bg-white text-black rounded-xl transition-all transform active:scale-95 cursor-pointer group"
                >
                  <LogIn className="w-4.5 h-4.5 text-black group-hover:scale-110 transition-transform shrink-0" />
                  <div className="text-center md:text-left">
                    <span className="block font-black text-[11px] tracking-wider uppercase leading-none">{tLocal('login')}</span>
                    <span className="hidden md:block text-[8px] text-black/80 font-semibold font-sans mt-0.5">{tLocal('login_sub')}</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => onNavigateToSection?.('calculator')}
                className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-b from-[#ffdf8a] to-[#d4af37] hover:bg-white text-black rounded-xl transition-all transform active:scale-95 cursor-pointer group animate-pulse"
              >
                <TrendingUp className="w-5 h-5 text-black group-hover:scale-110 transition-transform shrink-0" />
                <div className="text-center md:text-left">
                  <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">{tLocal('calc_tab')}</span>
                  <span className="hidden md:block text-[9px] text-black/80 font-medium font-sans">{tLocal('calc_sub')}</span>
                </div>
              </button>

              {/* Fully Localized Action Box Language Dropdown beside them */}
              <div className="w-full bg-[#121623] hover:bg-[#1b2135] border border-[#d4af37]/35 rounded-xl px-2.5 py-2.5 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#d4af37]">🌍</span>
                  <div className="text-left">
                    <span className="block text-[9px] font-black text-white leading-none tracking-wider uppercase">Language</span>
                    <span className="block text-[8px] text-gray-400 font-medium">Select Region</span>
                  </div>
                </div>
                <select
                  value={activeLanguage}
                  onChange={(e) => onChangeLanguage?.(e.target.value)}
                  className="bg-[#0b0e17] text-white border border-[#d4af37]/35 rounded px-1.5 py-0.5 text-[10px] font-extrabold cursor-pointer focus:outline-none focus:border-[#d4af37] transition-all"
                >
                  <option value="English">English</option>
                  <option value="العربية (Arabic)">العربية</option>
                  <option value="Español (Spanish)">Español</option>
                  <option value="Português (Portuguese)">Português</option>
                  <option value="Français (French)">Français</option>
                  <option value="Deutsch (German)">Deutsch</option>
                  <option value="Italiano (Italian)">Italiano</option>
                  <option value="日本語 (Japanese)">日本語</option>
                  <option value="中文 (Chinese)">中文</option>
                  <option value="Türkçe (Turkish)">Türkçe</option>
                  <option value="Nederlands (Dutch)">Nederlands</option>
                  <option value="Русский (Russian)">Русский</option>
                  <option value="한국어 (Korean)">한국어</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== EXTRA HIGH-TRUST SECURITY SHIELD SECTION ==================== */}
        <div id="investor-security-shield-hub" className="w-full max-w-5xl bg-gradient-to-r from-[#101422] to-[#0a0d16] border border-[#20293d] rounded-2xl p-5 sm:p-6 shadow-xl text-left select-none mb-14 mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-white text-base sm:text-lg lg:text-xl font-display uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-white bg-clip-text text-transparent">
                  {tLocal('security_title')}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                  {tLocal('security_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4 shrink-0 w-full md:w-auto">
              <div className="p-3 bg-neutral-900/60 border-2 border-[#d4af37]/50 rounded-xl flex-1 md:flex-initial text-center md:text-left shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="block text-[9px] uppercase tracking-widest text-[#d4af37] font-extrabold font-mono">{tLocal('backed_col')}</span>
                <span className="block text-sm sm:text-base font-black text-white font-mono mt-0.5">{tLocal('backed_val')}</span>
              </div>
              <div className="p-3 bg-neutral-900/60 border border-[#20293d] rounded-xl flex-1 md:flex-initial text-center md:text-left">
                <span className="block text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold font-mono font-sans">{tLocal('audits')}</span>
                <span className="block text-xs font-black text-emerald-400 font-sans mt-1">{tLocal('secured')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments & Teams shortcut tab panel (originally sub-menu under buy shares now) */}
        <div className="flex flex-col items-center gap-5 bg-[#0e1322]/95 backdrop-blur-md border border-[#212f4c] rounded-3xl p-6 sm:p-8 shadow-2xl select-none w-full max-w-5xl mx-auto">
          <span className="text-sm sm:text-base font-black text-[#d4af37] uppercase tracking-widest font-sans flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d4af37] animate-pulse" /> {tLocal('index_title')}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 max-w-xl mx-auto w-full mt-2">
            <button 
              onClick={() => { onSelectTab?.('all'); onNavigateToMarket(); }} 
              className="bg-[#18233d] hover:bg-[#223154] border border-[#2f4068] text-white hover:text-[#d4af37] font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:border-[#d4af37]/50 hover:scale-[1.04] active:scale-[0.96]"
            >
              {tLocal('squads')}
            </button>
            <button 
              onClick={() => { onSelectTab?.('trending'); onNavigateToMarket(); }} 
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-400 hover:text-amber-300 font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.04] active:scale-[0.96]"
            >
              {tLocal('trending')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
