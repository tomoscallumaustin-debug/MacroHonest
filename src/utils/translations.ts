import { SupportedLanguage } from "../types";

export interface TranslationStrings {
  appName: string;
  tagline: string;
  dashboard: string;
  calorieGuide: string;
  macroCoach: string;
  searchFoods: string;
  honestPricing: string;
  settings: string;
  
  // Macros & Calories
  calories: string;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
  remaining: string;
  consumed: string;
  target: string;
  overTarget: string;
  
  // Meals
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  allMeals: string;
  
  // AI Logger
  logMealTitle: string;
  aiPromptPlaceholder: string;
  takeOrUploadPhoto: string;
  analyzingWithGemini: string;
  transparentConfidence: string;
  confidenceReason: string;
  honestNote: string;
  itemizedBreakdown: string;
  adjustBeforeSaving: string;
  saveToDailyLog: string;
  manualFallbackTitle: string;
  enterManually: string;
  sampleMeals: string;
  
  // Confidence levels
  confHigh: string;
  confMedium: string;
  confEstimated: string;
  confHighDesc: string;
  confMediumDesc: string;
  confEstimatedDesc: string;

  // Food Database
  foodDatabaseTitle: string;
  searchDatabasePlaceholder: string;
  allCategories: string;
  portion: string;
  addToLog: string;
  usdaVerified: string;
  customFood: string;
  addCustomFoodTitle: string;

  // Honest Paywall
  honestPricingTitle: string;
  noDarkPatternsBadge: string;
  cancelAnytimeBadge: string;
  whyMacroHonest: string;
  lifetimeAccess: string;
  fairMonthly: string;
  oneTimePayment: string;
  monthlyFee: string;
  honestComparisonTitle: string;
  otherAppsLabel: string;
  macroHonestLabel: string;
  supporterActive: string;
  unlockSupporter: string;
  toggleFreeTesting: string;

  // Day navigation
  today: string;
  yesterday: string;
  tomorrow: string;

  // Settings
  macroTargetsTitle: string;
  appearance: string;
  themeDark: string;
  themeLight: string;
  themeSystem: string;
  languageSelect: string;
  dataManagement: string;
  exportDataJson: string;
  exportDataCsv: string;
  resetData: string;
  deleteConfirm: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    appName: "MacroHonest",
    tagline: "Honest AI calorie & macro tracking. Zero bloat, zero traps.",
    dashboard: "Dashboard",
    calorieGuide: "Calorie Guide",
    macroCoach: "AI Coach",
    searchFoods: "Verified Foods",
    honestPricing: "Honest Pricing",
    settings: "Settings",

    calories: "Calories",
    kcal: "kcal",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    remaining: "remaining",
    consumed: "consumed",
    target: "target",
    overTarget: "over target",

    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snacks",
    allMeals: "All Meals",

    logMealTitle: "Log Meal with AI",
    aiPromptPlaceholder: 'Type what you ate (e.g. "2 poached eggs on sourdough with 1/2 avocado")...',
    takeOrUploadPhoto: "Take or Upload Photo",
    analyzingWithGemini: "Analyzing meal transparently with Gemini AI...",
    transparentConfidence: "Transparent Confidence",
    confidenceReason: "Reason",
    honestNote: "Honest Note",
    itemizedBreakdown: "Itemized Ingredients",
    adjustBeforeSaving: "Adjust numbers before saving",
    saveToDailyLog: "Log This Meal",
    manualFallbackTitle: "Manual Meal Entry",
    enterManually: "Enter Manually",
    sampleMeals: "Quick Sample Meals",

    confHigh: "High Confidence",
    confMedium: "Medium Confidence",
    confEstimated: "Estimated Range",
    confHighDesc: "Weights & clear standard portions identified.",
    confMediumDesc: "Mixed dish; visible ingredients with approximate density.",
    confEstimatedDesc: "Restaurant meal with hidden oils/sauces or obscured volume.",

    foodDatabaseTitle: "Verified Food Database",
    searchDatabasePlaceholder: "Search 50+ USDA verified whole foods...",
    allCategories: "All",
    portion: "Portion",
    addToLog: "Add to Log",
    usdaVerified: "USDA Verified",
    customFood: "Custom Food",
    addCustomFoodTitle: "Add Custom Verified Food",

    honestPricingTitle: "Honest, Transparent Pricing",
    noDarkPatternsBadge: "Cancel Anytime • No Hidden Traps",
    cancelAnytimeBadge: "Zero Ads • No 14-Step Cancellation Tricks",
    whyMacroHonest: "Why traditional fitness apps are dishonest",
    lifetimeAccess: "Lifetime Supporter",
    fairMonthly: "Fair Monthly",
    oneTimePayment: "one-time payment, forever yours",
    monthlyFee: "per month, cancel in 1 click",
    honestComparisonTitle: "How MacroHonest Compares",
    otherAppsLabel: "Traditional Fitness Apps",
    macroHonestLabel: "MacroHonest",
    supporterActive: "Lifetime Supporter Active",
    unlockSupporter: "Become an Honest Supporter",
    toggleFreeTesting: "Toggle Free / Supporter for Testing",

    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",

    macroTargetsTitle: "Daily Nutrition Targets",
    appearance: "Theme & Appearance",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    themeSystem: "System Default",
    languageSelect: "Language",
    dataManagement: "Data & Privacy",
    exportDataJson: "Export JSON",
    exportDataCsv: "Export CSV",
    resetData: "Reset All Logged Meals",
    deleteConfirm: "Are you sure? This will remove logged meals for this device.",
  },
  es: {
    appName: "MacroHonest",
    tagline: "Seguimiento honesto de calorías y macros. Sin trampas ni publicidad.",
    dashboard: "Panel",
    calorieGuide: "Guía de Calorías",
    macroCoach: "Coach IA",
    searchFoods: "Alimentos Verificados",
    honestPricing: "Precios Honestos",
    settings: "Ajustes",

    calories: "Calorías",
    kcal: "kcal",
    protein: "Proteína",
    carbs: "Carbohidratos",
    fat: "Grasas",
    remaining: "restantes",
    consumed: "consumidas",
    target: "objetivo",
    overTarget: "sobre el objetivo",

    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Meriendas",
    allMeals: "Todas las comidas",

    logMealTitle: "Registrar con IA",
    aiPromptPlaceholder: 'Escribe lo que comiste (ej. "2 huevos con tostada y medio aguacate")...',
    takeOrUploadPhoto: "Tomar o Subir Foto",
    analyzingWithGemini: "Analizando comida de forma transparente con Gemini...",
    transparentConfidence: "Confianza Transparente",
    confidenceReason: "Motivo",
    honestNote: "Nota Honesta",
    itemizedBreakdown: "Desglose de Ingredientes",
    adjustBeforeSaving: "Ajustar valores antes de guardar",
    saveToDailyLog: "Guardar en el Diario",
    manualFallbackTitle: "Registro Manual",
    enterManually: "Ingresar Manualmente",
    sampleMeals: "Ejemplos Rápidos",

    confHigh: "Confianza Alta",
    confMedium: "Confianza Media",
    confEstimated: "Rango Estimado",
    confHighDesc: "Pesos y porciones estándar claramente identificados.",
    confMediumDesc: "Plato mixto con porciones visuales aproximadas.",
    confEstimatedDesc: "Plato con posibles aceites o salsas no visibles.",

    foodDatabaseTitle: "Base de Datos Verificada",
    searchDatabasePlaceholder: "Buscar alimentos enteros verificados por USDA...",
    allCategories: "Todos",
    portion: "Porción",
    addToLog: "Añadir al Diario",
    usdaVerified: "Verificado USDA",
    customFood: "Alimento Personalizado",
    addCustomFoodTitle: "Añadir Alimento Personalizado",

    honestPricingTitle: "Precios Honestos y Transparentes",
    noDarkPatternsBadge: "Cancela Cuando Quieras • Sin Trampas Ocultas",
    cancelAnytimeBadge: "Cero Publicidad • Sin Encuestas para Cancelar",
    whyMacroHonest: "¿Por qué las apps de fitness tradicionales engañan?",
    lifetimeAccess: "Pase de por Vida",
    fairMonthly: "Mensual Justo",
    oneTimePayment: "pago único, tuyo para siempre",
    monthlyFee: "por mes, cancela en 1 clic",
    honestComparisonTitle: "Comparativa Honesta",
    otherAppsLabel: "Otras Apps de Fitness",
    macroHonestLabel: "MacroHonest",
    supporterActive: "Patrocinador de por Vida Activo",
    unlockSupporter: "Apoyar MacroHonest",
    toggleFreeTesting: "Alternar modo Gratuito / Apoyador",

    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",

    macroTargetsTitle: "Objetivos Nutricionales Diarios",
    appearance: "Tema y Apariencia",
    themeDark: "Modo Oscuro",
    themeLight: "Modo Claro",
    themeSystem: "Predeterminado del Sistema",
    languageSelect: "Idioma",
    dataManagement: "Datos y Privacidad",
    exportDataJson: "Exportar JSON",
    exportDataCsv: "Exportar CSV",
    resetData: "Reiniciar Datos Registrados",
    deleteConfirm: "¿Seguro que deseas eliminar los datos de comidas en este dispositivo?",
  },
  fr: {
    appName: "MacroHonest",
    tagline: "Suivi honnête des calories et macros par IA. Zéro pub, zéro piège.",
    dashboard: "Tableau de bord",
    calorieGuide: "Guide Calories",
    macroCoach: "Coach IA",
    searchFoods: "Aliments Vérifiés",
    honestPricing: "Tarifs Honnêtes",
    settings: "Paramètres",

    calories: "Calories",
    kcal: "kcal",
    protein: "Protéines",
    carbs: "Glucides",
    fat: "Lipides",
    remaining: "restantes",
    consumed: "consommées",
    target: "objectif",
    overTarget: "dépassé",

    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collations",
    allMeals: "Tous les repas",

    logMealTitle: "Enregistrer avec l'IA",
    aiPromptPlaceholder: 'Tapez ce que vous avez mangé (ex: "2 œufs pochés et toast avocat")...',
    takeOrUploadPhoto: "Prendre ou charger une photo",
    analyzingWithGemini: "Analyse transparente avec Gemini IA...",
    transparentConfidence: "Indice de Confiance Transparent",
    confidenceReason: "Justification",
    honestNote: "Remarque Honnête",
    itemizedBreakdown: "Détail des Ingrédients",
    adjustBeforeSaving: "Ajuster avant d'enregistrer",
    saveToDailyLog: "Enregistrer ce repas",
    manualFallbackTitle: "Saisie Manuelle",
    enterManually: "Saisir Manuellement",
    sampleMeals: "Repas Exemples",

    confHigh: "Haute Confiance",
    confMedium: "Confiance Moyenne",
    confEstimated: "Estimation",
    confHighDesc: "Poids et portions standard clairs.",
    confMediumDesc: "Plat composé avec portions estimées.",
    confEstimatedDesc: "Plat de restaurant avec sauces ou huiles masquées.",

    foodDatabaseTitle: "Base d'Aliments Vérifiés",
    searchDatabasePlaceholder: "Rechercher parmi les aliments USDA...",
    allCategories: "Tous",
    portion: "Portion",
    addToLog: "Ajouter au journal",
    usdaVerified: "Vérifié USDA",
    customFood: "Aliment Perso",
    addCustomFoodTitle: "Ajouter un aliment personnalisé",

    honestPricingTitle: "Tarification Honnête & Claire",
    noDarkPatternsBadge: "Résiliation en 1 clic • Zéro Piège Caché",
    cancelAnytimeBadge: "Zéro Pub • Zéro questionnaire de résiliation",
    whyMacroHonest: "Pourquoi les apps classiques vous trompent",
    lifetimeAccess: "Accès à Vie",
    fairMonthly: "Mensuel Équitable",
    oneTimePayment: "paiement unique, à vous pour toujours",
    monthlyFee: "par mois, résiliation instantanée",
    honestComparisonTitle: "Comparatif Sans Filtre",
    otherAppsLabel: "Apps Traditionnelles",
    macroHonestLabel: "MacroHonest",
    supporterActive: "Membre à Vie Actif",
    unlockSupporter: "Soutenir MacroHonest",
    toggleFreeTesting: "Basculer Gratuit / Soutien pour tester",

    today: "Aujourd'hui",
    yesterday: "Hier",
    tomorrow: "Demain",

    macroTargetsTitle: "Objectifs Quotidiens",
    appearance: "Thème & Affichage",
    themeDark: "Mode Sombre",
    themeLight: "Mode Clair",
    themeSystem: "Système",
    languageSelect: "Langue",
    dataManagement: "Données & Confidentialité",
    exportDataJson: "Exporter JSON",
    exportDataCsv: "Exporter CSV",
    resetData: "Réinitialiser les données",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer les repas enregistrés ?",
  },
  de: {
    appName: "MacroHonest",
    tagline: "Ehrliches KI-Kalorien- & Makro-Tracking. Keine Abo-Fallen, keine Werbung.",
    dashboard: "Übersicht",
    calorieGuide: "Kalorien-Guide",
    macroCoach: "KI-Coach",
    searchFoods: "Geprüfte Nahrung",
    honestPricing: "Ehrliche Preise",
    settings: "Einstellungen",

    calories: "Kalorien",
    kcal: "kcal",
    protein: "Protein",
    carbs: "Kohlenhydrate",
    fat: "Fett",
    remaining: "übrig",
    consumed: "verzehrt",
    target: "Ziel",
    overTarget: "über dem Ziel",

    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    snack: "Snacks",
    allMeals: "Alle Mahlzeiten",

    logMealTitle: "Mahlzeit mit KI erfassen",
    aiPromptPlaceholder: 'Was hast du gegessen? (z.B. "2 Eier mit Sauerteigbrot und Avocado")...',
    takeOrUploadPhoto: "Foto aufnehmen oder hochladen",
    analyzingWithGemini: "Transparente Analyse mit Gemini KI...",
    transparentConfidence: "Transparenter Vertrauenswert",
    confidenceReason: "Begründung",
    honestNote: "Ehrlicher Hinweis",
    itemizedBreakdown: "Zutaten-Aufschlüsselung",
    adjustBeforeSaving: "Werte vor dem Speichern anpassen",
    saveToDailyLog: "Mahlzeit speichern",
    manualFallbackTitle: "Manuelle Eingabe",
    enterManually: "Manuell eingeben",
    sampleMeals: "Beispiel-Mahlzeiten",

    confHigh: "Hohe Zuverlässigkeit",
    confMedium: "Mittlere Zuverlässigkeit",
    confEstimated: "Geschätzter Bereich",
    confHighDesc: "Klare Grammzahlen und Standardportionen erkannt.",
    confMediumDesc: "Gemischtes Gericht mit geschätzten Mengen.",
    confEstimatedDesc: "Restaurantmahlzeit mit versteckten Ölen/Saucen.",

    foodDatabaseTitle: "Geprüfte Lebensmittel",
    searchDatabasePlaceholder: "Durchsuche 50+ USDA-geprüfte Lebensmittel...",
    allCategories: "Alle",
    portion: "Portion",
    addToLog: "Zum Tag hinzufügen",
    usdaVerified: "USDA geprüft",
    customFood: "Eigenes Lebensmittel",
    addCustomFoodTitle: "Eigenes Lebensmittel hinzufügen",

    honestPricingTitle: "Ehrliche & Transparente Preise",
    noDarkPatternsBadge: "Jederzeit Kündbar • Keine Versteckten Fallen",
    cancelAnytimeBadge: "Keine Werbung • Kündigung mit 1 Klick",
    whyMacroHonest: "Warum herkömmliche Fitness-Apps unehrlich sind",
    lifetimeAccess: "Lebenslanger Zugang",
    fairMonthly: "Faires Monatsabo",
    oneTimePayment: "Einmalzahlung, für immer deins",
    monthlyFee: "pro Monat, sofort kündbar",
    honestComparisonTitle: "Der ehrliche Vergleich",
    otherAppsLabel: "Typische Fitness-Apps",
    macroHonestLabel: "MacroHonest",
    supporterActive: "Lebenslanger Unterstützer aktiv",
    unlockSupporter: "MacroHonest unterstützen",
    toggleFreeTesting: "Kostenlos / Unterstützer umschalten",

    today: "Heute",
    yesterday: "Gestern",
    tomorrow: "Morgen",

    macroTargetsTitle: "Tägliche Nährwertziele",
    appearance: "Design & Erscheinungsbild",
    themeDark: "Dunkler Modus",
    themeLight: "Heller Modus",
    themeSystem: "Systemstandard",
    languageSelect: "Sprache",
    dataManagement: "Daten & Privatsphäre",
    exportDataJson: "JSON exportieren",
    exportDataCsv: "CSV exportieren",
    resetData: "Alle Daten zurücksetzen",
    deleteConfirm: "Bist du sicher? Dies löscht alle gespeicherten Mahlzeiten auf diesem Gerät.",
  },
  ja: {
    appName: "MacroHonest",
    tagline: "誠実で明瞭なAIカロリー＆マクロ栄養素トラッカー。広告・課金罠ゼロ。",
    dashboard: "ダッシュボード",
    calorieGuide: "カロリー診断",
    macroCoach: "AIコーチ",
    searchFoods: "確認済み食品",
    honestPricing: "誠実な料金",
    settings: "設定",

    calories: "カロリー",
    kcal: "kcal",
    protein: "タンパク質",
    carbs: "炭水化物",
    fat: "脂質",
    remaining: "残り",
    consumed: "摂取済",
    target: "目標",
    overTarget: "目標超過",

    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "間食",
    allMeals: "すべての食事",

    logMealTitle: "AIで食事を記録",
    aiPromptPlaceholder: '食べたものを入力（例：「目玉焼き2個とアボカドトースト」）...',
    takeOrUploadPhoto: "写真を撮影またはアップロード",
    analyzingWithGemini: "Gemini AIで透明性高く分析中...",
    transparentConfidence: "透明な信頼度スコア",
    confidenceReason: "判定理由",
    honestNote: "正直な注記",
    itemizedBreakdown: "食材ごとの内訳",
    adjustBeforeSaving: "保存前に数値を調整可能",
    saveToDailyLog: "ログに記録する",
    manualFallbackTitle: "手動での食事入力",
    enterManually: "手動で入力する",
    sampleMeals: "クイックサンプル",

    confHigh: "高信頼度",
    confMedium: "中信頼度",
    confEstimated: "推定範囲",
    confHighDesc: "正確な量や標準ポーションが明確です。",
    confMediumDesc: "具材が見える混合料理ですが分量は概算です。",
    confEstimatedDesc: "隠れた油やソース、容積が不明瞭な外食料理です。",

    foodDatabaseTitle: "確認済み食品データベース",
    searchDatabasePlaceholder: "USDA確認済みの自然食品を検索...",
    allCategories: "すべて",
    portion: "ポーション",
    addToLog: "ログに追加",
    usdaVerified: "USDA確認済",
    customFood: "カスタム食品",
    addCustomFoodTitle: "カスタム食品を追加",

    honestPricingTitle: "誠実で透明な料金プラン",
    noDarkPatternsBadge: "いつでも解約可能 • 隠し課金罠なし",
    cancelAnytimeBadge: "広告一切なし • 1クリック解約",
    whyMacroHonest: "なぜ従来のフィットネスアプリは不誠実なのか",
    lifetimeAccess: "買い切り生涯プラン",
    fairMonthly: "適正月額プラン",
    oneTimePayment: "一回払いで永久にご利用可能",
    monthlyFee: "月額・いつでも1クリックで解約",
    honestComparisonTitle: "正直な比較",
    otherAppsLabel: "従来のフィットネスアプリ",
    macroHonestLabel: "MacroHonest",
    supporterActive: "生涯サポーター有効",
    unlockSupporter: "サポーターになる",
    toggleFreeTesting: "無料 / サポーター切り替え（テスト用）",

    today: "今日",
    yesterday: "昨日",
    tomorrow: "明日",

    macroTargetsTitle: "1日の栄養目標",
    appearance: "外観テーマ",
    themeDark: "ダークモード",
    themeLight: "ライトモード",
    themeSystem: "システム設定に従う",
    languageSelect: "言語",
    dataManagement: "データとプライバシー",
    exportDataJson: "JSONエクスポート",
    exportDataCsv: "CSVエクスポート",
    resetData: "全食事データを消去",
    deleteConfirm: "本当にこの端末の食事記録をすべて削除しますか？",
  },
  pt: {
    appName: "MacroHonest",
    tagline: "Rastreamento transparente de calorias e macros com IA. Sem armadilhas nem anúncios.",
    dashboard: "Painel",
    calorieGuide: "Guia de Calorias",
    macroCoach: "Coach IA",
    searchFoods: "Alimentos Verificados",
    honestPricing: "Preços Honestos",
    settings: "Configurações",

    calories: "Calorias",
    kcal: "kcal",
    protein: "Proteína",
    carbs: "Carboidratos",
    fat: "Gordura",
    remaining: "restantes",
    consumed: "consumidas",
    target: "meta",
    overTarget: "acima da meta",

    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanches",
    allMeals: "Todas as refeições",

    logMealTitle: "Registrar Refeição com IA",
    aiPromptPlaceholder: 'Digite o que comeu (ex.: "2 ovos fritos com torrada de abacate")...',
    takeOrUploadPhoto: "Tirar ou Enviar Foto",
    analyzingWithGemini: "Analisando com transparência via Gemini IA...",
    transparentConfidence: "Nível de Confiança Transparente",
    confidenceReason: "Motivo",
    honestNote: "Nota Honesta",
    itemizedBreakdown: "Detalhamento dos Ingredientes",
    adjustBeforeSaving: "Ajuste os valores antes de salvar",
    saveToDailyLog: "Registrar Refeição",
    manualFallbackTitle: "Registro Manual",
    enterManually: "Inserir Manualmente",
    sampleMeals: "Refeições de Exemplo",

    confHigh: "Alta Confiança",
    confMedium: "Média Confiança",
    confEstimated: "Faixa Estimada",
    confHighDesc: "Pesos e porções padrão identificados com precisão.",
    confMediumDesc: "Prato misto com porções visuais aproximadas.",
    confEstimatedDesc: "Prato com óleos ou molhos ocultos de restaurante.",

    foodDatabaseTitle: "Banco de Alimentos Verificados",
    searchDatabasePlaceholder: "Buscar alimentos naturais verificados pelo USDA...",
    allCategories: "Todos",
    portion: "Porção",
    addToLog: "Adicionar ao Diário",
    usdaVerified: "Verificado USDA",
    customFood: "Alimento Personalizado",
    addCustomFoodTitle: "Adicionar Alimento Personalizado",

    honestPricingTitle: "Preços Claros e Honestos",
    noDarkPatternsBadge: "Cancele Quando Quiser • Sem Pegadinhas",
    cancelAnytimeBadge: "Zero Anúncios • Cancelamento em 1 Clique",
    whyMacroHonest: "Por que os apps tradicionais enganam você",
    lifetimeAccess: "Acesso Vitalício",
    fairMonthly: "Mensalidade Justa",
    oneTimePayment: "pagamento único, seu para sempre",
    monthlyFee: "por mês, cancelável a qualquer momento",
    honestComparisonTitle: "Comparativo Honesto",
    otherAppsLabel: "Outros Apps de Fitness",
    macroHonestLabel: "MacroHonest",
    supporterActive: "Apoiador Vitalício Ativo",
    unlockSupporter: "Apoiar o MacroHonest",
    toggleFreeTesting: "Alternar Gratuito / Apoiador para Teste",

    today: "Hoje",
    yesterday: "Ontem",
    tomorrow: "Amanhã",

    macroTargetsTitle: "Metas Nutricionais Diárias",
    appearance: "Tema e Aparência",
    themeDark: "Modo Escuro",
    themeLight: "Modo Claro",
    themeSystem: "Padrão do Sistema",
    languageSelect: "Idioma",
    dataManagement: "Dados e Privacidade",
    exportDataJson: "Exportar JSON",
    exportDataCsv: "Exportar CSV",
    resetData: "Limpar Todas as Refeições",
    deleteConfirm: "Tem certeza de que deseja apagar os registros deste dispositivo?",
  },
};
