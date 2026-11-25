import { useState } from 'react';

interface Props {
  onBack: () => void;
}

const CatalogSettings = ({ onBack }: Props) => {
  const [catalogUrl, setCatalogUrl] = useState(() => {
    try {
      return localStorage.getItem('catalogUrl') || '';
    } catch (error) {
      console.warn('Could not read from localStorage:', error);
      return '';
    }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (catalogUrl.trim()) {
      // Создаём JSON для config.json
      const config = {
        catalogUrl: catalogUrl,
        googleForm: {
          url: '', // Будет заполнено отдельно
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
      
      // Скачиваем файл config.json
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleTest = () => {
    if (catalogUrl.trim()) {
      window.open(catalogUrl, '_blank');
    } else {
      alert('Please enter a catalog URL first');
    }
  };

  return (
    <div className="min-h-screen ipod-metal">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
            <span className="transition-transform">←</span>
            BACK
          </button>
          <div className="h-6 w-px bg-[#B0B0B0]"></div>
          <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
            CATALOG <span className="text-[#0066CC]">SETTINGS</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="ipod-card p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-2">
              CLOUD STORAGE SETUP
            </h2>
            <p className="text-sm text-[#666666]">
              Set up a link to your cloud storage folder where you store JSON song files
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">
                CLOUD FOLDER URL
              </label>
              <input
                type="url"
                value={catalogUrl}
                onChange={e => setCatalogUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="ipod-input w-full rounded-lg px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-[#666666]">
                Examples:
              </p>
              <ul className="mt-1 space-y-1 text-xs text-[#666666]">
                <li>• Google Drive: https://drive.google.com/drive/folders/YOUR_FOLDER_ID</li>
                <li>• Dropbox: https://www.dropbox.com/sh/YOUR_FOLDER_ID</li>
                <li>• OneDrive: https://onedrive.live.com/?id=YOUR_FOLDER_ID</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={!catalogUrl.trim()}
                className="ipod-button-silver flex-1 rounded-lg py-3 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
              >
                TEST LINK
              </button>
              <button
                onClick={handleSave}
                disabled={!catalogUrl.trim()}
                className="ipod-button flex-1 rounded-lg py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
              >
                SAVE
              </button>
            </div>

            {saved && (
              <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-4 text-center">
                <p className="text-xs font-bold tracking-widest text-[#0066CC]">
                  CATALOG URL SAVED!
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border-2 border-[#1A1A1A] bg-[#F5F5F5] p-6">
            <h3 className="mb-3 font-bold text-[#1A1A1A]">HOW IT WORKS:</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[#666666]">
              <li>Upload your JSON song files to a cloud folder (Google Drive, Dropbox, etc.)</li>
              <li>Make sure the folder is accessible (public or shared link)</li>
              <li>Copy the folder URL and paste it above</li>
              <li>Click "SAVE" - a <code className="rounded bg-white px-2 py-1 font-mono text-xs">config.json</code> file will be downloaded</li>
              <li>Upload this file to your GitHub repository (replace the existing one)</li>
              <li>Wait 1-2 minutes for GitHub Pages to update</li>
              <li>Students will see a "CATALOG" button that opens this folder</li>
            </ol>
          </div>

          <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-6">
            <h3 className="mb-3 font-bold text-[#0066CC]">IMPORTANT:</h3>
            <p className="text-sm text-[#666666] mb-3">
              Settings are stored in <code className="rounded bg-white px-2 py-1 font-mono text-xs">config.json</code> file on GitHub. 
              This means all students will see the same settings on any device.
            </p>
            <p className="text-sm text-[#666666]">
              After saving, don't forget to upload the downloaded <code className="rounded bg-white px-2 py-1 font-mono text-xs">config.json</code> file to your GitHub repository!
            </p>
          </div>

          <div className="rounded-lg border-2 border-[#9333EA] bg-[#9333EA]/10 p-6">
            <h3 className="mb-3 font-bold text-[#9333EA]">GOOGLE DRIVE SETUP:</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[#666666]">
              <li>Create a folder in Google Drive</li>
              <li>Upload your JSON song files to this folder</li>
              <li>Right-click the folder → "Share" → "Get link"</li>
              <li>Change access to "Anyone with the link"</li>
              <li>Copy the link and paste it above</li>
            </ol>
            <p className="mt-3 text-xs text-[#9333EA]">
              💡 Tip: You can organize songs in subfolders if needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSettings;
