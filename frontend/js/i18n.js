// Internationalization (i18n) System for Bus Tracking Frontend
// Supports dynamic language switching without page reload

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.supportedLanguages = ['en', 'es', 'fr', 'zh', 'ar', 'hi'];
        this.isInitialized = false;
        
        // Initialize the system
        this.init().then(() => {
            this.isInitialized = true;
            console.log('I18n initialization completed successfully');
        }).catch(error => {
            console.error('I18n initialization failed:', error);
        });
    }

    init() {
        console.log('Starting i18n initialization...');
        
        // Load stored language preference
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        console.log('Loaded language preference:', this.currentLanguage);
        
        // Load translations
        this.loadTranslations();
        
        // Set up language selector
        this.setupLanguageSelector();
        
        // Apply initial language
        this.applyLanguage(this.currentLanguage);
        
        console.log('I18n system initialized with language:', this.currentLanguage);
        
        return Promise.resolve(); // Return a resolved promise for compatibility
    }

    loadTranslations() {
        console.log('Loading translations...');
        // Define translations inline (in production, these could be loaded from separate JSON files)
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.liveTracking': 'Live Tracking',
                'nav.routes': 'Routes',
                'nav.services': 'Services',
                'nav.contact': 'Contact',
                'nav.fullscreen': 'Fullscreen',
                'nav.language': 'Language',
                
                // Home Page
                'hero.title': 'Real-Time Public Transit Tracking',
                'hero.subtitle': 'Monitor bus locations, schedules, and routes with our advanced tracking system. Ensuring efficient and reliable public transportation for all citizens.',
                'hero.trackBus': 'Track Bus Now',
                'hero.viewRoutes': 'View Routes',
                
                // Features Section
                'features.title': 'System Features',
                'features.gps.title': 'GPS Tracking',
                'features.gps.desc': 'Real-time GPS monitoring of all buses with accurate location updates every 30 seconds for precise tracking.',
                'features.schedule.title': 'Schedule Management',
                'features.schedule.desc': 'Automated schedule tracking with real-time updates on delays, early arrivals, and route modifications.',
                'features.mobile.title': 'Mobile Access',
                'features.mobile.desc': 'Responsive web design accessible on all devices, ensuring citizens can access transit information anywhere.',
                'features.analytics.title': 'Analytics Dashboard',
                'features.analytics.desc': 'Comprehensive reporting and analytics for route optimization and performance monitoring.',
                'features.alerts.title': 'Alert System',
                'features.alerts.desc': 'Automated notifications for service disruptions, delays, and important transit announcements.',
                'features.security.title': 'Secure Platform',
                'features.security.desc': 'Government-grade security ensuring data protection and system reliability for public use.',
                
                // Stats Section
                'stats.buses': 'Active Buses',
                'stats.routes': 'Routes Covered',
                'stats.passengers': 'Daily Passengers',
                'stats.uptime': 'System Uptime',
                
                // Quick Access
                'quickAccess.title': 'Quick Access',
                'quickAccess.nearestStop.title': 'Find Nearest Stop',
                'quickAccess.nearestStop.desc': 'Locate the closest bus stop to your current location with walking directions.',
                'quickAccess.schedule.title': 'Schedule Lookup',
                'quickAccess.schedule.desc': 'Check bus schedules and plan your journey with arrival and departure times.',
                'quickAccess.route.title': 'Route Information',
                'quickAccess.route.desc': 'Detailed route maps with all stops and estimated travel times.',
                'quickAccess.support.title': 'Support Center',
                'quickAccess.support.desc': 'Contact our 24/7 support team for assistance and inquiries.',
                
                // Live Tracking Page
                'tracking.title': 'Bus Tracking Control',
                'tracking.mapView': 'Map View',
                'tracking.listView': 'List View',
                'tracking.searchPlaceholder': 'Search by route, bus number, or destination...',
                'tracking.filterAll': 'All',
                'tracking.filterRoute': 'Route',
                'tracking.filterNearby': 'Nearby',
                'tracking.filterExpress': 'Express',
                'tracking.filterLocal': 'Local',
                'tracking.filterDelayed': 'Delayed',
                'tracking.autoRefresh': 'Auto Refresh',
                'tracking.refreshRate': 'Refresh Rate',
                'tracking.showTraffic': 'Show Traffic',
                'tracking.soundAlerts': 'Sound Alerts',
                'tracking.highContrast': 'High Contrast',
                'tracking.busInfo': 'Bus Information',
                'tracking.busNumber': 'Bus Number',
                'tracking.route': 'Route',
                'tracking.speed': 'Current Speed & Direction',
                'tracking.driver': 'Driver',
                'tracking.capacity': 'Passenger Capacity',
                'tracking.nextStops': 'Next Stops',
                'tracking.loading': 'Loading bus locations...',
                
                // Status
                'status.active': 'Active',
                'status.delayed': 'Delayed',
                'status.stopped': 'Stopped',
                'status.offline': 'Offline',
                
                // Time units
                'time.seconds': 'seconds',
                'time.minute': 'minute',
                'time.minutes': 'minutes',
                
                // Notifications
                'notification.languageChanged': 'Language changed to',
                'notification.locationFound': 'Your location has been found',
                'notification.locationError': 'Unable to get your location. Please enable location services.',
                'notification.busSelected': 'Selected bus',
                'notification.busUpdated': 'Bus locations updated',
                'notification.offline': 'Using offline data',
                
                // Footer
                'footer.department': 'Department of Transportation',
                'footer.description': 'Committed to providing safe, efficient, and reliable public transportation services for all citizens.',
                'footer.quickLinks': 'Quick Links',
                'footer.support': 'Support',
                'footer.contact': 'Contact Information',
                'footer.rights': 'All rights reserved.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Terms of Service'
            },
            
            es: {
                // Navigation
                'nav.home': 'Inicio',
                'nav.liveTracking': 'Seguimiento en Vivo',
                'nav.routes': 'Rutas',
                'nav.services': 'Servicios',
                'nav.contact': 'Contacto',
                'nav.fullscreen': 'Pantalla Completa',
                'nav.language': 'Idioma',
                
                // Home Page
                'hero.title': 'Seguimiento de Transporte Público en Tiempo Real',
                'hero.subtitle': 'Monitoree ubicaciones de autobuses, horarios y rutas con nuestro sistema de seguimiento avanzado. Garantizando transporte público eficiente y confiable para todos los ciudadanos.',
                'hero.trackBus': 'Rastrear Autobús Ahora',
                'hero.viewRoutes': 'Ver Rutas',
                
                // Features Section
                'features.title': 'Características del Sistema',
                'features.gps.title': 'Seguimiento GPS',
                'features.gps.desc': 'Monitoreo GPS en tiempo real de todos los autobuses con actualizaciones de ubicación precisas cada 30 segundos.',
                'features.schedule.title': 'Gestión de Horarios',
                'features.schedule.desc': 'Seguimiento automatizado de horarios con actualizaciones en tiempo real sobre retrasos, llegadas tempranas y modificaciones de rutas.',
                'features.mobile.title': 'Acceso Móvil',
                'features.mobile.desc': 'Diseño web responsivo accesible en todos los dispositivos, asegurando que los ciudadanos puedan acceder a información de tránsito en cualquier lugar.',
                'features.analytics.title': 'Panel de Análisis',
                'features.analytics.desc': 'Informes integrales y análisis para optimización de rutas y monitoreo de rendimiento.',
                'features.alerts.title': 'Sistema de Alertas',
                'features.alerts.desc': 'Notificaciones automáticas para interrupciones del servicio, retrasos y anuncios importantes de tránsito.',
                'features.security.title': 'Plataforma Segura',
                'features.security.desc': 'Seguridad de grado gubernamental que garantiza la protección de datos y la confiabilidad del sistema para uso público.',
                
                // Stats Section
                'stats.buses': 'Autobuses Activos',
                'stats.routes': 'Rutas Cubiertas',
                'stats.passengers': 'Pasajeros Diarios',
                'stats.uptime': 'Tiempo de Actividad del Sistema',
                
                // Quick Access
                'quickAccess.title': 'Acceso Rápido',
                'quickAccess.nearestStop.title': 'Encontrar Parada Más Cercana',
                'quickAccess.nearestStop.desc': 'Ubique la parada de autobús más cercana a su ubicación actual con direcciones para caminar.',
                'quickAccess.schedule.title': 'Consulta de Horarios',
                'quickAccess.schedule.desc': 'Consulte horarios de autobuses y planifique su viaje con horarios de llegada y salida.',
                'quickAccess.route.title': 'Información de Rutas',
                'quickAccess.route.desc': 'Mapas detallados de rutas con todas las paradas y tiempos de viaje estimados.',
                'quickAccess.support.title': 'Centro de Soporte',
                'quickAccess.support.desc': 'Contacte a nuestro equipo de soporte 24/7 para asistencia e consultas.',
                
                // Live Tracking Page
                'tracking.title': 'Control de Seguimiento de Autobuses',
                'tracking.mapView': 'Vista de Mapa',
                'tracking.listView': 'Vista de Lista',
                'tracking.searchPlaceholder': 'Buscar por ruta, número de autobús o destino...',
                'tracking.filterAll': 'Todos',
                'tracking.filterRoute': 'Ruta',
                'tracking.filterNearby': 'Cercanos',
                'tracking.filterExpress': 'Expreso',
                'tracking.filterLocal': 'Local',
                'tracking.filterDelayed': 'Retrasados',
                'tracking.autoRefresh': 'Actualización Automática',
                'tracking.refreshRate': 'Frecuencia de Actualización',
                'tracking.showTraffic': 'Mostrar Tráfico',
                'tracking.soundAlerts': 'Alertas de Sonido',
                'tracking.highContrast': 'Alto Contraste',
                'tracking.busInfo': 'Información del Autobús',
                'tracking.busNumber': 'Número de Autobús',
                'tracking.route': 'Ruta',
                'tracking.speed': 'Velocidad y Dirección Actual',
                'tracking.driver': 'Conductor',
                'tracking.capacity': 'Capacidad de Pasajeros',
                'tracking.nextStops': 'Próximas Paradas',
                'tracking.loading': 'Cargando ubicaciones de autobuses...',
                
                // Status
                'status.active': 'Activo',
                'status.delayed': 'Retrasado',
                'status.stopped': 'Detenido',
                'status.offline': 'Fuera de línea',
                
                // Time units
                'time.seconds': 'segundos',
                'time.minute': 'minuto',
                'time.minutes': 'minutos',
                
                // Notifications
                'notification.languageChanged': 'Idioma cambiado a',
                'notification.locationFound': 'Se ha encontrado su ubicación',
                'notification.locationError': 'No se puede obtener su ubicación. Por favor habilite los servicios de ubicación.',
                'notification.busSelected': 'Autobús seleccionado',
                'notification.busUpdated': 'Ubicaciones de autobuses actualizadas',
                'notification.offline': 'Usando datos sin conexión',
                
                // Footer
                'footer.department': 'Departamento de Transporte',
                'footer.description': 'Comprometidos a brindar servicios de transporte público seguros, eficientes y confiables para todos los ciudadanos.',
                'footer.quickLinks': 'Enlaces Rápidos',
                'footer.support': 'Soporte',
                'footer.contact': 'Información de Contacto',
                'footer.rights': 'Todos los derechos reservados.',
                'footer.privacy': 'Política de Privacidad',
                'footer.terms': 'Términos de Servicio'
            },
            
            fr: {
                // Navigation
                'nav.home': 'Accueil',
                'nav.liveTracking': 'Suivi en Direct',
                'nav.routes': 'Itinéraires',
                'nav.services': 'Services',
                'nav.contact': 'Contact',
                'nav.fullscreen': 'Plein Écran',
                'nav.language': 'Langue',
                
                // Home Page
                'hero.title': 'Suivi des Transports Publics en Temps Réel',
                'hero.subtitle': 'Surveillez les emplacements, horaires et itinéraires des bus avec notre système de suivi avancé. Assurant un transport public efficace et fiable pour tous les citoyens.',
                'hero.trackBus': 'Suivre le Bus Maintenant',
                'hero.viewRoutes': 'Voir les Itinéraires',
                
                // Features Section
                'features.title': 'Fonctionnalités du Système',
                'features.gps.title': 'Suivi GPS',
                'features.gps.desc': 'Surveillance GPS en temps réel de tous les bus avec des mises à jour de localisation précises toutes les 30 secondes.',
                'features.schedule.title': 'Gestion des Horaires',
                'features.schedule.desc': 'Suivi automatisé des horaires avec des mises à jour en temps réel sur les retards, arrivées anticipées et modifications d\'itinéraires.',
                'features.mobile.title': 'Accès Mobile',
                'features.mobile.desc': 'Conception web responsive accessible sur tous les appareils, permettant aux citoyens d\'accéder aux informations de transport n\'importe où.',
                'features.analytics.title': 'Tableau de Bord Analytique',
                'features.analytics.desc': 'Rapports complets et analyses pour l\'optimisation des itinéraires et la surveillance des performances.',
                'features.alerts.title': 'Système d\'Alerte',
                'features.alerts.desc': 'Notifications automatiques pour les perturbations de service, retards et annonces importantes de transport.',
                'features.security.title': 'Plateforme Sécurisée',
                'features.security.desc': 'Sécurité de niveau gouvernemental garantissant la protection des données et la fiabilité du système pour l\'usage public.',
                
                // Stats Section
                'stats.buses': 'Bus Actifs',
                'stats.routes': 'Itinéraires Couverts',
                'stats.passengers': 'Passagers Quotidiens',
                'stats.uptime': 'Temps de Fonctionnement du Système',
                
                // Quick Access
                'quickAccess.title': 'Accès Rapide',
                'quickAccess.nearestStop.title': 'Trouver l\'Arrêt le Plus Proche',
                'quickAccess.nearestStop.desc': 'Localisez l\'arrêt de bus le plus proche de votre position actuelle avec directions piétonnes.',
                'quickAccess.schedule.title': 'Recherche d\'Horaires',
                'quickAccess.schedule.desc': 'Consultez les horaires des bus et planifiez votre voyage avec les heures d\'arrivée et de départ.',
                'quickAccess.route.title': 'Informations sur les Itinéraires',
                'quickAccess.route.desc': 'Cartes détaillées des itinéraires avec tous les arrêts et temps de trajet estimés.',
                'quickAccess.support.title': 'Centre de Support',
                'quickAccess.support.desc': 'Contactez notre équipe de support 24h/24 et 7j/7 pour assistance et demandes.',
                
                // Live Tracking Page
                'tracking.title': 'Contrôle de Suivi des Bus',
                'tracking.mapView': 'Vue Carte',
                'tracking.listView': 'Vue Liste',
                'tracking.searchPlaceholder': 'Rechercher par itinéraire, numéro de bus ou destination...',
                'tracking.filterAll': 'Tous',
                'tracking.filterRoute': 'Itinéraire',
                'tracking.filterNearby': 'À Proximité',
                'tracking.filterExpress': 'Express',
                'tracking.filterLocal': 'Local',
                'tracking.filterDelayed': 'Retardés',
                'tracking.autoRefresh': 'Actualisation Automatique',
                'tracking.refreshRate': 'Fréquence d\'Actualisation',
                'tracking.showTraffic': 'Afficher le Trafic',
                'tracking.soundAlerts': 'Alertes Sonores',
                'tracking.highContrast': 'Contraste Élevé',
                'tracking.busInfo': 'Informations sur le Bus',
                'tracking.busNumber': 'Numéro de Bus',
                'tracking.route': 'Itinéraire',
                'tracking.speed': 'Vitesse et Direction Actuelles',
                'tracking.driver': 'Conducteur',
                'tracking.capacity': 'Capacité de Passagers',
                'tracking.nextStops': 'Prochains Arrêts',
                'tracking.loading': 'Chargement des emplacements des bus...',
                
                // Status
                'status.active': 'Actif',
                'status.delayed': 'Retardé',
                'status.stopped': 'Arrêté',
                'status.offline': 'Hors ligne',
                
                // Time units
                'time.seconds': 'secondes',
                'time.minute': 'minute',
                'time.minutes': 'minutes',
                
                // Notifications
                'notification.languageChanged': 'Langue changée en',
                'notification.locationFound': 'Votre position a été trouvée',
                'notification.locationError': 'Impossible d\'obtenir votre position. Veuillez activer les services de localisation.',
                'notification.busSelected': 'Bus sélectionné',
                'notification.busUpdated': 'Emplacements des bus mis à jour',
                'notification.offline': 'Utilisation des données hors ligne',
                
                // Footer
                'footer.department': 'Département des Transports',
                'footer.description': 'Engagés à fournir des services de transport public sûrs, efficaces et fiables pour tous les citoyens.',
                'footer.quickLinks': 'Liens Rapides',
                'footer.support': 'Support',
                'footer.contact': 'Informations de Contact',
                'footer.rights': 'Tous droits réservés.',
                'footer.privacy': 'Politique de Confidentialité',
                'footer.terms': 'Conditions d\'Utilisation'
            },
            
            zh: {
                // Navigation
                'nav.home': '首页',
                'nav.liveTracking': '实时跟踪',
                'nav.routes': '路线',
                'nav.services': '服务',
                'nav.contact': '联系',
                'nav.fullscreen': '全屏',
                'nav.language': '语言',
                
                // Home Page
                'hero.title': '实时公共交通跟踪',
                'hero.subtitle': '使用我们的先进跟踪系统监控公交车位置、时刻表和路线。为所有公民确保高效可靠的公共交通。',
                'hero.trackBus': '立即跟踪公交车',
                'hero.viewRoutes': '查看路线',
                
                // Features Section
                'features.title': '系统特性',
                'features.gps.title': 'GPS跟踪',
                'features.gps.desc': '对所有公交车进行实时GPS监控，每30秒提供精确的位置更新。',
                'features.schedule.title': '时刻表管理',
                'features.schedule.desc': '自动化时刻表跟踪，实时更新延误、提前到达和路线修改信息。',
                'features.mobile.title': '移动访问',
                'features.mobile.desc': '在所有设备上可访问的响应式网页设计，确保公民可以随时随地获取交通信息。',
                'features.analytics.title': '分析仪表板',
                'features.analytics.desc': '用于路线优化和性能监控的综合报告和分析。',
                'features.alerts.title': '警报系统',
                'features.alerts.desc': '自动通知服务中断、延误和重要交通公告。',
                'features.security.title': '安全平台',
                'features.security.desc': '政府级安全保障数据保护和系统可靠性，供公众使用。',
                
                // Stats Section
                'stats.buses': '活跃公交车',
                'stats.routes': '覆盖路线',
                'stats.passengers': '每日乘客',
                'stats.uptime': '系统正常运行时间',
                
                // Quick Access
                'quickAccess.title': '快速访问',
                'quickAccess.nearestStop.title': '查找最近站点',
                'quickAccess.nearestStop.desc': '定位离您当前位置最近的公交站点并提供步行指引。',
                'quickAccess.schedule.title': '时刻表查询',
                'quickAccess.schedule.desc': '查看公交时刻表，规划您的行程，了解到达和出发时间。',
                'quickAccess.route.title': '路线信息',
                'quickAccess.route.desc': '详细的路线图，包含所有站点和预计行驶时间。',
                'quickAccess.support.title': '支持中心',
                'quickAccess.support.desc': '联系我们的24/7支持团队获取帮助和咨询。',
                
                // Live Tracking Page
                'tracking.title': '公交跟踪控制',
                'tracking.mapView': '地图视图',
                'tracking.listView': '列表视图',
                'tracking.searchPlaceholder': '按路线、公交车号码或目的地搜索...',
                'tracking.filterAll': '全部',
                'tracking.filterRoute': '路线',
                'tracking.filterNearby': '附近',
                'tracking.filterExpress': '快车',
                'tracking.filterLocal': '本地',
                'tracking.filterDelayed': '延误',
                'tracking.autoRefresh': '自动刷新',
                'tracking.refreshRate': '刷新频率',
                'tracking.showTraffic': '显示交通',
                'tracking.soundAlerts': '声音警报',
                'tracking.highContrast': '高对比度',
                'tracking.busInfo': '公交车信息',
                'tracking.busNumber': '公交车号码',
                'tracking.route': '路线',
                'tracking.speed': '当前速度和方向',
                'tracking.driver': '司机',
                'tracking.capacity': '乘客容量',
                'tracking.nextStops': '下一站',
                'tracking.loading': '正在加载公交车位置...',
                
                // Status
                'status.active': '活跃',
                'status.delayed': '延误',
                'status.stopped': '停止',
                'status.offline': '离线',
                
                // Time units
                'time.seconds': '秒',
                'time.minute': '分钟',
                'time.minutes': '分钟',
                
                // Notifications
                'notification.languageChanged': '语言已更改为',
                'notification.locationFound': '已找到您的位置',
                'notification.locationError': '无法获取您的位置。请启用位置服务。',
                'notification.busSelected': '已选择公交车',
                'notification.busUpdated': '公交车位置已更新',
                'notification.offline': '使用离线数据',
                
                // Footer
                'footer.department': '交通运输部',
                'footer.description': '致力于为所有公民提供安全、高效、可靠的公共交通服务。',
                'footer.quickLinks': '快速链接',
                'footer.support': '支持',
                'footer.contact': '联系信息',
                'footer.rights': '版权所有。',
                'footer.privacy': '隐私政策',
                'footer.terms': '服务条款'
            },
            
            ar: {
                // Navigation
                'nav.home': 'الرئيسية',
                'nav.liveTracking': 'التتبع المباشر',
                'nav.routes': 'الطرق',
                'nav.services': 'الخدمات',
                'nav.contact': 'اتصل بنا',
                'nav.fullscreen': 'شاشة كاملة',
                'nav.language': 'اللغة',
                
                // Home Page
                'hero.title': 'تتبع النقل العام في الوقت الفعلي',
                'hero.subtitle': 'راقب مواقع الحافلات والجداول الزمنية والطرق باستخدام نظام التتبع المتقدم. ضمان النقل العام الفعال والموثوق لجميع المواطنين.',
                'hero.trackBus': 'تتبع الحافلة الآن',
                'hero.viewRoutes': 'عرض الطرق',
                
                // Features Section
                'features.title': 'ميزات النظام',
                'features.gps.title': 'تتبع GPS',
                'features.gps.desc': 'مراقبة GPS في الوقت الفعلي لجميع الحافلات مع تحديثات دقيقة للموقع كل 30 ثانية للتتبع الدقيق.',
                'features.schedule.title': 'إدارة الجدولة',
                'features.schedule.desc': 'تتبع الجدولة الآلي مع التحديثات في الوقت الفعلي حول التأخير والوصول المبكر وتعديلات الطرق.',
                'features.mobile.title': 'الوصول عبر الهاتف المحمول',
                'features.mobile.desc': 'تصميم ويب متجاوب يمكن الوصول إليه على جميع الأجهزة، مما يضمن وصول المواطنين إلى معلومات النقل في أي مكان.',
                'features.analytics.title': 'لوحة التحليلات',
                'features.analytics.desc': 'تقارير وتحليلات شاملة لتحسين الطرق ومراقبة الأداء.',
                'features.alerts.title': 'نظام التنبيهات',
                'features.alerts.desc': 'إشعارات تلقائية لانقطاع الخدمة والتأخير والإعلانات المهمة للنقل.',
                'features.security.title': 'منصة آمنة',
                'features.security.desc': 'أمان بمستوى حكومي يضمن حماية البيانات وموثوقية النظام للاستخدام العام.',
                
                // Stats Section
                'stats.buses': 'الحافلات النشطة',
                'stats.routes': 'الطرق المغطاة',
                'stats.passengers': 'الركاب اليوميون',
                'stats.uptime': 'وقت تشغيل النظام',
                
                // Quick Access
                'quickAccess.title': 'وصول سريع',
                'quickAccess.nearestStop.title': 'البحث عن أقرب محطة',
                'quickAccess.nearestStop.desc': 'حدد موقع أقرب محطة حافلات إلى موقعك الحالي مع توجيهات المشي.',
                'quickAccess.schedule.title': 'البحث في الجدول الزمني',
                'quickAccess.schedule.desc': 'تحقق من جداول الحافلات وخطط لرحلتك مع أوقات الوصول والمغادرة.',
                'quickAccess.route.title': 'معلومات الطريق',
                'quickAccess.route.desc': 'خرائط مفصلة للطرق مع جميع المحطات وأوقات السفر المقدرة.',
                'quickAccess.support.title': 'مركز الدعم',
                'quickAccess.support.desc': 'اتصل بفريق الدعم لدينا على مدار الساعة طوال أيام الأسبوع للحصول على المساعدة والاستفسارات.',
                
                // Live Tracking Page
                'tracking.title': 'تحكم تتبع الحافلات',
                'tracking.mapView': 'عرض الخريطة',
                'tracking.listView': 'عرض القائمة',
                'tracking.searchPlaceholder': 'البحث بالطريق أو رقم الحافلة أو الوجهة...',
                'tracking.filterAll': 'الكل',
                'tracking.filterRoute': 'الطريق',
                'tracking.filterNearby': 'قريب',
                'tracking.filterExpress': 'سريع',
                'tracking.filterLocal': 'محلي',
                'tracking.filterDelayed': 'متأخر',
                'tracking.autoRefresh': 'التحديث التلقائي',
                'tracking.refreshRate': 'معدل التحديث',
                'tracking.showTraffic': 'إظهار المرور',
                'tracking.soundAlerts': 'تنبيهات صوتية',
                'tracking.highContrast': 'تباين عالي',
                'tracking.busInfo': 'معلومات الحافلة',
                'tracking.busNumber': 'رقم الحافلة',
                'tracking.route': 'الطريق',
                'tracking.speed': 'السرعة والاتجاه الحالي',
                'tracking.driver': 'السائق',
                'tracking.capacity': 'سعة الركاب',
                'tracking.nextStops': 'المحطات التالية',
                'tracking.loading': 'جاري تحميل مواقع الحافلات...',
                
                // Status
                'status.active': 'نشط',
                'status.delayed': 'متأخر',
                'status.stopped': 'متوقف',
                'status.offline': 'غير متصل',
                
                // Time units
                'time.seconds': 'ثواني',
                'time.minute': 'دقيقة',
                'time.minutes': 'دقائق',
                
                // Notifications
                'notification.languageChanged': 'تم تغيير اللغة إلى',
                'notification.locationFound': 'تم العثور على موقعك',
                'notification.locationError': 'غير قادر على الحصول على موقعك. يرجى تفعيل خدمات الموقع.',
                'notification.busSelected': 'تم اختيار الحافلة',
                'notification.busUpdated': 'تم تحديث مواقع الحافلات',
                'notification.offline': 'استخدام البيانات دون اتصال',
                
                // Footer
                'footer.department': 'وزارة النقل',
                'footer.description': 'ملتزمون بتوفير خدمات النقل العام الآمنة والفعالة والموثوقة لجميع المواطنين.',
                'footer.quickLinks': 'روابط سريعة',
                'footer.support': 'الدعم',
                'footer.contact': 'معلومات الاتصال',
                'footer.rights': 'جميع الحقوق محفوظة.',
                'footer.privacy': 'سياسة الخصوصية',
                'footer.terms': 'شروط الخدمة'
            },
            
            hi: {
                // Navigation
                'nav.home': 'होम',
                'nav.liveTracking': 'लाइव ट्रैकिंग',
                'nav.routes': 'मार्ग',
                'nav.services': 'सेवाएं',
                'nav.contact': 'संपर्क',
                'nav.fullscreen': 'फुल स्क्रीन',
                'nav.language': 'भाषा',
                
                // Home Page
                'hero.title': 'रियल-टाइम सार्वजनिक परिवहन ट्रैकिंग',
                'hero.subtitle': 'हमारी उन्नत ट्रैकिंग प्रणाली के साथ बस स्थान, समय सारणी और मार्गों की निगरानी करें। सभी नागरिकों के लिए कुशल और विश्वसनीय सार्वजनिक परिवहन सुनिश्चित करना।',
                'hero.trackBus': 'अभी बस ट्रैक करें',
                'hero.viewRoutes': 'मार्ग देखें',
                
                // Features Section
                'features.title': 'सिस्टम विशेषताएं',
                'features.gps.title': 'GPS ट्रैकिंग',
                'features.gps.desc': 'सटीक ट्रैकिंग के लिए हर 30 सेकंड में सटीक स्थान अपडेट के साथ सभी बसों की रियल-टाइम GPS निगरानी।',
                'features.schedule.title': 'शेड्यूल प्रबंधन',
                'features.schedule.desc': 'देरी, जल्दी आगमन और मार्ग संशोधन पर रियल-टाइम अपडेट के साथ स्वचालित शेड्यूल ट्रैकिंग।',
                'features.mobile.title': 'मोबाइल एक्सेस',
                'features.mobile.desc': 'सभी उपकरणों पर पहुंच योग्य रिस्पॉन्सिव वेब डिज़ाइन, यह सुनिश्चित करता है कि नागरिक कहीं भी परिवहन जानकारी प्राप्त कर सकें।',
                'features.analytics.title': 'एनालिटिक्स डैशबोर्ड',
                'features.analytics.desc': 'मार्ग अनुकूलन और प्रदर्शन निगरानी के लिए व्यापक रिपोर्टिंग और एनालिटिक्स।',
                'features.alerts.title': 'अलर्ट सिस्टम',
                'features.alerts.desc': 'सेवा व्यवधान, देरी और महत्वपूर्ण परिवहन घोषणाओं के लिए स्वचालित सूचनाएं।',
                'features.security.title': 'सुरक्षित प्लेटफॉर्म',
                'features.security.desc': 'सरकारी-श्रेणी की सुरक्षा डेटा सुरक्षा और सार्वजनिक उपयोग के लिए सिस्टम विश्वसनीयता सुनिश्चित करती है।',
                
                // Stats Section
                'stats.buses': 'सक्रिय बसें',
                'stats.routes': 'कवर किए गए मार्ग',
                'stats.passengers': 'दैनिक यात्री',
                'stats.uptime': 'सिस्टम अपटाइम',
                
                // Quick Access
                'quickAccess.title': 'त्वरित पहुंच',
                'quickAccess.nearestStop.title': 'निकटतम स्टॉप खोजें',
                'quickAccess.nearestStop.desc': 'आपकी वर्तमान स्थिति के निकटतम बस स्टॉप को पैदल मार्ग के साथ खोजें।',
                'quickAccess.schedule.title': 'शेड्यूल खोज',
                'quickAccess.schedule.desc': 'बस शेड्यूल देखें और आगमन और प्रस्थान समय के साथ अपनी यात्रा की योजना बनाएं।',
                'quickAccess.route.title': 'मार्ग जानकारी',
                'quickAccess.route.desc': 'सभी स्टॉप और अनुमानित यात्रा समय के साथ विस्तृत मार्ग मानचित्र।',
                'quickAccess.support.title': 'सहायता केंद्र',
                'quickAccess.support.desc': 'सहायता और पूछताछ के लिए हमारी 24/7 सहायता टीम से संपर्क करें।',
                
                // Live Tracking Page
                'tracking.title': 'बस ट्रैकिंग नियंत्रण',
                'tracking.mapView': 'मैप व्यू',
                'tracking.listView': 'लिस्ट व्यू',
                'tracking.searchPlaceholder': 'मार्ग, बस नंबर या गंतव्य से खोजें...',
                'tracking.filterAll': 'सभी',
                'tracking.filterRoute': 'मार्ग',
                'tracking.filterNearby': 'आसपास',
                'tracking.filterExpress': 'एक्सप्रेस',
                'tracking.filterLocal': 'स्थानीय',
                'tracking.filterDelayed': 'विलंबित',
                'tracking.autoRefresh': 'ऑटो रिफ्रेश',
                'tracking.refreshRate': 'रिफ्रेश दर',
                'tracking.showTraffic': 'ट्रैफिक दिखाएं',
                'tracking.soundAlerts': 'ध्वनि अलर्ट',
                'tracking.highContrast': 'उच्च कंट्रास्ट',
                'tracking.busInfo': 'बस जानकारी',
                'tracking.busNumber': 'बस नंबर',
                'tracking.route': 'मार्ग',
                'tracking.speed': 'वर्तमान गति और दिशा',
                'tracking.driver': 'ड्राइवर',
                'tracking.capacity': 'यात्री क्षमता',
                'tracking.nextStops': 'अगले स्टॉप',
                'tracking.loading': 'बस स्थान लोड हो रहे हैं...',
                
                // Status
                'status.active': 'सक्रिय',
                'status.delayed': 'विलंबित',
                'status.stopped': 'रुका हुआ',
                'status.offline': 'ऑफलाइन',
                
                // Time units
                'time.seconds': 'सेकंड',
                'time.minute': 'मिनट',
                'time.minutes': 'मिनट',
                
                // Notifications
                'notification.languageChanged': 'भाषा बदलकर',
                'notification.locationFound': 'आपका स्थान मिल गया है',
                'notification.locationError': 'आपका स्थान प्राप्त करने में असमर्थ। कृपया स्थान सेवाएं सक्षम करें।',
                'notification.busSelected': 'बस चुनी गई',
                'notification.busUpdated': 'बस स्थान अपडेट हो गए',
                'notification.offline': 'ऑफ़लाइन डेटा का उपयोग',
                
                // Footer
                'footer.department': 'परिवहन विभाग',
                'footer.description': 'सभी नागरिकों के लिए सुरक्षित, कुशल और विश्वसनीय सार्वजनिक परिवहन सेवाएं प्रदान करने के लिए प्रतिबद्ध।',
                'footer.quickLinks': 'त्वरित लिंक',
                'footer.support': 'सहायता',
                'footer.contact': 'संपर्क जानकारी',
                'footer.rights': 'सभी अधिकार सुरक्षित।',
                'footer.privacy': 'गोपनीयता नीति',
                'footer.terms': 'सेवा की शर्तें'
            }
        };
    }

    setupLanguageSelector() {
        // Wait for DOM to be fully loaded
        const setupSelectors = () => {
            const languageSelects = document.querySelectorAll('#languageSelect');
            
            console.log(`Found ${languageSelects.length} language selectors`);
            
            languageSelects.forEach((select, index) => {
                // Remove existing listeners to prevent duplicates
                const newSelect = select.cloneNode(true);
                select.parentNode.replaceChild(newSelect, select);
                
                // Set current language
                newSelect.value = this.currentLanguage;
                
                // Add change event listener
                newSelect.addEventListener('change', (e) => {
                    console.log('Language selector changed to:', e.target.value);
                    this.changeLanguage(e.target.value);
                });
                
                console.log(`Setup language selector ${index + 1}:`, newSelect.value);
            });
        };
        
        // Setup immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupSelectors);
        } else {
            setupSelectors();
        }
        
        // Also setup after a delay to catch dynamically added selectors
        setTimeout(setupSelectors, 1000);
    }

    changeLanguage(langCode) {
        console.log('changeLanguage called with:', langCode);
        
        if (!this.supportedLanguages.includes(langCode)) {
            console.warn(`Unsupported language: ${langCode}`);
            return;
        }

        console.log('Changing language from', this.currentLanguage, 'to', langCode);
        
        this.currentLanguage = langCode;
        localStorage.setItem('selectedLanguage', langCode);
        
        // Apply language
        console.log('Applying language translations...');
        this.applyLanguage(langCode);
        
        // Update all language selectors
        const languageSelects = document.querySelectorAll('#languageSelect');
        console.log(`Updating ${languageSelects.length} language selectors`);
        languageSelects.forEach(select => {
            select.value = langCode;
        });
        
        // Show notification
        const notificationText = this.t('notification.languageChanged') + ' ' + this.getLanguageName(langCode);
        console.log('Showing notification:', notificationText);
        this.showNotification('success', notificationText);
        
        // Update page direction for RTL languages
        this.updatePageDirection(langCode);
        
        console.log('Language successfully changed to:', langCode);
    }

    applyLanguage(langCode) {
        console.log('applyLanguage called for:', langCode);
        
        if (!this.translations[langCode]) {
            console.warn(`No translations found for language: ${langCode}`);
            return;
        }

        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`Found ${elements.length} elements with data-i18n attribute`);
        
        let translatedCount = 0;
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key, langCode);
            
            console.log(`Translating ${key}: "${element.textContent || element.placeholder}" -> "${translation}"`);
            
            if (translation !== key) { // Only update if translation exists
                // Check if element has placeholder attribute
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
                translatedCount++;
            } else {
                console.warn(`No translation found for key: ${key}`);
            }
        });
        
        console.log(`Successfully translated ${translatedCount} out of ${elements.length} elements`);

        // Update page title if it has data-i18n
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            const translation = this.t(key, langCode);
            if (translation !== key) {
                titleElement.textContent = translation;
                console.log(`Updated page title: ${translation}`);
            }
        }
    }

    t(key, langCode = null) {
        const lang = langCode || this.currentLanguage;
        const translation = this.translations[lang] && this.translations[lang][key];
        
        if (translation) {
            return translation;
        }
        
        // Fallback to English if translation not found
        if (lang !== this.fallbackLanguage) {
            const fallbackTranslation = this.translations[this.fallbackLanguage] && this.translations[this.fallbackLanguage][key];
            if (fallbackTranslation) {
                return fallbackTranslation;
            }
        }
        
        // Return key if no translation found
        return key;
    }

    getLanguageName(langCode) {
        const languageNames = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'zh': '中文',
            'ar': 'العربية',
            'hi': 'हिन्दी'
        };
        return languageNames[langCode] || langCode;
    }

    updatePageDirection(langCode) {
        // Set RTL for Arabic
        if (langCode === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', langCode);
        }
    }

    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `language-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-language"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#4f46e5'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#i18n-animations')) {
            const style = document.createElement('style');
            style.id = 'i18n-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Method to get translated text programmatically
    translate(key, langCode = null) {
        return this.t(key, langCode);
    }

    // Method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Method to get supported languages
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Initialize the I18n system
let i18nManager;

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
function initializeI18n() {
    console.log('Initializing I18n system...');
    i18nManager = new I18nManager();
    
    // Make it available globally
    window.i18n = i18nManager;
    
    console.log('I18n system initialized and available as window.i18n');
    console.log('Current language:', i18nManager.getCurrentLanguage());
    console.log('Supported languages:', i18nManager.getSupportedLanguages());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
    initializeI18n();
}

// Also make sure it's available after a short delay
setTimeout(() => {
    if (!window.i18n) {
        console.warn('I18n not initialized, attempting manual initialization...');
        initializeI18n();
    }
}, 500);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
