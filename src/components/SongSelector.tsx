import { useState, useEffect } from 'react';
import { loadConfig } from '../utils/config';

interface Props {
  onSelectSong: (songFile: any) => void;
}

const SongSelector = ({ onSelectSong }: Props) => {
  const [catalogUrl, setCatalogUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем конфигурацию при монтировании компонента
    loadConfig().then(config => {
      console.log('Catalog config loaded:', config.catalogUrl);
      setCatalogUrl(config.catalogUrl);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to load catalog config:', error);
      setLoading(false);
    });
  }, []);

  const handleOpenCatalog = () => {
    if (!catalogUrl) {
      alert('Catalog URL is not configured. Please ask your teacher to set it up.');
      return;
    }
    
    // Используем <a> тег вместо window.open для мобильной совместимости
    const link = document.createElement('a');
    link.href = catalogUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const songFile = JSON.parse(event.target?.result as string);
        onSelectSong(songFile);
      } catch (error) {
        alert('Error reading file. Please make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Каталог */}
      <div className="ipod-card p-6">
        <h3 className="mb-4 text-lg font-bold tracking-tight text-[#1A1A1A]">
          SONG CATALOG
        </h3>
        <p className="mb-4 text-sm text-[#666666]">
          Browse available songs from your teacher's cloud storage
        </p>
        <button
          onClick={handleOpenCatalog}
          disabled={loading || !catalogUrl}
          className="ipod-button w-full rounded-lg py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
        >
          {loading ? 'LOADING...' : catalogUrl ? 'OPEN CATALOG' : 'CATALOG NOT CONFIGURED'}
        </button>
        {!loading && catalogUrl && (
          <p className="mt-3 text-xs text-[#666666]">
            💡 Download a JSON file from the catalog, then upload it below
          </p>
        )}
        {!loading && !catalogUrl && (
          <p className="mt-3 text-xs text-[#dc2626]">
            ⚠️ Catalog URL is not configured. Please ask your teacher to set it up.
          </p>
        )}
      </div>

      {/* Загрузка файла */}
      <div className="ipod-card p-6">
        <h3 className="mb-4 text-lg font-bold tracking-tight text-[#1A1A1A]">
          UPLOAD SONG FILE
        </h3>
        <p className="mb-4 text-sm text-[#666666]">
          Upload a JSON file you downloaded from the catalog
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-student"
        />
        <label
          htmlFor="file-upload-student"
          className="ipod-button inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          UPLOAD JSON FILE
        </label>
      </div>
    </div>
  );
};

export default SongSelector;
