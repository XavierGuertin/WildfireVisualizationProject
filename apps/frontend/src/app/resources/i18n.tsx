import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
        //Setting
        api_endpoint: "API Endpoint",
        save: "Save",
        cancel: "Cancel",
        invalid_url: "Invalid URL. Please enter a valid API endpoint.",
        enter_new_api_endpoint: "Enter new API endpoint",
       language_saved: "Language has been saved successfully.",
        //Language
        english: "English",
        french: "French",
        //Reset
        reset: "Reset",
        factory_reset: "Factory Reset",
        reset_initiated: "Reset initiated",
        factory_reset_initiated: "Factory Reset initiated",
        //Datasets
        available_datasets: "Available Datasets",
        no_datasets_available: "No Datasets available.",
        toggle_datasets: "Toggle Datasets",
        name: "Name",
        date: "Date",
        latest_added: "Latest Added",
        latest_updated: "Latest Updated",
        //Metadata
        metadata: "Metadata",
        unknown_city: "Unknown City",
        description: "Description",
        format: "Format",
        processes: "Processes",
        dataset_source: "Dataset Source",
        load_dataset: "Load Dataset",
        n_a: "N/A",
        //Loading Dataset
        loading_dataset: "Loading Dataset...",
        //Views
        views: "Views",
        collapse: "Collapse",
        default_layer: "Default Layer",
        topographical_layer: "Topographical Layer",
        satellite_layer: "Satellite Layer"
    },
  },
  fr: {
    translation: {
        //Setting
        api_endpoint: "Point d'API",
        save: "Enregistrer",
        cancel: "Annuler",
        invalid_url: "URL invalide. Veuillez entrer un point d'API valide.",
        enter_new_api_endpoint: "Entrez un nouveau point d'API",
        language_saved: "La langue a été enregistrée avec succès.",
        //Language
        english: "Anglais",
        french: "Français",
        //Reset
        reset: "Réinitialiser",
        factory_reset: "Réinitialisation d'Usine",
        reset_initiated: "Réinitialisation démarrée",
        factory_reset_initiated: "Réinitialisation d'Usine démarrée",
        //Datasets
        available_datasets: "Jeux de Données Disponibles",
        no_datasets_available: "Aucun Jeu de Données disponible.",
        toggle_datasets: "Afficher les Jeux de Données",
        name: "Nom",
        date: "Date",
        latest_added: "Dernier Ajouté",
        latest_updated: "Dernière Mise à Jour",
        //Metadata
        metadata: "Métadonnées",
        unknown_city: "Ville Inconnue",
        description: "Description",
        format: "Format",
        processes: "Processus",
        dataset_source: "Source des Données",
        load_dataset: "Charger le Jeu de Données",
        n_a: "Indisponible",
        //Loading Dataset
        loading_dataset: "Chargement du jeu de données...",
        //Views
        views: "Vues",
        collapse: "Réduire",
        default_layer: "Calque par Défaut",
        topographical_layer: "Calque Topographique",
        satellite_layer: "Calque Satellite"
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
