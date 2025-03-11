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
      items_fetch_success: 'Collection\'s items have been fetched successfully',
      items_fetch_error: 'Error fetching collection\'s items',
      timestamps_fetch_success: 'Timestamps have been fetched successfully',
      timestamps_fetch_error: 'Error fetching timestamps',
      confirm_deletion_items_from_previous_collection: "Items from the previous collection will be deleted and overwritten by the new one. \nDo you want to proceed?",
      //Datasets
      available_datasets: 'Available Datasets',
      no_datasets_available: 'No datasets available.',
      //Datasets - Toggle
      toggle_datasets: 'Toggle Datasets',
      filtering_by_map_view: 'Filtering datasets by region',
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
      error_fetching_data: 'Failed to fetch data',
      error_fetching_data_by_name: 'Failed to fetch data by name',
      error_fetching_data_by_date: 'Failed to fetch data by date',
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
      items_fetch_success: "Les items de la collection ont été récupérés avec succès",
      items_fetch_error: "Erreur lors de la récupération des items de la collection",
      timestamps_fetch_success: "Les timestamps ont été récupérés avec succès",
      timestamps_fetch_error: "Erreur lors de la récupération des timestamps",
      confirm_deletion_items_from_previous_collection: "Les items de la collection précédente seront supprimés et remplacés par la nouvelle. \nVoulez-vous continuer",
      //Datasets
      available_datasets: 'Collections disponibles',
      no_datasets_available: 'Aucune collection disponible.',
      //Datasets - Toggle
      toggle_datasets: "Basculer les jeux de données",
      filtering_by_map_view: "Filtrer les données par région",
      showing_all_datasets: "Affichage de toutes les données",
      map_required: "Charger la carte d'abord",
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
      error_fetching_data: 'Échec de la récupération des données',
      error_fetching_data_by_name: 'Échec de la récupération des données par nom',
      error_fetching_data_by_date: 'Échec de la récupération des données par date',
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