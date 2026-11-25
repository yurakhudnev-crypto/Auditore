// Утилита для работы с конфигурацией приложения

export interface AppConfig {
  catalogUrl: string;
  googleForm: {
    url: string;
    entryIds: {
      firstName: string;
      lastName: string;
      className: string;
      songTitle: string;
      score: string;
      totalGaps: string;
      percentage: string;
      translations: string;
    };
  };
}

// Загрузка конфигурации из файла
export async function loadConfig(): Promise<AppConfig> {
  try {
    // Используем относительный путь для работы на GitHub Pages
    const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
    const configUrl = `${basePath}/config.json`;
    
    console.log('Loading config from:', configUrl);
    
    const response = await fetch(configUrl, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }
    const config = await response.json();
    console.log('Config loaded:', config);
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    // Возвращаем пустую конфигурацию по умолчанию
    return {
      catalogUrl: '',
      googleForm: {
        url: '',
        entryIds: {
          firstName: '',
          lastName: '',
          className: '',
          songTitle: '',
          score: '',
          totalGaps: '',
          percentage: '',
          translations: ''
        }
      }
    };
  }
}
