import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      //Setting
      api_endpoint: 'API Endpoint',
      save: 'Save',
      cancel: 'Cancel',
      invalid_url: 'Invalid URL. Please enter a valid API endpoint.',
      enter_new_api_endpoint: 'Enter new API endpoint',
      language_retrieved: 'Language has been retrieved from previous settings.',
      default_language_retrieved: 'Default language has been retrieved.',
      speed_retrieved: 'Speed has been retrieved from previous settings.',
      default_speed_retrieved: 'Default speed has been retrieved.',
      speed_changed: 'Speed has been changed to: ',
      api_endpoint_saved:
        'API endpoint successfully saved',
      copied_to_clipboard: 'Copied to clipboard',
      online: 'Online',
      offline: 'Offline',
      disabled: 'Disabled',
      no_internet_access: 'No internet access',
      //Language
      english: 'English',
      french: 'French',
      //Reset
      reset: 'Reset',
      confirm_reset_properties:
        'Application properties will be reset to default values. \nDo you want to proceed?',
      confirm_factory_reset_data_from_endpoint:
        'All data,  simulation configurations, and configurations files will be deleted. You will then be prompted to enter the endpoint to fetch new collections. \nDo you want to proceed?',
      factory_reset: 'Factory Reset',
      reset_initiated: 'Reset initiated',
      reset_completed: 'Properties have been reset to default values.',
      factory_reset_initiated: 'Factory reset initiated',
      collections_fetched_saved: "Collections fetched and saved successfully",
      items_fetch_success: 'Collection\'s items have been fetched successfully',
      assets_fetch_success:'Collection\'s assets have been fetched successfully',
      items_fetch_error: 'Error fetching collection\'s items',
      timestamps_fetch_success: 'Timestamps have been fetched successfully',
      timestamps_fetch_error: 'Error fetching timestamps',
      confirm_deletion_items_from_previous_collection: "Items from the previous collection will be deleted and overwritten by the new one. \nDo you want to proceed?",
      //Datasets
      available_datasets: 'Available Datasets',
      no_datasets_available: 'No datasets available.',
      loaded: 'Loaded',
      //Datasets - Toggle
      toggle_datasets: 'Toggle Datasets',
      filtering_by_map_view: 'Only Show Datasets in View',
      showing_all_datasets: 'Showing all datasets',
      map_required: 'Load map first',
      // Filters
      name: 'Name',
      date: 'Date',
      latest_added: 'Latest Added',
      latest_updated: 'Latest Updated',
      //Metadata
      metadata: 'Metadata',
      unknown_city: 'Unknown City',
      description: 'Description',
      format: 'Format',
      processes: 'Processes',
      dataset_source: 'Dataset Source',
      load_dataset: 'Load Dataset',
      n_a: 'N/A',
      //Loading Dataset
      loading_dataset: 'Loading Dataset...',
      collection_items: "Collection items",
      collection_item_assets: "Collection item assets",
      loading: "Loading",
      //Views
      views: 'Views',
      view_disabled: 'View disabled',
      collapse: 'Collapse',
      default_layer: 'Default Layer',
      topographical_layer: 'Topographical Layer',
      satellite_layer: 'Satellite Layer',
      //Decisions
      yes: 'Yes',
      no: 'No',
      //Errors
      error_fetching_collections:
        'Failed to fetch collections. Please try again with a valid endpoint url.',
      error_loading_dataset: "Error loading dataset:",
      error_fetching_data: 'Failed to fetch data',
      error_fetching_data_by_name: 'Failed to fetch data by name',
      error_fetching_data_by_date: 'Failed to fetch data by date',
      error_fetching_config_file:
        'Failed to fetch config file. Please validate app-config.json.',
      error_http_status: "HTTP error! Status",
      error_Fetching_collections: "Failed to fetch collections",
      error_failed_fetch_data: "Failed to fetch data",
      error_checking_collections: "Failed to check collections",
      error_resetting_collections: "Error resetting collections",
      error_resetting_items: "Error resetting items",
      error_fetching_metadata: "Failed to fetch MetaData",
      error_fetching_items: "Failed to fetch Items",
      error_fetching_progress: "Failed to fetch progress",
      error_fetching_timestamps: "Failed to fetch timestamps",
      error_fetching_ids: "Failed to fetch ids",
      error_inserting_view: "Failed to insert View",
      error_resetting_datalayer_view: "Failed to reset Datalayer View",
      error_verifying_connection: "Failed to verify connection",
      error_fetching_assets: "Failed to fetch assets",
      error_fetching_loaded_layers: "Failed to fetch loaded layers",
      error_resetting_item_assets: "Error resetting item assets",
      error_saving_config: "Error saving config",
      error_fetching_config: "Error fetching config",
      //Footer Component
      weather_assets_label: 'Weather Assets',
      load_assets_button: 'Load Assets',
      loading_label: 'Loading...',
      // Customize Style
      item_layer_style: 'Item Layer Style',
      item_layer: 'Item Layer',
      data_layer: 'Data Layer',
      data_layer_style: 'Data Layer Style',
      fill: 'Fill',
      fill_opacity: 'Fill Opacity',
      stroke: 'Stroke',
      stroke_width: 'Stroke Width',
      update_style: 'Save',
      reset_style: 'Reset',
    },
  },
  fr: {
    translation: {
      //Setting
      api_endpoint: "Point d'API",
      save: 'Enregistrer',
      cancel: 'Annuler',
      invalid_url: "URL invalide. Veuillez entrer un point d'API valide.",
      enter_new_api_endpoint: "Entrez un nouveau point d'API",
      language_retrieved:
        'La langue a été récupérée à partir des paramètres précédents.',
      default_language_retrieved: 'La langue par défaut a été récupérée.',
      speed_retrieved:
        'La vitesse a été récupérée à partir des paramètres précédents.',
      default_speed_retrieved: 'La vitesse par défaut a été récupérée.',
      speed_changed: 'La vitesse a été changée à: ',
      api_endpoint_saved:
        'Endpoint enregistré avec succès',
      copied_to_clipboard: 'Copié dans le presse-papiers',
      online: 'En ligne',
      offline: 'Hors ligne',
      disabled: "Désactivé",
      no_internet_access: 'Aucune connexion',
      //Language
      english: 'Anglais',
      french: 'Français',
      //Reset
      reset: 'Réinitialiser',
      confirm_reset_properties:
        'Les propriétés de l\'application seront réinitialisées aux valeurs par défaut. \nVoulez-vous continuer ?',
      confirm_factory_reset_data_from_endpoint:
        "Toutes les données, configurations de simulation et fichiers de configuration seront supprimés. Vous serez ensuite invité à entrer l'endpoint pour récupérer de nouvelles collections. \nVoulez-vous continuer ?",
      factory_reset: "Réinitialisation d'Usine",
      reset_initiated: 'Réinitialisation démarrée',
      reset_completed: 'Les propriétés ont été réinitialisées aux valeurs par défaut.',
      factory_reset_initiated: "Réinitialisation d'Usine démarrée",
      collections_fetched_saved: "Les collections ont été récupérées et enregistrées avec succès",
      items_fetch_success: "Les items de la collection ont été récupérés avec succès",
      assets_fetch_success:'Les assets de la collection ont été récupérés avec succès',
      items_fetch_error: "Erreur lors de la récupération des items de la collection",
      timestamps_fetch_success: "Les timestamps ont été récupérés avec succès",
      timestamps_fetch_error: "Erreur lors de la récupération des timestamps",
      confirm_deletion_items_from_previous_collection: "Les items de la collection précédente seront supprimés et remplacés par la nouvelle. \nVoulez-vous continuer",
      //Datasets
      available_datasets: 'Collections disponibles',
      no_datasets_available: 'Aucune collections disponible.',
      loaded: 'Chargé',
      //Datasets - Toggle
      toggle_datasets: 'Afficher les collections de données',
      showing_all_datasets: 'Afficher toutes les collections',
      filtering_by_map_view: 'Filtrer les collections par région',
      // Filters
      name: 'Nom',
      date: 'Date',
      latest_added: 'Dernier Ajouté',
      latest_updated: 'Dernière Mise à Jour',
      //Metadata
      metadata: 'Métadonnées',
      unknown_city: 'Ville Inconnue',
      description: 'Description',
      format: 'Format',
      processes: 'Processus',
      dataset_source: 'Source des Données',
      load_dataset: 'Charger le Jeu de Données',
      n_a: 'Indisponible',
      //Loading Dataset
      loading_dataset: 'Chargement du jeu de données...',
      collection_items: "Éléments de la collection",
      collection_item_assets: "Actifs des éléments de la collection",
      loading: "Chargement",
      //Views
      views: 'Vues',
      view_disabled: 'Vue désactivée',
      collapse: 'Réduire',
      default_layer: 'Calque par Défaut',
      topographical_layer: 'Calque Topographique',
      satellite_layer: 'Calque Satellite',
      //Decisions
      yes: 'Oui',
      no: 'Non',
      //Errors
      error_fetching_collections:
        "Impossible de récupérer les collections. Veuillez réessayer avec un URL d'endpoint valide.",
      error_loading_dataset: "Erreur lors du chargement du jeu de données :",
      error_fetching_data: 'Échec de la récupération des données',
      error_fetching_data_by_name: 'Échec de la récupération des données par nom',
      error_fetching_data_by_date: 'Échec de la récupération des données par date',
      error_fetching_config_file:
        "Impossible de récupérer le fichier de configuration. Veuillez valider app-config.json.",

      error_http_status: "Erreur HTTP ! Statut",
      error_Fetching_collections: "Impossible de récupérer les collections",
      error_failed_fetch_data: "Échec de la récupération des données",
      error_checking_collections: "Échec de la vérification des collections",
      error_resetting_collections: "Erreur lors de la réinitialisation des collections",
      error_resetting_items: "Erreur lors de la réinitialisation des éléments",
      error_fetching_metadata: "Impossible de récupérer les métadonnées",
      error_fetching_items: "Impossible de récupérer les items",
      error_fetching_progress: "Impossible de récupérer la progression",
      error_fetching_timestamps: "Impossible de récupérer les timestamps",
      error_fetching_ids: "Impossible de récupérer les identifiants",
      error_inserting_view: "Impossible d'insérer la vue",
      error_resetting_datalayer_view: "Impossible de réinitialiser la vue de couche de données",
      error_verifying_connection: "Impossible de vérifier la connexion",
      error_fetching_assets: "Impossible de récupérer les assets",
      error_fetching_loaded_layers: "Impossible de récupérer les couches chargées",
      error_resetting_item_assets: "Erreur lors de la réinitialisation des assets des éléments",
      error_saving_config: "Erreur lors de l'enregistrement de la configuration",
      error_fetching_config: "Erreur lors de la récupération de la configuration",
      //Footer Component
      weather_assets_label: 'Données Météo',
      load_assets_button: 'Charger les Données',
      loading_label: 'Chargement...',
      // Customize Style
      item_layer_style: 'Style des items',
      item_layer: 'Items',
      data_layer: 'Couche de données',
      data_layer_style: 'Style de la couche de données',
      fill: 'Remplissage',
      fill_opacity: 'Opacité',
      stroke: 'Contour',
      stroke_width: 'Largeur du Contour',
      update_style: 'Enregistrer',
      reset_style: 'Réinitialiser',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
