// Keep this list intentionally finite: it drives locale detection, the dashboard
// selector, and the storefront fallback behavior.
export const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'da',
  'no', 'fi', 'cs', 'tr', 'ja', 'ko', 'zh', 'ar', 'he', 'ru',
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

type TranslationValue = string;
type TranslationKey = keyof typeof EN;

const EN = {
  language: 'Language',
  english: 'English',
  spanish: 'Español',
  french: 'Français',
  german: 'Deutsch',
  refresh: 'Refresh',
  createCampaign: 'Create Campaign',
  overview: 'Overview',
  campaigns: 'Campaigns',
  smartRecommendations: 'Smart Recommendations',
  storefrontPreview: 'Storefront Preview',
  billingPlan: 'Billing & Plan',
  increaseAov: 'Increase Average Order Value (AOV) with smart upsell recommendations on the Thank You page.',
  searchProducts: 'Search products',
  selected: '{count} selected',
  clearAll: 'Clear all',
  noProductsMatch: 'No products match “{search}”',
  noProductsFound: 'No products found in your store',
  outOfStock: 'Out of stock',
  loadMoreProducts: 'Load more products',
  attributedRevenue: 'Attributed Additional Revenue',
  postPurchaseSales: '+100% post-purchase sales',
  offerImpressions: 'Offer Impressions',
  totalViews: 'Total views on Thank You page',
  clickThroughRate: 'Click-Through Rate (CTR)',
  totalClicks: '{count} total clicks',
  conversionRate: 'Offer Conversion Rate',
  acceptedOffers: '{count} accepted offers paid',
  recommendationEngine: 'Smart Recommendation Engine',
  recommendationSubtitle: 'Hybrid recommendation pipeline with automated candidate validation',
  active: 'Active',
  paused: 'Paused',
  acceptanceRate: 'Offer Acceptance Rate: {value}%',
  recommendationDescription: 'Intelligently ranks candidate products from your Wix Stores catalogue in real time, validating price, stock, and complementary relevance without modifying original orders.',
  configureEngine: 'Configure Engine',
  campaignPerformance: 'Campaign Performance',
  campaign: 'Campaign',
  impressions: 'Impressions',
  clicks: 'Clicks',
  purchases: 'Purchases',
  revenue: 'Revenue',
  conversion: 'Conversion',
  noCampaignActivity: 'No campaign activity yet',
  testPurchase: 'Complete a test purchase in your store to see real-time impression and conversion data.',
  activeCampaigns: 'Active Upsell & Cross-Sell Campaigns',
  campaignSubtitle: 'Target offers by order subtotal, purchased items, or AI recommendations',
  newCampaign: 'New Campaign',
  noCampaigns: 'No campaigns found',
  firstCampaign: 'Create your first campaign to start recommending complementary products.',
  campaignName: 'Campaign Name',
  mode: 'Mode',
  discount: 'Discount',
  minimumOrder: 'Min Order',
  status: 'Status',
  campaignPriority: 'Priority',
  actions: 'Actions',
  noMinimum: 'No minimum',
  edit: 'Edit',
  pause: 'Pause',
  activate: 'Activate',
  editCampaign: 'Edit Post-Purchase Campaign',
  createNewCampaign: 'Create New Post-Purchase Campaign',
  updateParameters: 'Update targeting and discount parameters',
  configureParameters: 'Configure targeting and discount parameters',
  saving: 'Saving...',
  saveChanges: 'Save Changes',
  saveActivate: 'Save & Activate',
  cancel: 'Cancel',
  recommendationMode: 'Recommendation Mode',
  automaticRecommendations: 'Automatic Smart Recommendations',
  planRequired: 'Automatic Smart Recommendations (Pro or Business required)',
  hybridMode: 'Hybrid (Merchant + Smart Rules)',
  rulesMode: 'Deterministic Rules (Category & Price)',
  manualMode: 'Manual Products Only',
  merchantProducts: 'Merchant-selected products',
  manualDescription: 'Manual campaigns show all selected products, in the order you picked them, skipping anything the customer just bought. AI, Rules, and Hybrid campaigns can show up to 4 offers.',
  discountPercentage: 'Discount Percentage (%)',
  minimumSubtotal: 'Minimum Order Subtotal',
  productPlaceholder: 'e.g. Phone Accessories Upsell',
  smartPlanError: 'AI recommendations require a Pro or Business plan.',
  billingUnavailable: "Billing details aren't available",
  billingUnavailableSubtitle: "We couldn't load your plan right now. Refresh the page to try again.",
  currentPlan: 'Current plan',
  development: 'Development',
  noPlan: 'No plan',
  freeTrial: 'Free trial',
  notRenewing: 'Not renewing',
  showingSavedPlan: 'Showing your saved plan',
  savedPlanDescription: "We couldn't reach Wix billing, so plan details may be out of date.",
  developmentMode: 'Development mode',
  developmentDescription: 'Plan restrictions are bypassed for development testing. Production will enforce Wix plan limits.',
  offersOff: 'Your offers are turned off',
  choosePlan: 'Choose a plan',
  choosePlanDescription: 'Choose Pro or Business to show post-purchase offers to your customers. Both start with a {days}-day free trial.',
  managePlan: 'Manage plan',
  planEnds: 'Your free trial ends on {date}',
  planStarts: 'Your plan starts automatically when the trial ends, so your offers keep running.',
  usage: 'Usage',
  thisMonth: 'This month',
  aiRecommendations: 'AI recommendations',
  requests: 'requests',
  campaignsUnit: 'campaigns',
  billedMonthly: 'Billed monthly',
  billedYearly: 'Billed yearly',
  billedTwoYears: 'Billed every 2 years',
  billedThreeYears: 'Billed every 3 years',
  yourPlan: 'Your plan',
  billedThroughWix: 'Billed through Wix',
  developmentOverride: 'Development override',
  startFreeTrial: 'Start free trial',
  switchTo: 'Switch to {plan}',
  mainHeading: 'Main Heading',
  subheading: 'Subheading',
  productCards: 'Product Cards',
  actionButton: 'Action Button (CTA)',
  containerLayout: 'Container & Layout',
  postPurchaseSettings: 'Post-Purchase Offers Settings',
  headingText: 'Heading Text',
  subheadingText: 'Subheading Text',
  buttonLabel: 'Button Label',
  headingFont: 'Heading Font',
  subheadingFont: 'Subheading Font',
  productTitleFont: 'Product Title Font',
  productTitleColor: 'Product Title Color',
  priceFont: 'Price Font',
  priceColor: 'Price Color',
  recommendationNoteFont: 'Recommendation Note Font',
  recommendationNoteColor: 'Recommendation Note Color',
  discountBadgeBackground: 'Discount Badge Background',
  discountBadgeTextColor: 'Discount Badge Text Color',
  buttonFont: 'Button Font',
  buttonBackground: 'Button Background',
  buttonTextColor: 'Button Text Color',
  containerBackground: 'Container Background',
  cornerRadius: 'Corner Radius ({value}px)',
  editFont: 'Edit Font',
  selectFont: 'Select Font',
  findingDeals: 'Finding exclusive deals for your order...',
  specialOffer: 'Special Offer',
  savePercent: 'SAVE {percent}%',
  addToCart: 'Add to Cart',
  addingToCart: 'Adding to Cart...',
  addedToCart: 'Added to Cart ✓',
  redirecting: 'Redirecting to Checkout...',
  chooseOptions: 'Choose options',
  chooseOption: 'Choose {option}',
  continue: 'Continue',
  dismissOffer: 'Dismiss offer',
  noThanks: 'No thanks, dismiss',
  checkoutFailed: 'Unable to add offer to checkout. Please try again.',
  loadOptionsFailed: 'Unable to load this product’s options. Please try again.',
  selectOption: 'Please select an option for this product.',
  unavailableCombination: 'That combination is unavailable. Please choose another option.',
  appTitle: 'Smart Post-Purchase Offers',
  loadSelectedProductsFailed: 'Could not load the products selected for this campaign',
  loadStoreProductsFailed: 'Could not load store products',
  updateCampaignFailed: 'Could not update the campaign',
  campaignUpdated: 'Campaign updated',
  campaignActivated: 'Campaign activated',
  campaignPaused: 'Campaign paused',
  campaignDeleted: 'Campaign deleted',
  deleteCampaignQuestion: 'Delete campaign?',
  checkCampaignFields: 'Please check the campaign fields',
  failedUpdateCampaign: 'Failed to update campaign',
  failedCreateCampaign: 'Failed to create campaign',
  saveCampaignFailed: 'Could not save campaign. Please try again.',
  recommendationConfiguration: 'Recommendation Engine Configuration',
  recommendationConfigurationSubtitle: 'Controls real-time smart ranking over your bounded catalogue',
  recommendationService: 'Engine: Smart Recommendation Service',
  catalogueScoring: 'Real-time catalogue scoring & ranking',
  secureProcessing: 'Secure server-side processing',
  privacySecurity: 'Data Privacy & Security',
  showRecommendationReasons: 'Show Recommendation Reasons to Customers',
  recommendationReasonsDescription: 'Display concise explanations on the storefront (e.g. “A protective case helps keep your new phone safe.”)',
  costUsageProtection: 'Cost & Usage Protection',
  monthlyRequests: 'Monthly requests: {used} / {limit}',
  editorAppearance: 'Appearance Managed in Wix Editor / Studio',
  editorAppearanceDescription: 'Typography (fonts) and colors for each element (headings, subheadings, cards, product titles, prices, and CTA buttons) are customized directly in the Wix Studio / Editor canvas via the widget’s Settings Panel.',
  livePreview: 'Live Preview on Thank You Page',
  livePreviewSubtitle: 'This is how offers appear to customers after completing checkout',
  previewProduct: 'High-Speed Fast Charger & Cable',
  previewReason: '✦ Ideal charging accessory for your new device.',
  loading: 'Loading',
  unableCheckout: 'Unable to add offer to checkout. Please try again.',
  unableCart: 'Unable to add this item to your cart. Please try again.',
  unableOptions: 'Unable to load this product’s options. Please try again.',
  headingColor: 'Heading Color',
  subheadingColor: 'Subheading Color',
  cardBackground: 'Card Background',
  oneTimePurchase: 'One-time purchase',
  allPlanFeatures: 'All plan features are enabled for development testing.',
  planActive: 'Your plan is active.',
  planEndsRenewalOff: 'Your plan ends on {date}. Renewal is turned off.',
  planRenews: 'Renews on {date}.',
  upgradeBusiness: 'Upgrade to Business',
  month: 'month',
  orBilledYearly: 'or {price}/month billed yearly · {days}-day free trial',
  unlimited: 'Unlimited',
  allHistory: 'All history',
  priority: 'Priority',
  email: 'Email',
  days: 'days',
  planTaglinePro: 'For growing stores running a few upsell campaigns.',
  planTaglineBusiness: 'For high-volume stores that test and report on every offer.',
  pauseActivateConfirmation: '{action} campaign confirmation',
  pauseActivateQuestion: '{action} campaign?',
  pausing: 'Pausing…',
  activating: 'Activating…',
  pauseCampaign: 'Pause campaign',
  activateCampaign: 'Activate campaign',
  viewBilling: 'View billing',
  deleting: 'Deleting…',
  deleteCampaign: 'Delete campaign',
  choosePlanToActivate: 'Choose a Pro or Business plan to activate campaigns and show offers to your customers.',
  pausedCampaignDescription: 'This campaign will stop showing post-purchase offers until you activate it again.',
  activatedCampaignDescription: 'This campaign will start showing post-purchase offers on eligible orders.',
  deleteCampaignDescription: 'Any offers associated with this campaign will no longer be shown on your Thank You page.',
  previewHeading: 'A little something extra for you',
  previewSubheading: 'Complementary picks tailored to your order.',
  addToOrder: 'Add to Order →',
  claimOffer: 'Claim Offer',
  saveRecommendedItems: 'Save {percent}% on these recommended items!',
  frequentlyPaired: 'Frequently paired',
  topRecommendation: 'Top Recommendation',
  recommendedForYou: 'Recommended for you',
  selectedByYou: 'Selected by you',
  popularAddonReason: 'Popular add-on chosen for orders like yours.',
  merchantSelectedReason: 'Selected manually by the merchant.',
  permanentlyDelete: 'This will permanently delete {name}.',
  smartProductRanking: 'Smart product ranking',
  targetingByProduct: 'Targeting by product, collection and order value',
  stackedTargeting: 'Stacked targeting rules (AND/OR)',
  aiExplanations: 'AI explanations on offers',
  analyticsHistory: 'Analytics history',
  support: 'Support',
  pluginPlacement: 'Post-purchase plugin placement',
  pluginPlacementDescription: 'Check whether the offer plugin is installed in the Thank You page slot.',
  pluginPlaced: 'Plugin is placed',
  pluginNotPlaced: 'Plugin is not placed',
  pluginStatusUnknown: 'Placement status is unavailable',
  checkPlacementStatus: 'Check placement status',
  addPlugin: 'Add plugin',
  pluginPlacementInstructions: 'Wix does not provide an API to add a site plugin placement. Open your site in the Wix Editor, open the plugin explorer, choose this app, and add the post-purchase offers plugin to the Thank You page slot. Then check the status again.',
  placementInstructionsTitle: 'Add the post-purchase plugin',
  privacySecurityDescription: 'Recommendation requests run completely server-side. No customer data or payment details are exposed.',
  percentOff: '{percent}% OFF',
  amountOff: '{amount} OFF',
  modeAi: 'AI',
  modeHybrid: 'Hybrid',
  rulesModeShort: 'Rules',
  modeManual: 'Manual',
  usedUnlimited: '{used} {unit} · Unlimited',
  usedOfLimit: '{used} of {limit} {unit}',
  usedProgressAria: '{label} used',
  usedMonthlyRecommendations: 'You’ve used {percent}% of this month’s AI recommendations',
  allowanceExceededFallback: 'When the allowance runs out, offers keep showing using smart product ranking until next month.',
} as const satisfies Record<string, TranslationValue>;

const ES: Partial<Record<TranslationKey, string>> = {
  language: 'Idioma', refresh: 'Actualizar', createCampaign: 'Crear campaña', overview: 'Resumen', campaigns: 'Campañas',
  smartRecommendations: 'Recomendaciones inteligentes', storefrontPreview: 'Vista previa de la tienda', billingPlan: 'Facturación y plan',
  searchProducts: 'Buscar productos', selected: '{count} seleccionados', clearAll: 'Borrar todo', noProductsFound: 'No se encontraron productos en tu tienda', outOfStock: 'Agotado', loadMoreProducts: 'Cargar más productos',
  attributedRevenue: 'Ingresos adicionales atribuidos', offerImpressions: 'Impresiones de ofertas', totalViews: 'Vistas totales en la página de agradecimiento', clickThroughRate: 'Tasa de clics (CTR)', conversionRate: 'Tasa de conversión de ofertas',
  recommendationEngine: 'Motor de recomendaciones inteligentes', active: 'Activo', paused: 'En pausa', configureEngine: 'Configurar motor', campaignPerformance: 'Rendimiento de campañas', campaign: 'Campaña', impressions: 'Impresiones', clicks: 'Clics', purchases: 'Compras', revenue: 'Ingresos', conversion: 'Conversión',
  noCampaignActivity: 'Aún no hay actividad de campañas', noCampaigns: 'No se encontraron campañas', newCampaign: 'Nueva campaña', edit: 'Editar', pause: 'Pausar', activate: 'Activar', cancel: 'Cancelar', saveChanges: 'Guardar cambios', saveActivate: 'Guardar y activar', saving: 'Guardando...',
  campaignName: 'Nombre de la campaña', mode: 'Modo', discount: 'Descuento', minimumOrder: 'Pedido mínimo', status: 'Estado', actions: 'Acciones', noMinimum: 'Sin mínimo', recommendationMode: 'Modo de recomendación', merchantProducts: 'Productos seleccionados por el comerciante', discountPercentage: 'Porcentaje de descuento (%)', minimumSubtotal: 'Subtotal mínimo del pedido ($)',
  billingUnavailable: 'Los detalles de facturación no están disponibles', currentPlan: 'Plan actual', development: 'Desarrollo', noPlan: 'Sin plan', freeTrial: 'Prueba gratuita', managePlan: 'Administrar plan', usage: 'Uso', thisMonth: 'Este mes', yourPlan: 'Tu plan', startFreeTrial: 'Iniciar prueba gratuita', mainHeading: 'Título principal', subheading: 'Subtítulo', productCards: 'Tarjetas de producto', actionButton: 'Botón de acción (CTA)', containerLayout: 'Contenedor y diseño', postPurchaseSettings: 'Configuración de ofertas poscompra', headingText: 'Texto del título', subheadingText: 'Texto del subtítulo', buttonLabel: 'Etiqueta del botón', editFont: 'Editar fuente', selectFont: 'Seleccionar fuente', findingDeals: 'Buscando ofertas exclusivas para tu pedido...', specialOffer: 'Oferta especial', addToCart: 'Añadir al carrito', addingToCart: 'Añadiendo al carrito...', addedToCart: 'Añadido al carrito ✓', redirecting: 'Redirigiendo al pago...', chooseOptions: 'Elegir opciones', continue: 'Continuar', dismissOffer: 'Descartar oferta', noThanks: 'No, gracias',
  privacySecurityDescription: 'Las solicitudes de recomendación se ejecutan completamente en el servidor. No se exponen datos de clientes ni detalles de pago.',
  percentOff: '{percent}% de descuento',
  amountOff: '{amount} de descuento',
  modeAi: 'IA',
  modeHybrid: 'Híbrido',
  rulesModeShort: 'Reglas',
  modeManual: 'Manual',
  usedUnlimited: '{used} {unit} · Ilimitado',
  usedOfLimit: '{used} de {limit} {unit}',
  usedProgressAria: '{label} utilizado',
  usedMonthlyRecommendations: 'Has utilizado el {percent}% de las recomendaciones de IA de este mes',
  allowanceExceededFallback: 'Cuando se agota el límite, las ofertas siguen mostrándose utilizando la clasificación inteligente de productos hasta el próximo mes.',
  previewHeading: 'Un detalle especial para ti',
  previewSubheading: 'Selección complementaria adaptada a tu pedido.',
  claimOffer: 'Aprovechar oferta',
  addToOrder: 'Añadir al pedido →',
  savePercent: 'AHORRA {percent}%',
  previewProduct: 'Cargador rápido y cable de alta velocidad',
  previewReason: 'Accesorio de carga ideal para tu nuevo dispositivo.',
  chooseOption: 'Elegir {option}',
  unavailableCombination: 'Esa combinación no está disponible. Elige otra opción.',
  loading: 'Cargando',
  saveRecommendedItems: '¡Ahorra un {percent}% en estos artículos recomendados!',
  frequentlyPaired: 'Frecuentemente combinados',
  topRecommendation: 'Mejor recomendación',
  recommendedForYou: 'Recomendado para ti',
  selectedByYou: 'Seleccionado por ti',
  popularAddonReason: 'Complemento popular elegido para pedidos como el tuyo.',
  merchantSelectedReason: 'Seleccionado manualmente por la tienda.',
};

const FR: Partial<Record<TranslationKey, string>> = {
  language: 'Langue', refresh: 'Actualiser', createCampaign: 'Créer une campagne', overview: 'Vue d’ensemble', campaigns: 'Campagnes', smartRecommendations: 'Recommandations intelligentes', storefrontPreview: 'Aperçu de la boutique', billingPlan: 'Facturation et forfait', searchProducts: 'Rechercher des produits', selected: '{count} sélectionnés', clearAll: 'Tout effacer', noProductsFound: 'Aucun produit trouvé dans votre boutique', outOfStock: 'Rupture de stock', loadMoreProducts: 'Charger plus de produits',
  attributedRevenue: 'Revenus supplémentaires attribués', offerImpressions: 'Impressions des offres', totalViews: 'Vues totales sur la page de remerciement', clickThroughRate: 'Taux de clics (CTR)', conversionRate: 'Taux de conversion des offres', recommendationEngine: 'Moteur de recommandations intelligentes', active: 'Actif', paused: 'En pause', configureEngine: 'Configurer le moteur', campaignPerformance: 'Performances des campagnes', campaign: 'Campagne', impressions: 'Impressions', clicks: 'Clics', purchases: 'Achats', revenue: 'Revenus', conversion: 'Conversion', noCampaignActivity: 'Aucune activité de campagne', noCampaigns: 'Aucune campagne trouvée', newCampaign: 'Nouvelle campagne', edit: 'Modifier', pause: 'Mettre en pause', activate: 'Activer', cancel: 'Annuler', saveChanges: 'Enregistrer les modifications', saveActivate: 'Enregistrer et activer', saving: 'Enregistrement...', campaignName: 'Nom de la campagne', mode: 'Mode', discount: 'Remise', minimumOrder: 'Commande minimale', status: 'Statut', actions: 'Actions', noMinimum: 'Aucun minimum', recommendationMode: 'Mode de recommandation', merchantProducts: 'Produits sélectionnés par le marchand', discountPercentage: 'Pourcentage de remise (%)', minimumSubtotal: 'Sous-total minimum de commande ($)', billingUnavailable: 'Les détails de facturation sont indisponibles', currentPlan: 'Forfait actuel', development: 'Développement', noPlan: 'Aucun forfait', freeTrial: 'Essai gratuit', managePlan: 'Gérer le forfait', usage: 'Utilisation', thisMonth: 'Ce mois-ci', yourPlan: 'Votre forfait', startFreeTrial: 'Démarrer l’essai gratuit', mainHeading: 'Titre principal', subheading: 'Sous-titre', productCards: 'Cartes produit', actionButton: 'Bouton d’action (CTA)', containerLayout: 'Conteneur et mise en page', postPurchaseSettings: 'Paramètres des offres post-achat', headingText: 'Texte du titre', subheadingText: 'Texte du sous-titre', buttonLabel: 'Libellé du bouton', editFont: 'Modifier la police', selectFont: 'Sélectionner une police', findingDeals: 'Recherche d’offres exclusives pour votre commande...', specialOffer: 'Offre spéciale', addToCart: 'Ajouter au panier', addingToCart: 'Ajout au panier...', addedToCart: 'Ajouté au panier ✓', redirecting: 'Redirection vers le paiement...', chooseOptions: 'Choisir les options', continue: 'Continuer', dismissOffer: 'Ignorer l’offre', noThanks: 'Non merci, ignorer',
  privacySecurityDescription: 'Les requêtes de recommandation s’exécutent entièrement côté serveur. Aucune donnée client ou détail de paiement n’est exposé.',
  percentOff: '-{percent} %',
  amountOff: '-{amount}',
  modeAi: 'IA',
  modeHybrid: 'Hybride',
  rulesModeShort: 'Règles',
  modeManual: 'Manuel',
  usedUnlimited: '{used} {unit} · Illimité',
  usedOfLimit: '{used} sur {limit} {unit}',
  usedProgressAria: '{label} utilisé',
  usedMonthlyRecommendations: 'Vous avez utilisé {percent} % des recommandations IA de ce mois-ci',
  allowanceExceededFallback: 'Lorsque le forfait est épuisé, les offres continuent de s’afficher grâce au classement intelligent des produits jusqu’au mois prochain.',
  previewHeading: 'Un petit supplément pour vous',
  previewSubheading: 'Sélections complémentaires adaptées à votre commande.',
  claimOffer: 'Profiter de l’offre',
  addToOrder: 'Ajouter à la commande →',
  savePercent: '-{percent} %',
  previewProduct: 'Chargeur rapide et câble haute vitesse',
  previewReason: 'Accessoire de charge idéal pour votre nouvel appareil.',
  chooseOption: 'Choisir {option}',
  unavailableCombination: 'Cette combinaison est indisponible. Veuillez choisir une autre option.',
  loading: 'Chargement',
  saveRecommendedItems: 'Économisez {percent} % sur ces articles recommandés !',
  frequentlyPaired: 'Fréquemment associés',
  topRecommendation: 'Meilleure recommandation',
  recommendedForYou: 'Recommandé pour vous',
  selectedByYou: 'Sélectionné par vous',
  popularAddonReason: 'Complément populaire choisi pour les commandes comme la vôtre.',
  merchantSelectedReason: 'Sélectionné manuellement par la boutique.',
};

const DE: Partial<Record<TranslationKey, string>> = {
  language: 'Sprache', refresh: 'Aktualisieren', createCampaign: 'Kampagne erstellen', overview: 'Übersicht', campaigns: 'Kampagnen', smartRecommendations: 'Intelligente Empfehlungen', storefrontPreview: 'Shop-Vorschau', billingPlan: 'Abrechnung und Tarif', searchProducts: 'Produkte suchen', selected: '{count} ausgewählt', clearAll: 'Alle löschen', noProductsFound: 'Keine Produkte in Ihrem Shop gefunden', outOfStock: 'Nicht vorrätig', loadMoreProducts: 'Weitere Produkte laden',
  attributedRevenue: 'Zugeordneter Zusatzumsatz', offerImpressions: 'Angebotsaufrufe', totalViews: 'Aufrufe auf der Dankeseite', clickThroughRate: 'Klickrate (CTR)', conversionRate: 'Angebots-Conversion-Rate', recommendationEngine: 'Intelligente Empfehlungs-Engine', active: 'Aktiv', paused: 'Pausiert', configureEngine: 'Engine konfigurieren', campaignPerformance: 'Kampagnenleistung', campaign: 'Kampagne', impressions: 'Aufrufe', clicks: 'Klicks', purchases: 'Käufe', revenue: 'Umsatz', conversion: 'Conversion', noCampaignActivity: 'Noch keine Kampagnenaktivität', noCampaigns: 'Keine Kampagnen gefunden', newCampaign: 'Neue Kampagne', edit: 'Bearbeiten', pause: 'Pausieren', activate: 'Aktivieren', cancel: 'Abbrechen', saveChanges: 'Änderungen speichern', saveActivate: 'Speichern und aktivieren', saving: 'Wird gespeichert...', campaignName: 'Kampagnenname', mode: 'Modus', discount: 'Rabatt', minimumOrder: 'Mindestbestellung', status: 'Status', actions: 'Aktionen', noMinimum: 'Kein Mindestwert', recommendationMode: 'Empfehlungsmodus', merchantProducts: 'Vom Händler ausgewählte Produkte', discountPercentage: 'Rabattprozentsatz (%)', minimumSubtotal: 'Mindestbestellwert ($)', billingUnavailable: 'Abrechnungsdetails sind nicht verfügbar', currentPlan: 'Aktueller Tarif', development: 'Entwicklung', noPlan: 'Kein Tarif', freeTrial: 'Kostenlose Testphase', managePlan: 'Tarif verwalten', usage: 'Nutzung', thisMonth: 'Diesen Monat', yourPlan: 'Ihr Tarif', startFreeTrial: 'Kostenlose Testphase starten', mainHeading: 'Hauptüberschrift', subheading: 'Unterüberschrift', productCards: 'Produktkarten', actionButton: 'Aktionsschaltfläche (CTA)', containerLayout: 'Container und Layout', postPurchaseSettings: 'Einstellungen für Nachkaufangebote', headingText: 'Überschriftentext', subheadingText: 'Unterüberschriftentext', buttonLabel: 'Schaltflächenbeschriftung', editFont: 'Schriftart bearbeiten', selectFont: 'Schriftart auswählen', findingDeals: 'Exklusive Angebote für Ihre Bestellung werden gesucht...', specialOffer: 'Sonderangebot', addToCart: 'In den Warenkorb', addingToCart: 'Wird hinzugefügt...', addedToCart: 'Zum Warenkorb hinzugefügt ✓', redirecting: 'Weiterleitung zur Kasse...', chooseOptions: 'Optionen auswählen', continue: 'Weiter', dismissOffer: 'Angebot schließen', noThanks: 'Nein danke, schließen',
  privacySecurityDescription: 'Empfehlungsanfragen werden vollständig serverseitig verarbeitet. Es werden keine Kundendaten oder Zahlungsdetails offengelegt.',
  percentOff: '{percent}% Rabatt',
  amountOff: '{amount} Rabatt',
  modeAi: 'KI',
  modeHybrid: 'Hybrid',
  rulesModeShort: 'Regeln',
  modeManual: 'Manuell',
  usedUnlimited: '{used} {unit} · Unbegrenzt',
  usedOfLimit: '{used} von {limit} {unit}',
  usedProgressAria: '{label} verwendet',
  usedMonthlyRecommendations: 'Sie haben {percent}% der KI-Empfehlungen dieses Monats verbraucht',
  allowanceExceededFallback: 'Wenn das Kontingent erschöpft ist, werden Angebote bis zum nächsten Monat weiterhin über das intelligente Produktranking angezeigt.',
  previewHeading: 'Eine kleine Aufmerksamkeit für Sie',
  previewSubheading: 'Passende Empfehlungen speziell für Ihre Bestellung.',
  claimOffer: 'Angebot sichern',
  addToOrder: 'Zur Bestellung hinzufügen →',
  savePercent: '{percent}% SPAREN',
  previewProduct: 'High-Speed-Schnellladegerät & Kabel',
  previewReason: 'Ideales Ladezubehör für Ihr neues Gerät.',
  chooseOption: '{option} auswählen',
  unavailableCombination: 'Diese Kombination ist nicht verfügbar. Bitte wählen Sie eine andere Option.',
  loading: 'Wird geladen',
  saveRecommendedItems: 'Sparen Sie {percent}% auf diese empfohlenen Artikel!',
  frequentlyPaired: 'Häufig zusammen gekauft',
  topRecommendation: 'Top-Empfehlung',
  recommendedForYou: 'Für Sie empfohlen',
  selectedByYou: 'Von Ihnen ausgewählt',
  popularAddonReason: 'Beliebter Zusatzartikel für Bestellungen wie Ihre.',
  merchantSelectedReason: 'Manuell vom Händler ausgewählt.',
};

const CORE_TRANSLATIONS: Record<Exclude<Locale, 'en' | 'es' | 'fr' | 'de'>, Partial<Record<TranslationKey, string>>> = {
  pt: {
    language: 'Idioma', refresh: 'Atualizar', createCampaign: 'Criar campanha', overview: 'Visão geral', campaigns: 'Campanhas',
    smartRecommendations: 'Recomendações inteligentes', storefrontPreview: 'Pré-visualização da loja', billingPlan: 'Faturamento e plano',
    addToCart: 'Adicionar ao carrinho', addingToCart: 'Adicionando ao carrinho...', addedToCart: 'Adicionado ao carrinho ✓',
    chooseOptions: 'Escolher opções', continue: 'Continuar', cancel: 'Cancelar', noThanks: 'Não, obrigado, dispensar',
    findingDeals: 'A encontrar ofertas exclusivas para a sua encomenda...', specialOffer: 'Oferta especial',
    previewHeading: 'Um detalhe especial para si', previewSubheading: 'Sugestões complementares adaptadas à sua encomenda.',
    claimOffer: 'Aproveitar oferta', addToOrder: 'Adicionar à encomenda →', savePercent: 'POUPE {percent}%',
    previewProduct: 'Carregador rápido e cabo de alta velocidade', previewReason: 'Acessório de carregamento ideal para o seu novo dispositivo.',
    dismissOffer: 'Dispensar oferta', chooseOption: 'Escolher {option}', loading: 'A carregar',
    frequentlyPaired: 'Frequentemente combinados', topRecommendation: 'Melhor recomendação', recommendedForYou: 'Recomendado para si', selectedByYou: 'Selecionado por si',
    popularAddonReason: 'Complemento popular escolhido para encomendas como a sua.', merchantSelectedReason: 'Selecionado manualmente pelo comerciante.',
  },
  it: {
    language: 'Lingua', refresh: 'Aggiorna', createCampaign: 'Crea campagna', overview: 'Panoramica', campaigns: 'Campagne',
    smartRecommendations: 'Raccomandazioni intelligenti', storefrontPreview: 'Anteprima del negozio', billingPlan: 'Fatturazione e piano',
    addToCart: 'Aggiungi al carrello', addingToCart: 'Aggiunta al carrello...', addedToCart: 'Aggiunto al carrello ✓',
    chooseOptions: 'Scegli opzioni', continue: 'Continua', cancel: 'Annulla', noThanks: 'No grazie, ignora',
    findingDeals: 'Ricerca di offerte esclusive per il tuo ordine...', specialOffer: 'Offerta speciale',
    previewHeading: 'Un piccolo extra per te', previewSubheading: 'Consigli complementari per il tuo ordine.',
    claimOffer: 'Richiedi offerta', addToOrder: 'Aggiungi all’ordine →', savePercent: 'RISPARMIA IL {percent}%',
    previewProduct: 'Caricatore rapido e cavo ad alta velocità', previewReason: 'Accessorio ideale per il tuo nuovo dispositivo.',
    dismissOffer: 'Ignora offerta', chooseOption: 'Scegli {option}', loading: 'Caricamento',
    frequentlyPaired: 'Spesso acquistati insieme', topRecommendation: 'Migliore raccomandazione', recommendedForYou: 'Consigliato per te', selectedByYou: 'Selezionato da te',
    popularAddonReason: 'Accessorio popolare scelto per ordini come il tuo.', merchantSelectedReason: 'Selezionato manualmente dal negozio.',
  },
  nl: {
    language: 'Taal', refresh: 'Vernieuwen', createCampaign: 'Campagne maken', overview: 'Overzicht', campaigns: 'Campagnes',
    smartRecommendations: 'Slimme aanbevelingen', storefrontPreview: 'Winkelvoorvertoning', billingPlan: 'Facturering en abonnement',
    addToCart: 'Aan winkelwagen toevoegen', addingToCart: 'Wordt toegevoegd...', addedToCart: 'Toegevoegd aan winkelwagen ✓',
    chooseOptions: 'Opties kiezen', continue: 'Doorgaan', cancel: 'Annuleren', noThanks: 'Nee bedankt, sluiten',
    findingDeals: 'Exclusieve aanbiedingen voor je bestelling zoeken...', specialOffer: 'Speciale aanbieding',
    previewHeading: 'Iets extra’s voor jou', previewSubheading: 'Aanvullende suggesties voor je bestelling.',
    claimOffer: 'Aanbieding claimen', addToOrder: 'Aan bestelling toevoegen →', savePercent: 'BESPAAR {percent}%',
    previewProduct: 'Snellader en snelle kabel', previewReason: 'Ideale laadaccessoire voor je nieuwe apparaat.',
    dismissOffer: 'Aanbieding sluiten', chooseOption: 'Kies {option}', loading: 'Laden',
    frequentlyPaired: 'Vaak samen gekocht', topRecommendation: 'Beste aanbeveling', recommendedForYou: 'Aanbevolen voor jou', selectedByYou: 'Door jou geselecteerd',
    popularAddonReason: 'Populaire toevoeging gekozen voor bestellingen zoals die van jou.', merchantSelectedReason: 'Handmatig geselecteerd door de winkel.',
  },
  pl: {
    language: 'Język', refresh: 'Odśwież', createCampaign: 'Utwórz kampanię', overview: 'Przegląd', campaigns: 'Kampanie',
    smartRecommendations: 'Inteligentne rekomendacje', storefrontPreview: 'Podgląd sklepu', billingPlan: 'Rozliczenia i plan',
    addToCart: 'Dodaj do koszyka', addingToCart: 'Dodawanie do koszyka...', addedToCart: 'Dodano do koszyka ✓',
    chooseOptions: 'Wybierz opcje', continue: 'Dalej', cancel: 'Anuluj', noThanks: 'Nie, dziękuję',
    findingDeals: 'Wyszukiwanie wyjątkowych ofert dla Twojego zamówienia...', specialOffer: 'Oferta specjalna',
    previewHeading: 'Coś wyjątkowego dla Ciebie', previewSubheading: 'Dopasowane propozycje do Twojego zamówienia.',
    claimOffer: 'Odbierz ofertę', addToOrder: 'Dodaj do zamówienia →', savePercent: 'OSZCZĘDŹ {percent}%',
    previewProduct: 'Szybka ładowarka i kabel', previewReason: 'Idealne akcesorium do Twojego nowego urządzenia.',
    dismissOffer: 'Odrzuć ofertę', chooseOption: 'Wybierz {option}', loading: 'Ładowanie',
    frequentlyPaired: 'Często kupowane razem', topRecommendation: 'Najlepsza rekomendacja', recommendedForYou: 'Polecane dla Ciebie', selectedByYou: 'Wybrane przez Ciebie',
    popularAddonReason: 'Popularny dodatek wybrany do zamówień takich jak Twoje.', merchantSelectedReason: 'Wybrane ręcznie przez sprzedawcę.',
  },
  sv: {
    language: 'Språk', refresh: 'Uppdatera', createCampaign: 'Skapa kampanj', overview: 'Översikt', campaigns: 'Kampanjer',
    smartRecommendations: 'Smarta rekommendationer', storefrontPreview: 'Förhandsgranskning av butik', billingPlan: 'Fakturering och plan',
    addToCart: 'Lägg i kundvagn', addingToCart: 'Lägger till...', addedToCart: 'Tillagd i kundvagn ✓',
    chooseOptions: 'Välj alternativ', continue: 'Fortsätt', cancel: 'Avbryt', noThanks: 'Nej tack, stäng',
    findingDeals: 'Letar efter exklusiva erbjudanden för din beställning...', specialOffer: 'Specialerbjudande',
    previewHeading: 'Något extra för dig', previewSubheading: 'Matchande förslag till din beställning.',
    claimOffer: 'Hämta erbjudande', addToOrder: 'Lägg till i beställning →', savePercent: 'SPARA {percent}%',
    previewProduct: 'Snabbladdare och snabb kabel', previewReason: 'Perfekt laddningstillbehör för din nya enhet.',
    dismissOffer: 'Avvisa erbjudande', chooseOption: 'Välj {option}', loading: 'Laddar',
    frequentlyPaired: 'Ofta köpta tillsammans', topRecommendation: 'Bästa rekommendationen', recommendedForYou: 'Rekommenderas för dig', selectedByYou: 'Vald av dig',
    popularAddonReason: 'Populärt tillägg valt för beställningar som din.', merchantSelectedReason: 'Vald manuellt av handlaren.',
  },
  da: {
    language: 'Sprog', refresh: 'Opdater', createCampaign: 'Opret kampagne', overview: 'Oversigt', campaigns: 'Kampagner',
    smartRecommendations: 'Smarte anbefalinger', storefrontPreview: 'Forhåndsvisning af butik', billingPlan: 'Fakturering og plan',
    addToCart: 'Læg i kurv', addingToCart: 'Tilføjer...', addedToCart: 'Lagt i kurv ✓',
    chooseOptions: 'Vælg muligheder', continue: 'Fortsæt', cancel: 'Annuller', noThanks: 'Nej tak, luk',
    findingDeals: 'Finder eksklusive tilbud til din ordre...', specialOffer: 'Særligt tilbud',
    previewHeading: 'Lidt ekstra til dig', previewSubheading: 'Matchende forslag til din ordre.',
    claimOffer: 'Benyt tilbud', addToOrder: 'Føj til ordre →', savePercent: 'SPAR {percent}%',
    previewProduct: 'Hurtigoplader og hurtigt kabel', previewReason: 'Ideelt opladningstilbehør til din nye enhed.',
    dismissOffer: 'Afvis tilbud', chooseOption: 'Vælg {option}', loading: 'Indlæser',
    frequentlyPaired: 'Ofte købt sammen', topRecommendation: 'Bedste anbefaling', recommendedForYou: 'Anbefalet til dig', selectedByYou: 'Valgt af dig',
    popularAddonReason: 'Populært tilkøb valgt til ordrer som din.', merchantSelectedReason: 'Valgt manuelt af forhandleren.',
  },
  no: {
    language: 'Språk', refresh: 'Oppdater', createCampaign: 'Opprett kampanje', overview: 'Oversikt', campaigns: 'Kampanjer',
    smartRecommendations: 'Smarte anbefalinger', storefrontPreview: 'Forhåndsvisning av butikk', billingPlan: 'Fakturering og plan',
    addToCart: 'Legg i handlekurv', addingToCart: 'Legger til...', addedToCart: 'Lagt i handlekurv ✓',
    chooseOptions: 'Velg alternativer', continue: 'Fortsett', cancel: 'Avbryt', noThanks: 'Nei takk, lukk',
    findingDeals: 'Finner eksklusive tilbud for bestillingen din...', specialOffer: 'Spesialtilbud',
    previewHeading: 'Noe ekstra til deg', previewSubheading: 'Matchende forslag til bestillingen din.',
    claimOffer: 'Krev tilbud', addToOrder: 'Legg til bestilling →', savePercent: 'SPAR {percent}%',
    previewProduct: 'Hurtiglader og rask kabel', previewReason: 'Ideelt ladetilbehør for den nye enheten din.',
    dismissOffer: 'Avvis tilbud', chooseOption: 'Velg {option}', loading: 'Laster',
    frequentlyPaired: 'Ofte kjøpt sammen', topRecommendation: 'Beste anbefaling', recommendedForYou: 'Anbefalt for deg', selectedByYou: 'Valgt av deg',
    popularAddonReason: 'Populært tillegg valgt for bestillinger som din.', merchantSelectedReason: 'Valgt manuelt av butikken.',
  },
  fi: {
    language: 'Kieli', refresh: 'Päivitä', createCampaign: 'Luo kampanja', overview: 'Yleiskatsaus', campaigns: 'Kampanjat',
    smartRecommendations: 'Älykkäät suositukset', storefrontPreview: 'Kaupan esikatselu', billingPlan: 'Laskutus ja paketti',
    addToCart: 'Lisää ostoskoriin', addingToCart: 'Lisätään...', addedToCart: 'Lisätty ostoskoriin ✓',
    chooseOptions: 'Valitse vaihtoehdot', continue: 'Jatka', cancel: 'Peruuta', noThanks: 'Ei kiitos, sulje',
    findingDeals: 'Etsitään tilauksellesi ainutlaatuisia tarjouksia...', specialOffer: 'Erikoistarjous',
    previewHeading: 'Jotain ylimääräistä sinulle', previewSubheading: 'Tilaukseesi sopivia suosituksia.',
    claimOffer: 'Lunasta tarjous', addToOrder: 'Lisää tilaukseen →', savePercent: 'SÄÄSTÄ {percent}%',
    previewProduct: 'Pikalaturi ja nopea kaapeli', previewReason: 'Ihanteellinen lataustarvike uudelle laitteellesi.',
    dismissOffer: 'Hylkää tarjous', chooseOption: 'Valitse {option}', loading: 'Ladataan',
    frequentlyPaired: 'Usein yhdessä ostettu', topRecommendation: 'Paras suositus', recommendedForYou: 'Suositeltu sinulle', selectedByYou: 'Valitsemasi',
    popularAddonReason: 'Suosittu lisätuote kaltaisillesi tilauksille.', merchantSelectedReason: 'Kauppiaan manuaalisesti valitsema.',
  },
  cs: {
    language: 'Jazyk', refresh: 'Obnovit', createCampaign: 'Vytvořit kampaň', overview: 'Přehled', campaigns: 'Kampaně',
    smartRecommendations: 'Chytrá doporučení', storefrontPreview: 'Náhled obchodu', billingPlan: 'Fakturace a plán',
    addToCart: 'Přidat do košíku', addingToCart: 'Přidávání...', addedToCart: 'Přidáno do košíku ✓',
    chooseOptions: 'Vyberte možnosti', continue: 'Pokračovat', cancel: 'Zrušit', noThanks: 'Ne, děkuji',
    findingDeals: 'Hledání exkluzivních nabídek pro vaši objednávku...', specialOffer: 'Speciální nabídka',
    previewHeading: 'Něco navíc pro vás', previewSubheading: 'Doplňující návrhy k vaší objednávce.',
    claimOffer: 'Získat nabídku', addToOrder: 'Přidat k objednávce →', savePercent: 'UŠETŘETE {percent}%',
    previewProduct: 'Rychlonabíječka a rychlý kabel', previewReason: 'Ideální nabíjecí příslušenství pro vaše nové zařízení.',
    dismissOffer: 'Odmítnout nabídku', chooseOption: 'Vybrat {option}', loading: 'Načítání',
    frequentlyPaired: 'Často kupováno společně', topRecommendation: 'Nejlepší doporučení', recommendedForYou: 'Doporučeno pro vás', selectedByYou: 'Vámi vybráno',
    popularAddonReason: 'Oblíbený doplněk vybraný pro objednávky jako ta vaše.', merchantSelectedReason: 'Ručně vybráno prodejcem.',
  },
  tr: {
    language: 'Dil', refresh: 'Yenile', createCampaign: 'Kampanya oluştur', overview: 'Genel bakış', campaigns: 'Kampanyalar',
    smartRecommendations: 'Akıllı öneriler', storefrontPreview: 'Mağaza önizlemesi', billingPlan: 'Faturalandırma ve plan',
    addToCart: 'Sepete ekle', addingToCart: 'Sepete ekleniyor...', addedToCart: 'Sepete eklendi ✓',
    chooseOptions: 'Seçenekleri belirle', continue: 'Devam', cancel: 'İptal', noThanks: 'Hayır teşekkürler, kapat',
    findingDeals: 'Siparişiniz için özel fırsatlar aranıyor...', specialOffer: 'Özel teklif',
    previewHeading: 'Sizin için özel bir fırsat', previewSubheading: 'Siparişinize özel tamamlayıcı ürünler.',
    claimOffer: 'Fırsatı yakala', addToOrder: 'Siparişe ekle →', savePercent: '%{percent} İNDİRİM',
    previewProduct: 'Hızlı Şarj Cihazı ve Kablosu', previewReason: 'Yeni cihazınız için ideal şarj aksesuarı.',
    dismissOffer: 'Teklifi kapat', chooseOption: '{option} seçin', loading: 'Yükleniyor',
    frequentlyPaired: 'Birlikte sıkça alınanlar', topRecommendation: 'En iyi öneri', recommendedForYou: 'Sizin için önerilen', selectedByYou: 'Sizin tarafınızdan seçilen',
    popularAddonReason: 'Siparişinize benzer siparişler için popüler eklenti.', merchantSelectedReason: 'Satıcı tarafından manuel olarak seçildi.',
  },
  ja: {
    language: '言語', refresh: '更新', createCampaign: 'キャンペーンを作成', overview: '概要', campaigns: 'キャンペーン',
    smartRecommendations: 'スマートなおすすめ', storefrontPreview: 'ショッププレビュー', billingPlan: '請求とプラン',
    addToCart: 'カートに追加', addingToCart: '追加中...', addedToCart: 'カートに追加しました ✓',
    chooseOptions: 'オプションを選択', continue: '続行', cancel: 'キャンセル', noThanks: '結構です',
    findingDeals: 'ご注文に合わせた限定オファーを検索しています...', specialOffer: '特別オファー',
    previewHeading: 'ご注文者様への特別オファー', previewSubheading: 'ご注文にぴったりの追加アイテムです。',
    claimOffer: 'オファーを受け取る', addToOrder: '注文に追加 →', savePercent: '{percent}% オフ',
    previewProduct: '急速充電器＆高速ケーブル', previewReason: '新しい機器に最適な充電アクセサリーです。',
    dismissOffer: 'オファーを閉じる', chooseOption: '{option}を選択', loading: '読み込み中',
    frequentlyPaired: 'よく一緒に購入される商品', topRecommendation: 'おすすめ商品', recommendedForYou: 'あなたへのおすすめ', selectedByYou: '選択された商品',
    popularAddonReason: 'ご注文内容に合わせた人気のおすすめアイテムです。', merchantSelectedReason: 'ショップが選んだおすすめアイテムです。',
  },
  ko: {
    language: '언어', refresh: '새로 고침', createCampaign: '캠페인 만들기', overview: '개요', campaigns: '캠페인',
    smartRecommendations: '스마트 추천', storefrontPreview: '스토어 미리보기', billingPlan: '결제 및 요금제',
    addToCart: '장바구니에 추가', addingToCart: '추가 중...', addedToCart: '장바구니에 추가됨 ✓',
    chooseOptions: '옵션 선택', continue: '계속', cancel: '취소', noThanks: '괜찮습니다',
    findingDeals: '주문에 맞는 특별 혜택을 찾는 중...', specialOffer: '특별 혜택',
    previewHeading: '고객님을 위한 특별 혜택', previewSubheading: '주문에 어울리는 맞춤 보완 상품입니다.',
    claimOffer: '혜택 받기', addToOrder: '주문에 추가 →', savePercent: '{percent}% 할인',
    previewProduct: '고속 충전기 & 고속 케이블', previewReason: '새 기기에 꼭 맞는 충전 액세서리입니다.',
    dismissOffer: '혜택 닫기', chooseOption: '{option} 선택', loading: '로딩 중',
    frequentlyPaired: '자주 함께 구매하는 상품', topRecommendation: '최고 추천 상품', recommendedForYou: '회원님을 위한 추천', selectedByYou: '직접 선택한 상품',
    popularAddonReason: '주문하신 상품과 어울리는 인기 추가 상품입니다.', merchantSelectedReason: '스토어에서 엄선한 추천 상품입니다.',
  },
  zh: {
    language: '语言', refresh: '刷新', createCampaign: '创建活动', overview: '概览', campaigns: '活动',
    smartRecommendations: '智能推荐', storefrontPreview: '店铺预览', billingPlan: '账单与套餐',
    addToCart: '加入购物车', addingToCart: '正在加入购物车...', addedToCart: '已加入购物车 ✓',
    chooseOptions: '选择选项', continue: '继续', cancel: '取消', noThanks: '不用了，谢谢',
    findingDeals: '正在为您的订单查找专属优惠...', specialOffer: '特别优惠',
    previewHeading: '为您准备的专属优惠', previewSubheading: '为您订单量身定制的搭配商品。',
    claimOffer: '领取优惠', addToOrder: '加入订单 →', savePercent: '立省 {percent}%',
    previewProduct: '快速充电器与高速数据线', previewReason: '新设备的理想充电配件。',
    dismissOffer: '关闭优惠', chooseOption: '选择 {option}', loading: '加载中',
    frequentlyPaired: '经常一起购买', topRecommendation: '首选推荐', recommendedForYou: '为您推荐', selectedByYou: '您选中的商品',
    popularAddonReason: '为类似订单精心挑选的热门加购商品。', merchantSelectedReason: '商家为您挑选的推荐商品。',
  },
  ar: {
    language: 'اللغة', refresh: 'تحديث', createCampaign: 'إنشاء حملة', overview: 'نظرة عامة', campaigns: 'الحملات',
    smartRecommendations: 'توصيات ذكية', storefrontPreview: 'معاينة المتجر', billingPlan: 'الفوترة والخطة',
    addToCart: 'أضف إلى السلة', addingToCart: 'جارٍ الإضافة...', addedToCart: 'تمت الإضافة إلى السلة ✓',
    chooseOptions: 'اختر الخيارات', continue: 'متابعة', cancel: 'إلغاء', noThanks: 'لا شكرًا، إغلاق',
    findingDeals: 'جارٍ العثور على عروض حصرية لطلبك...', specialOffer: 'عرض خاص',
    previewHeading: 'عرض خاص إضافي لك', previewSubheading: 'اقتراحات تكميلية مخصصة لطلبك.',
    claimOffer: 'الحصول على العرض', addToOrder: 'أضف إلى الطلب ←', savePercent: 'وفّر {percent}%',
    previewProduct: 'شاحن سريع مع كابل فائق السرعة', previewReason: 'ملحق شحن مثالي لجهازك الجديد.',
    dismissOffer: 'إغلاق العرض', chooseOption: 'اختر {option}', loading: 'جارٍ التحميل',
    frequentlyPaired: 'كثيرًا ما يتم شراؤها معًا', topRecommendation: 'أفضل توصية', recommendedForYou: 'موصى به لك', selectedByYou: 'محدد من قبلك',
    popularAddonReason: 'إضافة شائعة تم اختيارها لطلبات مشابهة لطلبك.', merchantSelectedReason: 'تم تحديده يدويًا بواسطة المتجر.',
  },
  he: {
    language: 'שפה', refresh: 'רענון', createCampaign: 'יצירת קמפיין', overview: 'סקירה', campaigns: 'קמפיינים',
    smartRecommendations: 'המלצות חכמות', storefrontPreview: 'תצוגה מקדימה של החנות', billingPlan: 'חיוב ותוכנית',
    addToCart: 'הוסף לסל', addingToCart: 'מוסיף לסל...', addedToCart: 'נוסף לסל ✓',
    chooseOptions: 'בחירת אפשרויות', continue: 'המשך', cancel: 'ביטול', noThanks: 'לא תודה, סגירה',
    findingDeals: 'מחפש הצעות בלעדיות להזמנה שלך...', specialOffer: 'הצעה מיוחדת',
    previewHeading: 'משהו מיוחד בשבילך', previewSubheading: 'הצעות משלימות המותאמות להזמנה שלך.',
    claimOffer: 'קבלת ההצעה', addToOrder: 'הוספה להזמנה ←', savePercent: 'חיסכון של {percent}%',
    previewProduct: 'מטען מהיר וכבל איכותי', previewReason: 'אביזר טעינה אידיאלי למכשיר החדש שלך.',
    dismissOffer: 'סגירת הצעה', chooseOption: 'בחר {option}', loading: 'טוען',
    frequentlyPaired: 'נרכש לעיתים קרובות יחד', topRecommendation: 'המלצה מובילה', recommendedForYou: 'מומלץ עבורך', selectedByYou: 'נבחר על ידך',
    popularAddonReason: 'תוספת פופולרית שנבחרה להזמנות כמו שלך.', merchantSelectedReason: 'נבחר ידנית על ידי החנות.',
  },
  ru: {
    language: 'Язык', refresh: 'Обновить', createCampaign: 'Создать кампанию', overview: 'Обзор', campaigns: 'Кампании',
    smartRecommendations: 'Умные рекомендации', storefrontPreview: 'Предпросмотр магазина', billingPlan: 'Оплата и тариф',
    addToCart: 'Добавить в корзину', addingToCart: 'Добавление...', addedToCart: 'Добавлено в корзину ✓',
    chooseOptions: 'Выберите параметры', continue: 'Продолжить', cancel: 'Отмена', noThanks: 'Нет, спасибо',
    findingDeals: 'Ищем эксклюзивные предложения для вашего заказа...', specialOffer: 'Специальное предложение',
    previewHeading: 'Специальное предложение для вас', previewSubheading: 'Подходящие дополнения к вашему заказу.',
    claimOffer: 'Получить предложение', addToOrder: 'Добавить к заказу →', savePercent: 'СКИДКА {percent}%',
    previewProduct: 'Быстрое зарядное устройство и кабель', previewReason: 'Идеальный аксессуар для зарядки вашего нового устройства.',
    dismissOffer: 'Отклонить предложение', chooseOption: 'Выберите {option}', loading: 'Загрузка',
    frequentlyPaired: 'Часто покупают вместе', topRecommendation: 'Лучшая рекомендация', recommendedForYou: 'Рекомендовано вам', selectedByYou: 'Выбрано вами',
    popularAddonReason: 'Популярное дополнение для заказов, похожих на ваш.', merchantSelectedReason: 'Выбрано продавцом вручную.',
  },
};

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano', nl: 'Nederlands', pl: 'Polski', sv: 'Svenska', da: 'Dansk', no: 'Norsk', fi: 'Suomi', cs: 'Čeština', tr: 'Türkçe', ja: '日本語', ko: '한국어', zh: '中文', ar: 'العربية', he: 'עברית', ru: 'Русский',
};

const CAMPAIGN_MODAL_TRANSLATIONS: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en: {},
  es: {
    editCampaign: 'Editar campaña poscompra',
    createNewCampaign: 'Crear nueva campaña poscompra',
    updateParameters: 'Actualizar parámetros de segmentación y descuento',
    configureParameters: 'Configurar parámetros de segmentación y descuento',
  },
  fr: {
    editCampaign: 'Modifier la campagne post-achat',
    createNewCampaign: 'Créer une campagne post-achat',
    updateParameters: 'Mettre à jour les paramètres de ciblage et de remise',
    configureParameters: 'Configurer les paramètres de ciblage et de remise',
  },
  de: {
    editCampaign: 'Post-Kauf-Kampagne bearbeiten',
    createNewCampaign: 'Neue Post-Kauf-Kampagne erstellen',
    updateParameters: 'Targeting- und Rabattparameter aktualisieren',
    configureParameters: 'Targeting- und Rabattparameter konfigurieren',
  },
  pt: { editCampaign: 'Editar campanha pós-compra', createNewCampaign: 'Criar nova campanha pós-compra' },
  it: { editCampaign: 'Modifica campagna post-acquisto', createNewCampaign: 'Crea nuova campagna post-acquisto' },
  nl: { editCampaign: 'Post-aankoopcampagne bewerken', createNewCampaign: 'Nieuwe post-aankoopcampagne maken' },
  pl: { editCampaign: 'Edytuj kampanię po zakupie', createNewCampaign: 'Utwórz nową kampanię po zakupie' },
  sv: { editCampaign: 'Redigera efterköpskampanj', createNewCampaign: 'Skapa ny efterköpskampanj' },
  da: { editCampaign: 'Rediger efterkøbskampagne', createNewCampaign: 'Opret ny efterkøbskampagne' },
  no: { editCampaign: 'Rediger etterkjøpskampanje', createNewCampaign: 'Opprett ny etterkjøpskampanje' },
  fi: { editCampaign: 'Muokkaa oston jälkeistä kampanjaa', createNewCampaign: 'Luo uusi oston jälkeinen kampanja' },
  cs: { editCampaign: 'Upravit kampaň po nákupu', createNewCampaign: 'Vytvořit novou kampaň po nákupu' },
  tr: { editCampaign: 'Satın alma sonrası kampanyayı düzenle', createNewCampaign: 'Yeni satın alma sonrası kampanyası oluştur' },
  ja: { editCampaign: '購入後キャンペーンを編集', createNewCampaign: '新しい購入後キャンペーンを作成' },
  ko: { editCampaign: '구매 후 캠페인 편집', createNewCampaign: '새 구매 후 캠페인 만들기' },
  zh: { editCampaign: '编辑购买后营销活动', createNewCampaign: '创建新的购买后营销活动' },
  ar: { editCampaign: 'تحرير حملة ما بعد الشراء', createNewCampaign: 'إنشاء حملة جديدة بعد الشراء' },
  he: { editCampaign: 'עריכת קמפיין לאחר רכישה', createNewCampaign: 'יצירת קמפיין חדש לאחר רכישה' },
  ru: { editCampaign: 'Редактировать кампанию после покупки', createNewCampaign: 'Создать новую кампанию после покупки' },
};

const TRANSLATIONS: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en: { ...EN, ...CAMPAIGN_MODAL_TRANSLATIONS.en },
  es: { ...ES, ...CAMPAIGN_MODAL_TRANSLATIONS.es },
  fr: { ...FR, ...CAMPAIGN_MODAL_TRANSLATIONS.fr },
  de: { ...DE, ...CAMPAIGN_MODAL_TRANSLATIONS.de },
  ...Object.fromEntries(
    Object.entries(CORE_TRANSLATIONS).map(([locale, translations]) => [
      locale,
      { ...translations, ...CAMPAIGN_MODAL_TRANSLATIONS[locale as Locale] },
    ]),
  ),
} as Record<Locale, Partial<Record<TranslationKey, string>>>;

export const resolveLocale = (value?: string | null): Locale => {
  const language = (value || '').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(language as Locale) ? (language as Locale) : 'en';
};

export const detectLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('ppo-locale');
      if (stored) return resolveLocale(stored);
    } catch {}
  }
  if (typeof document !== 'undefined') return resolveLocale(document.documentElement.lang || navigator.language);
  return 'en';
};

export const getInitialLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('ppo-locale');
      if (stored) return resolveLocale(stored);
    } catch {}
  }
  return 'en';
};

export const setStoredLocale = (locale: Locale) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('ppo-locale', locale);
    } catch {}
  }
};

export const broadcastLocaleChange = (locale: Locale) => {
  setStoredLocale(locale);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ppo:locale-change', { detail: { locale } }));
    try {
      window.parent?.postMessage({ type: 'ppo:locale-change', locale }, '*');
    } catch {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('ppo-locale-channel');
        channel.postMessage({ locale });
        channel.close();
      }
    } catch {}
  }
};

export const subscribeToLocaleChanges = (callback: (locale: Locale) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent)?.detail;
    if (detail?.locale) callback(resolveLocale(detail.locale));
  };

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'ppo:locale-change' && event.data.locale) {
      callback(resolveLocale(event.data.locale));
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'ppo-locale' && event.newValue) {
      callback(resolveLocale(event.newValue));
    }
  };

  window.addEventListener('ppo:locale-change', handleCustomEvent);
  window.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('ppo-locale-channel');
      channel.onmessage = (event) => {
        if (event.data?.locale) callback(resolveLocale(event.data.locale));
      };
    }
  } catch {}

  return () => {
    window.removeEventListener('ppo:locale-change', handleCustomEvent);
    window.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
    try {
      channel?.close();
    } catch {}
  };
};

export const translate = (locale: Locale, key: TranslationKey, values: Record<string, string | number> = {}): string => {
  const template = TRANSLATIONS[locale][key] || EN[key];
  return Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), template);
};

export const localeLabel = (locale: Locale): string => LOCALE_NAMES[locale];
export type { TranslationKey };
