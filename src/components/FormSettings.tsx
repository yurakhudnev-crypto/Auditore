import { useState } from 'react';

interface Props {
  onBack: () => void;
}

const FormSettings = ({ onBack }: Props) => {
  const [formUrl, setFormUrl] = useState(() => {
    try {
      return localStorage.getItem('googleFormUrl') || '';
    } catch (error) {
      console.warn('Could not read from localStorage:', error);
      return '';
    }
  });
  
  const [formEntryIds, setFormEntryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('googleFormEntryIds');
      return saved ? JSON.parse(saved) : {
        firstName: '',
        lastName: '',
        className: '',
        songTitle: '',
        score: '',
        totalGaps: '',
        percentage: '',
        translations: ''
      };
    } catch (error) {
      console.warn('Could not read from localStorage:', error);
      return {
        firstName: '',
        lastName: '',
        className: '',
        songTitle: '',
        score: '',
        totalGaps: '',
        percentage: '',
        translations: ''
      };
    }
  });
  
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (formUrl.trim()) {
      // Создаём JSON для config.json
      const config = {
        catalogUrl: '', // Будет заполнено отдельно
        googleForm: {
          url: formUrl,
          entryIds: formEntryIds
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
    if (formUrl.trim()) {
      const testUrl = `${formUrl}?entry.${formEntryIds.firstName || 'test'}=Test`;
      window.open(testUrl, '_blank');
    } else {
      alert('Please enter a form URL first');
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
            GOOGLE FORM <span className="text-[#0066CC]">SETTINGS</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="ipod-card p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-2">
              RESULTS COLLECTION SETUP
            </h2>
            <p className="text-sm text-[#666666]">
              Configure Google Form to automatically collect student results
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">
                FORM URL
              </label>
              <input
                type="url"
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className="ipod-input w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest text-[#666666]">ENTRY IDs:</p>
              <p className="text-xs text-[#666666]">
                To find entry IDs: Open form → Get pre-filled form → Fill test data → Get link → Extract entry.XXXXX from URL
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">First Name</label>
                  <input
                    type="text"
                    value={formEntryIds.firstName}
                    onChange={e => setFormEntryIds({ ...formEntryIds, firstName: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Last Name</label>
                  <input
                    type="text"
                    value={formEntryIds.lastName}
                    onChange={e => setFormEntryIds({ ...formEntryIds, lastName: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Class</label>
                  <input
                    type="text"
                    value={formEntryIds.className}
                    onChange={e => setFormEntryIds({ ...formEntryIds, className: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Song Title</label>
                  <input
                    type="text"
                    value={formEntryIds.songTitle}
                    onChange={e => setFormEntryIds({ ...formEntryIds, songTitle: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Score</label>
                  <input
                    type="text"
                    value={formEntryIds.score}
                    onChange={e => setFormEntryIds({ ...formEntryIds, score: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Total Gaps</label>
                  <input
                    type="text"
                    value={formEntryIds.totalGaps}
                    onChange={e => setFormEntryIds({ ...formEntryIds, totalGaps: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Percentage</label>
                  <input
                    type="text"
                    value={formEntryIds.percentage}
                    onChange={e => setFormEntryIds({ ...formEntryIds, percentage: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666666]">Translations</label>
                  <input
                    type="text"
                    value={formEntryIds.translations}
                    onChange={e => setFormEntryIds({ ...formEntryIds, translations: e.target.value })}
                    placeholder="entry.123456789"
                    className="ipod-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={!formUrl.trim()}
                className="ipod-button-silver flex-1 rounded-lg py-3 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
              >
                TEST FORM
              </button>
              <button
                onClick={handleSave}
                disabled={!formUrl.trim()}
                className="ipod-button flex-1 rounded-lg py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
              >
                SAVE
              </button>
            </div>

            {saved && (
              <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-4 text-center">
                <p className="text-xs font-bold tracking-widest text-[#0066CC]">
                  GOOGLE FORM SETTINGS SAVED!
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border-2 border-[#1A1A1A] bg-[#F5F5F5] p-6">
            <h3 className="mb-3 font-bold text-[#1A1A1A]">HOW IT WORKS:</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[#666666]">
              <li>Create a Google Form with fields for student data</li>
              <li>Get the form URL and entry IDs for each field</li>
              <li>Configure the form settings above and click "SAVE"</li>
              <li>A <code className="rounded bg-white px-2 py-1 font-mono text-xs">config.json</code> file will be downloaded</li>
              <li>Upload this file to your GitHub repository (replace the existing one)</li>
              <li>Wait 1-2 minutes for GitHub Pages to update</li>
              <li>Students can now send results to your Google Form</li>
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

          <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-6">
            <h3 className="mb-3 font-bold text-[#0066CC]">DETAILED INSTRUCTIONS:</h3>
            <p className="text-sm text-[#666666] mb-3">
              See <strong>GOOGLE_FORMS_SETUP.md</strong> file for complete setup guide with screenshots and examples.
            </p>
            <a
              href="/GOOGLE_FORMS_SETUP.md"
              target="_blank"
              className="text-sm font-bold text-[#0066CC] hover:underline"
            >
              Open Setup Guide →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;
