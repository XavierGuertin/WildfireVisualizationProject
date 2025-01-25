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
        language_saved_error: "Language has not been saved.",
        speed_saved:"Speed has been saved successfully.",
        speed_saved_error:"Speed has not been saved.",
        api_endpoint_saved: "API Endpoint Successfully Saved",
        //Language
        english: "English",
        french: "French",
        //Reset
        reset: "Reset",
        confirm_reset_data_from_endpoint: "Collections in the database will be deleted. You will then be prompted to enter the endpoint to fetch new collections. \nDo you want to proceed?",
        confirm_factory_reset_data_from_endpoint: "All data,  simulation configurations, and configurations files will be deleted. You will then be prompted to enter the endpoint to fetch new collections. \nDo you want to proceed?",
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
        satellite_layer: "Satellite Layer",
        //Decisions
        yes: "Yes",
        no: "No"
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
        language_saved_error: "La langue n'a pas été enregistrée.",
        speed_saved:"La vitesse a été enregistrée avec succès.",
        speed_saved_error:"La vitesse n'a pas été enregistrée.",
        api_endpoint_saved: "Point d'API enregistré avec succès",
        //Language
        english: "Anglais",
        french: "Français",
        //Reset
        reset: "Réinitialiser",
        confirm_reset_data_from_endpoint: "Les collections dans la base de données seront supprimées. Vous serez ensuite invité à entrer l'endpoint pour récupérer de nouvelles collections. \nVoulez-vous continuer?",
        confirm_factory_reset_data_from_endpoint: "Toutes les données, configurations de simulation et fichiers de configuration seront supprimés. Vous serez ensuite invité à entrer l'endpoint pour récupérer de nouvelles collections. \nVoulez-vous continuer ?",
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
        satellite_layer: "Calque Satellite",
        //Decisions
        yes: "Oui",
        no: "Non"
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
