import React, { useState, useEffect } from 'react';

export default function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('shortener-history');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shortener-history', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setLongUrl(url);
    if (url.length > 0 && !isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
    } else {
      setError('');
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
    } catch (_) {
      return false;
    }
    return true;
  };

  const shortenUrl = async () => {
    if (!longUrl || !isValidUrl(longUrl)) {
      setError('Please enter a valid URL.');
      return;
    }

    setError('');

    try {
      const response = await fetch("http://localhost:3000/shortUrls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({fullUrl: longUrl})
      })
      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();
      const newShortUrl = `http://localhost:3000/${data.shortUrl}`;
      setShortUrl(newShortUrl)

      setHistory(prevHistory => [{long: data.fullUrl, short: newShortUrl, clicks: data.clicks}, ...prevHistory])

      setLongUrl('')
    } catch (error) {
      console.error("Failed to shorten URL", error);
    }
  };

  const copyToClipboard = (text, type = 'result') => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    if (type === 'result') {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const deleteLink = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100 text-zinc-800 font-sans antialiased transition-colors duration-300">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 bg-white shadow-sm border-b border-zinc-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">🔗</span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-800">
              LinkShortener
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-5xl space-y-8">
          {/* URL Input Section */}
          <section className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-zinc-200 transition-all duration-300 ease-in-out">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-zinc-800">
              Shorten Your Long URL
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={longUrl}
                onChange={handleUrlChange}
                placeholder="Paste your long URL here..."
                className={`flex-grow p-4 rounded-xl text-lg bg-zinc-50 border-2 ${
                  error ? 'border-red-400' : 'border-zinc-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 ease-in-out placeholder-zinc-500 text-zinc-800`}
              />
              <button
                onClick={shortenUrl}
                className="w-full md:w-auto px-8 py-4 text-lg font-bold text-white rounded-xl shadow-lg
                         bg-gradient-to-r from-indigo-500 to-indigo-600
                         hover:from-indigo-600 hover:to-indigo-700
                         transform hover:scale-105 transition-all duration-200 ease-in-out
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                         disabled:opacity-50 disabled:from-indigo-500 disabled:to-indigo-600"
                disabled={!!error || !longUrl}
              >
                Shorten URL
              </button>
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-500 text-center animate-pulse">
                {error}
              </p>
            )}
          </section>

          {/* Result Section */}
          {shortUrl && (
            <section
              className="bg-white p-6 rounded-2xl shadow-lg border border-zinc-200
                       flex flex-col md:flex-row items-center justify-between
                       animate-fade-in-up transition-all duration-500 ease-in-out"
            >
              <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-zinc-500 font-medium">Your Shortened URL:</p>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  {shortUrl}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(shortUrl)}
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-md
                         bg-indigo-600 hover:bg-indigo-700
                         transform hover:scale-105 transition-all duration-200 ease-in-out"
              >
                {copyStatus}
              </button>
            </section>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zinc-800">Link History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 text-sm text-red-600 font-semibold border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 text-sm font-semibold uppercase tracking-wide">
                      <th className="p-4 rounded-tl-lg">Original Link</th>
                      <th className="p-4 hidden sm:table-cell">Short Link</th>
                      <th className="p-4 hidden md:table-cell">Clicks</th>
                      <th className="p-4 rounded-tr-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((link, index) => (
                      <tr
                        key={index}
                        className="border-t border-zinc-200 hover:bg-zinc-100 transition-colors duration-150"
                      >
                        <td className="p-4 align-top">
                          <p className="text-sm text-zinc-500 break-all">{link.long}</p>
                        </td>
                        <td className="p-4 align-top hidden sm:table-cell">
                          <a
                            href={link.short}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 break-all"
                          >
                            {link.short}
                          </a>
                        </td>
                        <td className="p-4 align-top hidden md:table-cell">
                          <span className="text-base font-medium text-zinc-700">{link.clicks}</span>
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => copyToClipboard(link.short)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => deleteLink(index)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-sm text-zinc-500 border-t border-zinc-200">
        &copy; 2024 LinkShortener. All rights reserved.
      </footer>
    </div>
  );
}
