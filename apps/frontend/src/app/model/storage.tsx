export class StorageServer {
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage`, error);
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage`, error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static setLanguage(lang: string): void {
    this.setItem('language', lang);
  }

  static getLanguage(): string {
    return this.getItem('language', 'en');
  }

  static setPlaybackSpeed(speed: number): void {
    this.setItem('playbackSpeed', speed);
  }

  static getPlaybackSpeed(): number {
    return this.getItem('playbackSpeed', 1);
  }

  static setSliderValue(value: number): void {
    this.setItem('sliderValue', value);
  }

  static getSliderValue(): number {
    return this.getItem('sliderValue', 0);
  }

  static setSelectedDatasetId(datasetId: string): void {
    this.setItem('selectedDatasetId', datasetId);
  }

  static getSelectedDatasetId(): string | null {
    return this.getItem('selectedDatasetId', null);
  }

  static setView(view: string): void {
    this.setItem('view', view);
  }

  static getView(): string | null {
    return this.getItem('view', null);
  }

  static resetDefaults(): void {
    this.setItem('language', 'en');
    this.setItem('playbackSpeed', 1);
    this.setItem('sliderValue', 0);
  }

  static factoryResetDefaults(): void {
    this.setItem('language', 'en');
    this.setItem('playbackSpeed', 1);
    this.setItem('sliderValue', 0);
    this.setItem('selectedDatasetId','');
  }
}
