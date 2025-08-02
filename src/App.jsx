import React, { useState, useEffect, useMemo } from 'react';

// Helper function to generate a slug from a title
const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
    
// Helper function to strip HTML tags for clean text
const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, email: 'mlebay32@gmail.com', password: 'superadminpassword', role: 'superadmin', apiKey: 'supersecret-key-12345', mustChangePassword: true, webhooks: [{id: 1, url: 'https://hooks.zapier.com/12345/abcde'}] },
  { id: 2, email: 'admin@gandex.com', password: 'password123', role: 'admin', apiKey: 'admin-key-67890', mustChangePassword: false, webhooks: [] },
  { id: 3, email: 'user@example.com', password: 'password123', role: 'user', apiKey: null, mustChangePassword: false, webhooks: [] },
  { id: 4, email: 'new-applicant@gandex.com', password: 'password123', role: 'pending', apiKey: null, mustChangePassword: false, webhooks: [] },
  { id: 5, email: 'another-applicant@gandex.com', password: 'password123', role: 'pending', apiKey: null, mustChangePassword: false, webhooks: [] },
];

const initialArticles = [
  {
    id: 1,
    slug: 'revolusi-ai-mengubah-dunia-kerja',
    title: 'Revolusi AI: Bagaimana Kecerdasan Buatan Mengubah Dunia Kerja',
    author: 'Admin Ganteng',
    date: '2024-07-28',
    thumbnail: 'https://placehold.co/800x400/1a202c/ffffff?text=AI+Revolution',
    category: 'Teknologi',
    tags: ['AI', 'Pekerjaan', 'Masa Depan'],
    content: `
      <p>Kecerdasan buatan (AI) tidak lagi menjadi konsep fiksi ilmiah. Dalam beberapa tahun terakhir, AI telah berkembang pesat dan mulai meresap ke dalam berbagai aspek kehidupan kita, termasuk dunia kerja. Dari otomatisasi tugas-tugas rutin hingga analisis data yang kompleks, AI menjanjikan efisiensi dan inovasi yang belum pernah terjadi sebelumnya.</p>
      <p>Banyak yang khawatir bahwa AI akan menggantikan pekerjaan manusia. Meskipun beberapa peran mungkin terotomatisasi, banyak ahli percaya bahwa AI akan lebih berfungsi sebagai alat yang memberdayakan manusia, bukan menggantikannya. Keterampilan baru seperti rekayasa prompt, analisis data yang didukung AI, dan manajemen sistem cerdas akan menjadi semakin penting.</p>
      <img src="https://placehold.co/600x300/718096/ffffff?text=Future+of+Work" alt="Future of Work" class="my-4 rounded-lg shadow-md" />
      <p>Perusahaan di seluruh dunia berlomba-lomba mengadopsi teknologi AI untuk tetap kompetitif. Ini menciptakan permintaan besar akan talenta yang memahami cara kerja AI dan dapat mengintegrasikannya ke dalam strategi bisnis. Oleh karena itu, investasi dalam pendidikan dan pelatihan ulang menjadi kunci untuk menavigasi pergeseran ini.</p>
    `,
  },
  {
    id: 2,
    slug: 'panduan-memulai-investasi-untuk-pemula',
    title: 'Panduan Memulai Investasi untuk Pemula di Tahun 2024',
    author: 'Super Admin',
    date: '2024-07-25',
    thumbnail: 'https://placehold.co/800x400/4a5568/ffffff?text=Investment+Guide',
    category: 'Keuangan',
    tags: ['Investasi', 'Saham', 'Pemula'],
    content: `
      <p>Memulai investasi bisa terasa menakutkan, tetapi dengan pengetahuan yang tepat, siapa pun bisa melakukannya. Kunci utamanya adalah memulai dari yang kecil dan konsisten. Jangan menunggu memiliki banyak uang untuk berinvestasi; mulailah dengan apa yang Anda miliki sekarang.</p>
      <h3>Langkah-langkah Memulai:</h3>
      <ul>
        <li><strong>Tentukan Tujuan Keuangan:</strong> Apa yang ingin Anda capai dengan berinvestasi? Dana pensiun, membeli rumah, atau pendidikan anak?</li>
        <li><strong>Pahami Profil Risiko:</strong> Seberapa besar toleransi Anda terhadap fluktuasi pasar? Ini akan menentukan jenis instrumen investasi yang cocok untuk Anda.</li>
        <li><strong>Diversifikasi Portofolio:</strong> Jangan menaruh semua telur dalam satu keranjang. Sebarkan investasi Anda di berbagai aset seperti saham, obligasi, dan reksa dana.</li>
      </ul>
    `,
  },
    {
    id: 3,
    slug: 'menjelajahi-keindahan-tersembunyi-indonesia',
    title: 'Menjelajahi Keindahan Tersembunyi di Pelosok Indonesia',
    author: 'Admin Ganteng',
    date: '2024-07-22',
    thumbnail: 'https://placehold.co/800x400/2c5282/ffffff?text=Hidden+Indonesia',
    category: 'Travel',
    tags: ['Wisata', 'Indonesia', 'Alam'],
    content: `<p>Indonesia bukan hanya Bali dan Lombok. Ribuan pulau lainnya menyimpan surga tersembunyi yang menunggu untuk dijelajahi. Dari keindahan bawah laut di Raja Ampat hingga budaya unik di Tana Toraja, setiap sudut nusantara menawarkan pengalaman yang tak terlupakan.</p><p>Perjalanan ke destinasi yang kurang populer tidak hanya memberikan petualangan yang otentik tetapi juga membantu perekonomian lokal. Jadi, saat merencanakan liburan berikutnya, cobalah untuk melihat melampaui tujuan wisata yang sudah ramai.</p>`,
  },
];

// --- ICON COMPONENTS (Inline SVG for portability) ---
const Icon = ({ name, className }) => {
  const icons = {
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    sun: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
    moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    articles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />,
    ads: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 4.99h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 3v4" />,
    key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.64 5.84l-4.24 4.242-1.415-1.414 4.242-4.242A6 6 0 0117 9z" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M16 17v4m-2-2h4M13.5 5.5l1-1M18.5 10.5l1-1M10.5 18.5l-1 1M5.5 13.5l-1 1M12 2v2m0 16v2m-7-9H3m18 0h-2" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    cloud: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />,
    webhook: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    robot: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3.046a9 9 0 0111.954 0M12 6v6m-6 6h12M4 10a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />,
    settings: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
  };
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icons[name]}</svg>;
};

// --- UI COMPONENTS ---

const Toast = ({ message, type, onDismiss }) => {
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white transition-all duration-300 transform z-50";
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
      <button onClick={onDismiss} className="ml-4 font-bold">X</button>
    </div>
  );
};

const Modal = ({ title, children, onConfirm, onCancel, confirmText = "Confirm", confirmClass = "bg-red-600 hover:bg-red-700" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="text-gray-700 dark:text-gray-300 mb-6">{children}</div>
      <div className="flex justify-end space-x-4">
        {onCancel && <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Batal</button>}
        {onConfirm && <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-white transition-colors ${confirmClass}`}>{confirmText}</button>}
      </div>
    </div>
  </div>
);


const Header = ({ currentUser, onLogout, onNavigate, onToggleTheme, isDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => onNavigate('home')}>
          The Gandex Post
        </h1>
        <div className="hidden md:flex items-center space-x-4">
          <nav className="space-x-4">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Home</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Teknologi</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Keuangan</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Travel</a>
          </nav>
          <button onClick={onToggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-5 h-5" />
          </button>
          {currentUser ? (
            <>
              { (currentUser.role === 'admin' || currentUser.role === 'superadmin') &&
                <button onClick={() => onNavigate('admin')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Admin Panel</button>
              }
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Logout</button>
            </>
          ) : (
            <button onClick={() => onNavigate('login')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</button>
          )}
        </div>
        <div className="md:hidden flex items-center">
            <button onClick={onToggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-5 h-5" />
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300">
                <Icon name={isMenuOpen ? 'x' : 'menu'} className="w-6 h-6" />
            </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <nav className="flex flex-col p-4 space-y-2">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); setIsMenuOpen(false); }} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Home</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Teknologi</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Keuangan</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Travel</a>
             {currentUser ? (
                <>
                  { (currentUser.role === 'admin' || currentUser.role === 'superadmin') &&
                    <button onClick={() => {onNavigate('admin'); setIsMenuOpen(false);}} className="w-full text-left px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Admin Panel</button>
                  }
                  <button onClick={() => {onLogout(); setIsMenuOpen(false);}} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Logout</button>
                </>
              ) : (
                <button onClick={() => {onNavigate('login'); setIsMenuOpen(false);}} className="w-full text-left px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</button>
              )}
          </nav>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white mt-auto">
    <div className="container mx-auto px-4 py-6 text-center">
      <p>&copy; {new Date().getFullYear()} The Gandex Post. All rights reserved.</p>
      <p className="text-sm text-gray-400">A modern publication for the modern reader.</p>
    </div>
  </footer>
);

// --- PAGES ---

const HomePage = ({ articles, onNavigate, ads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? article.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, filterCategory]);

  const categories = [...new Set(articles.map(a => a.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">Artikel Terbaru</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Wawasan terkini seputar teknologi, keuangan, dan travel.</p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <img src={article.thumbnail} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <span className="text-sm text-blue-500 dark:text-blue-400 font-semibold">{article.category}</span>
              <h3 className="text-xl font-bold mt-2 mb-2 text-gray-900 dark:text-white">{article.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Oleh {article.author} &bull; {article.date}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">{tag}</span>)}
              </div>
              <button onClick={() => onNavigate('article', { slug: article.slug })} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Baca Selengkapnya &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArticleDetailPage = ({ slug, articles, ads, showToast, apiKeys }) => {
  const article = articles.find(a => a.slug === slug);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const activeApiKey = apiKeys.gemini || apiKeys.openai || apiKeys.openrouter || apiKeys.other;

  if (!article) {
    return <div className="container mx-auto px-4 py-8 text-center">Artikel tidak ditemukan.</div>;
  }
  
  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    const textContent = stripHtml(article.content);
    const prompt = `Ringkas artikel berikut dalam 3 sampai 4 kalimat utama. Jaga agar tetap informatif dan mudah dipahami:\n\n---\n\n${textContent}`;
    
    try {
        const text = await callGeminiApi(prompt, activeApiKey);
        setSummary(text);
    } catch (error) {
        console.error("Gemini API call failed:", error);
        showToast(error.message, "error");
    } finally {
        setIsSummarizing(false);
    }
  };

  const contentParts = article.content.split('</p>');
  const middleIndex = Math.floor(contentParts.length / 2);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{article.title}</h1>
        <div className="text-gray-500 dark:text-gray-400 mb-6 flex justify-between items-center">
          <div>
            <span>By {article.author}</span> &bull; <span>{article.date}</span> &bull; <span className="text-blue-500">{article.category}</span>
          </div>
          <button onClick={handleSummarize} disabled={isSummarizing || !activeApiKey} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed" title={!activeApiKey ? "Masukkan API Key di Admin Panel untuk menggunakan fitur ini" : ""}>
            <Icon name="sparkles" className="w-4 h-4" />
            <span>{isSummarizing ? 'Meringkas...' : 'Ringkas Artikel'}</span>
          </button>
        </div>

        {summary && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-gray-700/50 border-l-4 border-blue-500 rounded-r-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Ringkasan AI</h4>
                <p className="text-gray-700 dark:text-gray-300">{summary}</p>
            </div>
        )}

        <img src={article.thumbnail} alt={article.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-8 shadow-md" />
        
        {ads.top && <div className="my-6 p-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-center text-gray-500" dangerouslySetInnerHTML={{ __html: `<!-- Ad Slot: Top --> ${ads.top}` }}></div>}

        <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-gray-800 dark:text-gray-300">
          {contentParts.map((part, index) => (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: part + (index < contentParts.length - 1 ? '</p>' : '') }} />
              {index === middleIndex && ads.middle && <div className="my-6 p-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-center text-gray-500" dangerouslySetInnerHTML={{ __html: `<!-- Ad Slot: Middle --> ${ads.middle}` }}></div>}
            </React.Fragment>
          ))}
        </div>

        {ads.bottom && <div className="my-6 p-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-center text-gray-500" dangerouslySetInnerHTML={{ __html: `<!-- Ad Slot: Bottom --> ${ads.bottom}` }}></div>}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-bold mb-2 text-gray-900 dark:text-white">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => <span key={tag} className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">{tag}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Admin Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Login
          </button>
        </form>
         <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Ingin menjadi penulis? <a href="mailto:mlebay32@gmail.com" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Hubungi kami</a>.
        </p>
      </div>
    </div>
  );
};

// --- Gemini API Call Function ---
const callGeminiApi = async (prompt, apiKey) => {
    if (!apiKey) {
        throw new Error("API Key tidak tersedia. Silakan masukkan API Key di menu Manajemen AI.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error Response:", errorBody);
        throw new Error(errorBody.error.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
    } else {
        console.warn("Unexpected Gemini API response structure:", data);
        if (data.promptFeedback && data.promptFeedback.blockReason) {
             throw new Error(`Permintaan diblokir: ${data.promptFeedback.blockReason}`);
        }
        throw new Error("Struktur respons dari API tidak valid atau kosong.");
    }
};

// --- ADMIN PANEL COMPONENTS ---

const TrafficChart = () => {
    const data = [
        { name: 'Sen', visitors: 120 }, { name: 'Sel', visitors: 190 },
        { name: 'Rab', visitors: 150 }, { name: 'Kam', visitors: 220 },
        { name: 'Jum', visitors: 300 }, { name: 'Sab', visitors: 250 },
        { name: 'Min', visitors: 280 },
    ];
    const maxVisitors = Math.max(...data.map(d => d.visitors));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Trafik Pengunjung Minggu Ini</h3>
            <div className="flex justify-between items-end h-64 space-x-2">
                {data.map(item => (
                    <div key={item.name} className="flex-1 flex flex-col items-center justify-end">
                        <div 
                            className="w-full bg-blue-400 dark:bg-blue-500 rounded-t-md transition-all duration-500"
                            style={{ height: `${(item.visitors / maxVisitors) * 100}%` }}
                            title={`${item.visitors} pengunjung`}
                        ></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = ({ articles, users }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Artikel</h3>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Pengguna</h3>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{users.length}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Permintaan Admin</h3>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role === 'pending').length}</p>
      </div>
    </div>
    <TrafficChart />
  </div>
);

const AdminArticles = ({ articles, setArticles, showToast, apiKeys }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleDelete = (article) => {
    setShowDeleteModal(article);
  };
  
  const confirmDelete = () => {
    setArticles(articles.filter(a => a.id !== showDeleteModal.id));
    setShowDeleteModal(null);
    showToast("Artikel berhasil dihapus.", "success");
  };

  const handleSave = (articleData) => {
    if (editingArticle) {
      setArticles(articles.map(a => a.id === editingArticle.id ? { ...a, ...articleData } : a));
      showToast("Artikel berhasil diperbarui.", "success");
    } else {
      const newArticle = { 
        id: Date.now(), 
        slug: slugify(articleData.title),
        date: new Date().toISOString().split('T')[0],
        author: 'Current Admin', // This would be dynamic
        ...articleData 
      };
      setArticles([newArticle, ...articles]);
      showToast("Artikel baru berhasil dibuat.", "success");
    }
    setShowForm(false);
    setEditingArticle(null);
  };

  if (showForm) {
    return <ArticleForm article={editingArticle} onSave={handleSave} onCancel={() => setShowForm(false)} showToast={showToast} apiKeys={apiKeys} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Artikel</h2>
        <button onClick={handleNew} className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Artikel Baru
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Judul</th>
              <th scope="col" className="px-6 py-3">Kategori</th>
              <th scope="col" className="px-6 py-3">Penulis</th>
              <th scope="col" className="px-6 py-3">Tanggal</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{article.title}</td>
                <td className="px-6 py-4">{article.category}</td>
                <td className="px-6 py-4">{article.author}</td>
                <td className="px-6 py-4">{article.date}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(article)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Icon name="edit" className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(article)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Icon name="trash" className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDeleteModal && (
        <Modal
          title="Hapus Artikel"
          onCancel={() => setShowDeleteModal(null)}
          onConfirm={confirmDelete}
          confirmText="Ya, Hapus"
        >
          <p>Apakah Anda yakin ingin menghapus artikel berjudul "<strong>{showDeleteModal.title}</strong>"? Tindakan ini tidak dapat dibatalkan.</p>
        </Modal>
      )}
    </div>
  );
};

const ArticleForm = ({ article, onSave, onCancel, showToast, apiKeys }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [category, setCategory] = useState(article?.category || '');
  const [tags, setTags] = useState(article?.tags?.join(', ') || '');
  const [thumbnail, setThumbnail] = useState(article?.thumbnail || 'https://placehold.co/800x400/cccccc/ffffff?text=Upload+Thumbnail');
  
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [contentPrompt, setContentPrompt] = useState('');
  const [titleIdeas, setTitleIdeas] = useState([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  
  const activeApiKey = apiKeys.gemini || apiKeys.openai || apiKeys.openrouter || apiKeys.other;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnail(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleGenerateContent = async () => {
      if (!contentPrompt) {
          showToast("Silakan masukkan topik untuk konten.", "error");
          return;
      }
      setIsGeneratingContent(true);
      const prompt = `Anda adalah seorang penulis artikel yang handal. Buatkan draf artikel yang menarik dan informatif tentang topik berikut: "${contentPrompt}". Draf harus ditulis dalam format HTML, lengkap dengan paragraf (<p>), judul bagian (<h3>), dan daftar (<ul><li>) jika relevan. Jaga agar gaya bahasanya engaging.`;
      try {
          const generatedContent = await callGeminiApi(prompt, activeApiKey);
          setContent(generatedContent);
          showToast("Konten berhasil dibuat oleh AI!", "success");
      } catch (error) {
          console.error("Content generation failed:", error);
          showToast(error.message, "error");
      } finally {
          setIsGeneratingContent(false);
      }
  };
  
  const handleGenerateTitles = async () => {
      const textContent = stripHtml(content);
      if (textContent.length < 50) {
          showToast("Konten terlalu pendek untuk dibuatkan judul.", "error");
          return;
      }
      setIsGeneratingTitles(true);
      const prompt = `Berikan 5 alternatif judul yang menarik dan SEO-friendly untuk artikel berikut. Jawab hanya dengan daftar judul, di mana setiap judul berada di baris baru, tanpa nomor atau bullet point.\n\n---\n\n${textContent}`;
      try {
          const result = await callGeminiApi(prompt, activeApiKey);
          setTitleIdeas(result.split('\n').filter(t => t.trim() !== ''));
          setShowTitleModal(true);
      } catch (error) {
          console.error("Title generation failed:", error);
          showToast(error.message, "error");
      } finally {
          setIsGeneratingTitles(false);
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content, category, tags: tags.split(',').map(t => t.trim()), thumbnail });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{article ? 'Edit Artikel' : 'Artikel Baru'}</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul</label>
        <div className="flex items-center space-x-2">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 input-style" required />
            <button type="button" onClick={handleGenerateTitles} disabled={isGeneratingTitles || !activeApiKey} className="mt-1 px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" title={!activeApiKey ? "Masukkan API Key untuk menggunakan fitur ini" : "Cari Ide Judul"}>
                <Icon name="sparkles" className="w-5 h-5"/>
            </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konten (WYSIWYG simulation - use HTML)</label>
        <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-md my-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">✨ Buat Konten dengan AI</label>
            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    value={contentPrompt} 
                    onChange={e => setContentPrompt(e.target.value)} 
                    placeholder="Tulis topik di sini, cth: 'dampak 5G di Indonesia'" 
                    className="w-full input-style"
                />
                <button type="button" onClick={handleGenerateContent} disabled={isGeneratingContent || !activeApiKey} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGeneratingContent ? 'Membuat...' : 'Buat'}
                </button>
            </div>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows="15" className="w-full mt-1 input-style font-mono" placeholder="<p>Konten artikel akan muncul di sini...</p>"></textarea>
      </div>

      <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
          <div className="mt-1 flex items-center space-x-4">
              <img src={thumbnail} alt="Preview" className="w-48 h-24 object-cover rounded-md border bg-gray-100 dark:bg-gray-700 dark:border-gray-600"/>
              <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>Ganti Gambar</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
              </label>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 input-style" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (pisahkan dengan koma)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full mt-1 input-style" />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
      </div>

      {showTitleModal && (
        <Modal
            title="✨ Ide Judul dari AI"
            onCancel={() => setShowTitleModal(false)}
            confirmText="Tutup"
            onConfirm={() => setShowTitleModal(false)}
            confirmClass="bg-blue-600 hover:bg-blue-700"
        >
            <p className="mb-4">Pilih salah satu judul di bawah ini atau gunakan sebagai inspirasi.</p>
            <div className="space-y-2">
                {titleIdeas.map((idea, index) => (
                    <div key={index} onClick={() => {setTitle(idea); setShowTitleModal(false);}} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                        {idea}
                    </div>
                ))}
            </div>
        </Modal>
      )}
    </form>
  );
};

const AdminUsers = ({ users, setUsers, showToast, currentUser }) => {
  const [filter, setFilter] = useState('all'); // 'all' or 'pending'

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    showToast(`Peran untuk pengguna #${userId} berhasil diubah menjadi ${newRole}.`, "success");
  };

  const handlePasswordReset = (userEmail) => {
    console.log(`Password reset initiated for ${userEmail}`);
    showToast(`Email reset password (simulasi) telah dikirim ke ${userEmail}.`, "info");
  };

  const filteredUsers = users.filter(user => filter === 'pending' ? user.role === 'pending' : true);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h2>
        <div className="flex space-x-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>Semua</button>
            <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm rounded-md ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}>
                Permintaan <span className="ml-1 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">{users.filter(u=>u.role==='pending').length}</span>
            </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Peran</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    user.role === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {currentUser.role === 'superadmin' && user.role === 'pending' && (
                    <>
                      <button onClick={() => handleRoleChange(user.id, 'admin')} className="px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700">Setujui</button>
                      <button onClick={() => handleRoleChange(user.id, 'user')} className="px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700">Tolak</button>
                    </>
                  )}
                   {currentUser.role === 'superadmin' && user.role === 'admin' && (
                    <button onClick={() => handleRoleChange(user.id, 'user')} className="px-3 py-1 text-xs text-white bg-yellow-600 rounded-md hover:bg-yellow-700">Cabut Akses</button>
                  )}
                   {currentUser.role === 'superadmin' && user.role !== 'superadmin' && (
                    <button onClick={() => handlePasswordReset(user.email)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Reset Password</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminAds = ({ ads, setAds, showToast }) => {
  const [topAd, setTopAd] = useState(ads.top || '');
  const [middleAd, setMiddleAd] = useState(ads.middle || '');
  const [bottomAd, setBottomAd] = useState(ads.bottom || '');
  
  const handleSave = () => {
    setAds({ ...ads, top: topAd, middle: middleAd, bottom: bottomAd });
    showToast("Kode iklan berhasil disimpan.", "success");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrasi Iklan</h2>
      <p className="text-gray-600 dark:text-gray-400">Sisipkan kode HTML/JavaScript dari AdSense atau platform iklan lainnya di sini.</p>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Iklan Atas Artikel</label>
        <textarea value={topAd} onChange={e => setTopAd(e.target.value)} rows="4" className="w-full mt-1 input-style font-mono" placeholder="<!-- Kode iklan di sini -->"></textarea>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Iklan Tengah Artikel</label>
        <textarea value={middleAd} onChange={e => setMiddleAd(e.target.value)} rows="4" className="w-full mt-1 input-style font-mono" placeholder="<!-- Kode iklan di sini -->"></textarea>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Iklan Bawah Artikel</label>
        <textarea value={bottomAd} onChange={e => setBottomAd(e.target.value)} rows="4" className="w-full mt-1 input-style font-mono" placeholder="<!-- Kode iklan di sini -->"></textarea>
      </div>
      
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Simpan Semua Iklan</button>
      </div>
    </div>
  );
};

const AdminApiWebhooks = ({ currentUser, onUpdateUser, showToast }) => {
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [webhookToDelete, setWebhookToDelete] = useState(null);

  const generateNewKey = () => {
    const newKey = 'gandex-key-' + Math.random().toString(36).substr(2, 16);
    onUpdateUser({ ...currentUser, apiKey: newKey });
    showToast("API Key baru berhasil dibuat!", "success");
  };
  
  const handleAddWebhook = (e) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    const newWebhook = { id: Date.now(), url: newWebhookUrl };
    const updatedWebhooks = [...(currentUser.webhooks || []), newWebhook];
    onUpdateUser({ ...currentUser, webhooks: updatedWebhooks });
    showToast("Webhook berhasil ditambahkan.", "success");
    setNewWebhookUrl('');
  };

  const handleDeleteWebhook = () => {
    const updatedWebhooks = currentUser.webhooks.filter(wh => wh.id !== webhookToDelete.id);
    onUpdateUser({ ...currentUser, webhooks: updatedWebhooks });
    showToast("Webhook berhasil dihapus.", "success");
    setWebhookToDelete(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Disalin ke clipboard.", "info");
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">API & Webhooks</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">API Key Publik</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gunakan key ini untuk otentikasi saat mengakses API The Gandex Post dari aplikasi eksternal.</p>
        {currentUser.apiKey ? (
          <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm text-gray-800 dark:text-gray-200 flex-grow">{currentUser.apiKey}</code>
            <button onClick={() => copyToClipboard(currentUser.apiKey)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Salin</button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Anda belum memiliki API Key.</p>
        )}
        <button onClick={generateNewKey} className="mt-4 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
          {currentUser.apiKey ? 'Buat Ulang API Key' : 'Buat API Key Baru'}
        </button>
      </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Panduan Penggunaan API</h3>
        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
            <p>API The Gandex Post memungkinkan Anda untuk mengambil data artikel secara terprogram untuk digunakan di aplikasi atau layanan lain. Semua permintaan harus menyertakan API Key Anda sebagai Bearer Token di header Authorization.</p>
            <h4>Endpoint Utama</h4>
            <ul>
                <li><code>GET /api/articles</code>: Mengambil daftar semua artikel.</li>
                <li><code>GET /api/articles/:slug</code>: Mengambil detail satu artikel berdasarkan slug-nya.</li>
            </ul>
            <h4>Contoh Penggunaan (cURL)</h4>
            <p>Berikut adalah contoh cara mengambil semua artikel menggunakan cURL:</p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm overflow-x-auto"><code>
                {`curl -X GET "https://api.gandex.post/v1/articles" \\
-H "Authorization: Bearer ${currentUser.apiKey || 'YOUR_API_KEY'}"`}
            </code></pre>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Webhooks</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tambahkan URL endpoint untuk menerima notifikasi (event `article_published`) saat ada artikel baru dipublikasikan.</p>
        <form onSubmit={handleAddWebhook} className="flex items-center space-x-2 mb-4">
            <input 
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full mt-1 input-style"
                required
            />
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shrink-0">Tambah</button>
        </form>
        <div className="space-y-2">
            {(currentUser.webhooks || []).map(wh => (
                <div key={wh.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                    <code className="text-sm text-gray-800 dark:text-gray-200">{wh.url}</code>
                    <button onClick={() => setWebhookToDelete(wh)} className="p-1 text-red-500 hover:text-red-700"><Icon name="trash" className="w-4 h-4"/></button>
                </div>
            ))}
            {(currentUser.webhooks || []).length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada webhook yang ditambahkan.</p>}
        </div>
      </div>

      {webhookToDelete && (
        <Modal
          title="Hapus Webhook"
          onCancel={() => setWebhookToDelete(null)}
          onConfirm={handleDeleteWebhook}
          confirmText="Ya, Hapus"
        >
          <p>Apakah Anda yakin ingin menghapus webhook ini? <br/><code>{webhookToDelete.url}</code></p>
        </Modal>
      )}
    </div>
  );
};

const AdminAiManagement = ({ apiKeys, setApiKeys, showToast }) => {
    const [activeTab, setActiveTab] = useState('keys');
    const [localKeys, setLocalKeys] = useState(apiKeys);
    const [keyStatuses, setKeyStatuses] = useState({ gemini: 'idle', openai: 'idle', openrouter: 'idle', other: 'idle' });
    
    // State for Content Assistant
    const [contentPrompt, setContentPrompt] = useState('');
    const [contentResponse, setContentResponse] = useState('');
    const [isContentLoading, setIsContentLoading] = useState(false);

    // State for Website Management
    const [managementPrompt, setManagementPrompt] = useState('');
    const [managementResponse, setManagementResponse] = useState('');
    const [isManagementLoading, setIsManagementLoading] = useState(false);

    const activeApiKey = localKeys.gemini || localKeys.openai || localKeys.openrouter || localKeys.other;

    const handleKeyChange = (e) => {
        const { name, value } = e.target;
        setLocalKeys(prev => ({ ...prev, [name]: value }));
        setKeyStatuses(prev => ({ ...prev, [name]: 'idle' }));
    };

    const handleSaveKeys = () => {
        setApiKeys(localKeys);
        showToast("API Keys berhasil disimpan.", "success");
    };

    const handleCheckStatus = (keyName) => {
        const key = localKeys[keyName];
        if (!key) {
            showToast("API Key kosong.", "error");
            return;
        }
        setKeyStatuses(prev => ({ ...prev, [keyName]: 'checking' }));
        // Simulate API check
        setTimeout(() => {
            // This is a simple simulation. A real check would make a lightweight API call.
            if (key.length > 10) { // Simple validation
                 setKeyStatuses(prev => ({ ...prev, [keyName]: 'success' }));
            } else {
                 setKeyStatuses(prev => ({ ...prev, [keyName]: 'failed' }));
            }
        }, 1000);
    };

    const handleContentSubmit = async (e) => {
        e.preventDefault();
        setIsContentLoading(true);
        setContentResponse('');
        try {
            const text = await callGeminiApi(contentPrompt, activeApiKey);
            setContentResponse(text);
        } catch (error) {
            console.error("AI call failed:", error);
            setContentResponse(`Terjadi kesalahan: ${error.message}`);
            showToast(error.message, "error");
        } finally {
            setIsContentLoading(false);
        }
    };

    const handleManagementSubmit = async (e) => {
        e.preventDefault();
        setIsManagementLoading(true);
        setManagementResponse('');
        const fullPrompt = `Anda adalah AI manajer website yang canggih. Berikan laporan simulasi berdasarkan permintaan berikut: "${managementPrompt}". Format jawaban Anda dalam bentuk poin-poin yang jelas.`;
        try {
            const text = await callGeminiApi(fullPrompt, activeApiKey);
            setManagementResponse(text);
        } catch (error) {
            console.error("AI call failed:", error);
            setManagementResponse(`Terjadi kesalahan: ${error.message}`);
            showToast(error.message, "error");
        } finally {
            setIsManagementLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'idle') return null;
        const styles = {
            checking: 'bg-yellow-100 text-yellow-800',
            success: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manajemen AI</h2>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button onClick={() => setActiveTab('keys')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'keys' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Pengaturan API</button>
                <button onClick={() => setActiveTab('management')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'management' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Manajemen Website</button>
                <button onClick={() => setActiveTab('content')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Asisten Konten</button>
            </div>

            {activeTab === 'keys' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                    <h3 className="text-lg font-semibold">API Keys untuk Model AI</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Masukkan API Key Anda di sini. Aplikasi akan menggunakan key yang tersedia dengan prioritas: Gemini &gt; OpenAI &gt; OpenRouter &gt; Lainnya.</p>
                    
                    {['gemini', 'openai', 'openrouter', 'other'].map(keyName => (
                        <div key={keyName}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{keyName.replace('other', 'Lainnya')} API Key</label>
                            <div className="flex items-center space-x-2">
                                <input type="password" name={keyName} value={localKeys[keyName]} onChange={handleKeyChange} className="w-full mt-1 input-style" />
                                <button onClick={() => handleCheckStatus(keyName)} className="px-3 py-2 mt-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cek Status</button>
                                <StatusBadge status={keyStatuses[keyName]} />
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex justify-end">
                        <button onClick={handleSaveKeys} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Simpan Keys</button>
                    </div>
                </div>
            )}

            {activeTab === 'management' && (
                <div>
                    <form onSubmit={handleManagementSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI Manajemen Website</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Berikan perintah kepada AI untuk melakukan pengecekan atau memberikan saran terkait website Anda.</p>
                        <div>
                            <textarea value={managementPrompt} onChange={e => setManagementPrompt(e.target.value)} rows="4" className="w-full mt-1 input-style" placeholder="Contoh: Periksa semua artikel dan cari tautan yang rusak, lalu berikan saran SEO untuk artikel terbaru."></textarea>
                        </div>
                        <button type="submit" disabled={isManagementLoading || !activeApiKey} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center">
                            {isManagementLoading ? 'Memeriksa...' : 'Jalankan Pengecekan'}
                        </button>
                    </form>
                    {managementResponse && (
                        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Laporan dari AI</h3>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: managementResponse.replace(/\n/g, '<br />') }}></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'content' && (
                <div>
                    <form onSubmit={handleContentSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Asisten Konten</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gunakan AI untuk membuat draf artikel, postingan media sosial, ide, atau tulisan lainnya.</p>
                        <div>
                            <textarea value={contentPrompt} onChange={e => setContentPrompt(e.target.value)} rows="6" className="w-full mt-1 input-style" placeholder="Contoh: Buatkan draf artikel blog tentang 5 tips fotografi smartphone untuk pemula."></textarea>
                        </div>
                        <button type="submit" disabled={isContentLoading || !activeApiKey} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center">
                            {isContentLoading ? 'Membuat...' : 'Buat Konten'}
                        </button>
                    </form>
                    {contentResponse && (
                        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Hasil dari AI</h3>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentResponse.replace(/\n/g, '<br />') }}></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const ChangePassword = ({ currentUser, showToast, onLogout }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Password baru tidak cocok.", "error");
            return;
        }
        if (newPassword.length < 8) {
            showToast("Password baru minimal 8 karakter.", "error");
            return;
        }
        console.log(`Password change for ${currentUser.email} to ${newPassword}`);
        showToast("Password berhasil diubah! Silakan login kembali.", "success");
        setTimeout(() => {
            onLogout();
        }, 1500);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ganti Password</h2>
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Lama</label>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full mt-1 input-style" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 input-style" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-1 input-style" required />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                        Ubah Password
                    </button>
                </form>
            </div>
        </div>
    );
};

const DeploymentGuide = () => (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Panduan Deploy</h2>
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Konsep Dasar</h3>
                <p className="text-gray-600 dark:text-gray-400">Proyek ini terdiri dari dua bagian utama: **Frontend** (aplikasi React yang Anda lihat sekarang) dan **Backend** (server yang mengelola data, seperti Laravel atau Django). Keduanya harus di-deploy secara terpisah.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">1. Deploy Frontend (React)</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Frontend adalah aplikasi statis. Anda bisa menggunakan layanan hosting seperti Vercel, Netlify, atau GitHub Pages.</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>**Build Aplikasi:** Jalankan perintah `npm run build` atau `yarn build` di terminal Anda. Ini akan membuat folder `build` (atau `dist`) yang berisi file HTML, CSS, dan JS yang siap di-deploy.</li>
                    <li>**Hubungkan ke Layanan Hosting:**
                        <ul className="list-disc list-inside ml-6 mt-2">
                            <li>**Vercel/Netlify:** Hubungkan repositori Git Anda. Mereka akan otomatis mendeteksi bahwa ini adalah aplikasi React, menjalankan proses build, dan men-deploy-nya.</li>
                            <li>**GitHub Pages:** Konfigurasi repositori Anda untuk men-deploy dari folder `build`.</li>
                        </ul>
                    </li>
                    <li>**Konfigurasi Environment Variables:** Atur URL API backend Anda (misalnya, `REACT_APP_API_URL=https://api.gandex.post`) di pengaturan layanan hosting Anda.</li>
                </ol>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">2. Deploy Backend (Contoh: Laravel/Django)</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Backend memerlukan server yang bisa menjalankan kode PHP atau Python. Anda bisa menggunakan VPS (DigitalOcean, Linode) atau Platform-as-a-Service (Heroku, Render).</p>
                 <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>**Siapkan Server:** Pilih penyedia layanan dan siapkan server dengan lingkungan yang sesuai (misalnya, PHP, Composer, Nginx untuk Laravel).</li>
                    <li>**Upload Kode:** Transfer kode backend Anda ke server menggunakan Git.</li>
                    <li>**Install Dependencies:** Jalankan `composer install` (untuk Laravel) atau `pip install -r requirements.txt` (untuk Django).</li>
                    <li>**Konfigurasi Database:** Buat database di server Anda dan perbarui file konfigurasi (`.env`) dengan kredensial database yang baru.</li>
                    <li>**Jalankan Migrasi:** Jalankan `php artisan migrate` (Laravel) atau `python manage.py migrate` (Django) untuk membuat tabel di database.</li>
                    <li>**Atur Web Server:** Konfigurasikan Nginx atau Apache untuk mengarahkan domain API Anda (misalnya, `api.gandex.post`) ke aplikasi backend Anda.</li>
                </ol>
            </div>
        </div>
    </div>
);

const AdminPythonBot = ({ showToast }) => {
    const [logs, setLogs] = useState("Menunggu perintah...\n");
    const [runningTask, setRunningTask] = useState(null);

    const logRef = React.useRef(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    const runBot = (task) => {
        setRunningTask(task.id);
        const timestamp = new Date().toLocaleTimeString();
        let newLogs = logs + '[' + timestamp + '] ==> Memulai task: "' + task.name + '"...\n';
        setLogs(newLogs);

        // Simulate API call and script execution
        setTimeout(() => {
            const finishTimestamp = new Date().toLocaleTimeString();
            newLogs += task.simulationResult;
            newLogs += '[' + finishTimestamp + '] <== Task: "' + task.name + '" selesai.\n\n';
            setLogs(newLogs);
            setRunningTask(null);
            showToast('Task "' + task.name + '" telah selesai.', 'success');
        }, Math.random() * 2000 + 1000); // Simulate 1-3 second execution time
    };

    const botTasks = [
        {
            id: 'check-links',
            name: 'Periksa Tautan Rusak',
            description: 'Memindai semua artikel untuk menemukan tautan (<a>) yang mengarah ke error 404.',
            simulationResult: `    [LOG] Memindai 3 artikel...\n    [OK] Artikel ID 1: Semua tautan valid.\n    [WARNING] Artikel ID 2: Tautan 'http://example.com/old-page' mengembalikan status 404.\n    [OK] Artikel ID 3: Semua tautan valid.\n`
        },
        {
            id: 'optimize-images',
            name: 'Optimalkan Gambar',
            description: 'Mencari gambar yang ukurannya terlalu besar dan mengompresnya untuk mempercepat waktu muat.',
            simulationResult: `    [LOG] Memindai gambar...\n    [SKIP] Gambar 'ai-revolution.jpg' sudah optimal.\n    [OPTIMIZED] Gambar 'investment-guide.jpg' dioptimalkan. Ukuran berkurang 35%.\n    [SKIP] Gambar 'hidden-indonesia.jpg' sudah optimal.\n`
        }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Bot Otomatisasi Python</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Jalankan skrip Python di server untuk melakukan tugas-tugas pemeliharaan secara otomatis.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {botTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{task.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">{task.description}</p>
                        <button 
                            onClick={() => runBot(task)} 
                            disabled={runningTask !== null}
                            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {runningTask === task.id ? 'Menjalankan...' : 'Jalankan'}
                        </button>
                    </div>
                ))}
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Log Aktivitas</h3>
                <pre ref={logRef} className="bg-gray-900 text-white font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
                    {logs}
                </pre>
            </div>
        </div>
    );
};


const AdminPanel = ({ currentUser, onLogout, onUpdateUser, showToast, users, setUsers, articles, setArticles, ads, setAds, apiKeys, setApiKeys }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'superadmin'] },
    { id: 'articles', label: 'Artikel', icon: 'articles', roles: ['admin', 'superadmin'] },
    { id: 'users', label: 'Pengguna', icon: 'users', roles: ['superadmin'] },
    { id: 'ads', label: 'Integrasi Iklan', icon: 'ads', roles: ['superadmin'] },
    { id: 'apiwebhooks', label: 'API & Webhooks', icon: 'webhook', roles: ['admin', 'superadmin'] },
    { id: 'aimanagement', label: 'Manajemen AI', icon: 'sparkles', roles: ['admin', 'superadmin'] },
    { id: 'pythonbot', label: 'Bot Otomatisasi', icon: 'robot', roles: ['superadmin'] },
    { id: 'changepassword', label: 'Ganti Password', icon: 'lock', roles: ['admin', 'superadmin'] },
    { id: 'deploymentguide', label: 'Panduan Deploy', icon: 'cloud', roles: ['admin', 'superadmin'] },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard articles={articles} users={users} />;
      case 'articles': return <AdminArticles articles={articles} setArticles={setArticles} showToast={showToast} apiKeys={apiKeys} />;
      case 'users': return <AdminUsers users={users} setUsers={setUsers} showToast={showToast} currentUser={currentUser} />;
      case 'ads': return <AdminAds ads={ads} setAds={setAds} showToast={showToast} />;
      case 'apiwebhooks': return <AdminApiWebhooks currentUser={currentUser} onUpdateUser={onUpdateUser} showToast={showToast} />;
      case 'aimanagement': return <AdminAiManagement apiKeys={apiKeys} setApiKeys={setApiKeys} showToast={showToast} />;
      case 'changepassword': return <ChangePassword currentUser={currentUser} showToast={showToast} onLogout={onLogout} />;
      case 'deploymentguide': return <DeploymentGuide />;
      case 'pythonbot': return <AdminPythonBot showToast={showToast} />;
      default: return <AdminDashboard articles={articles} users={users} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400">{currentUser.email}</p>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            item.roles.includes(currentUser.role) && (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeSection === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors">
            <Icon name="logout" className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-grow p-8 bg-gray-100 dark:bg-gray-900 ml-64">
        {renderSection()}
      </main>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [page, setPage] = useState({ name: 'home', props: {} });
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [articles, setArticles] = useState(initialArticles);
  const [ads, setAds] = useState({ top: '', middle: '', bottom: '', sidebar: '' });
  const [toast, setToast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKeys, setApiKeys] = useState({ gemini: '', openai: '', openrouter: '', other: '' });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      setCurrentUser(user);
      showToast("Login berhasil!", "success");
      if (user.mustChangePassword) {
        showToast("Keamanan: Anda harus mengganti password.", "info");
        navigate('admin', { initialSection: 'changepassword' });
      } else {
        navigate('admin');
      }
    } else if (user) {
        showToast("Anda tidak memiliki hak akses admin.", "error");
    } else {
      showToast("Email atau password salah.", "error");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast("Anda telah logout.", "info");
    navigate('home');
  };
  
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const navigate = (pageName, props = {}) => {
    setPage({ name: pageName, props });
    window.scrollTo(0, 0);
  };
  
  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomePage articles={articles} onNavigate={navigate} ads={ads} />;
      case 'article':
        return <ArticleDetailPage slug={page.props.slug} articles={articles} ads={ads} showToast={showToast} apiKeys={apiKeys} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
      case 'admin':
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
          navigate('login');
          showToast("Silakan login untuk mengakses halaman ini.", "error");
          return null;
        }
        return (
          <AdminPanel 
            currentUser={currentUser} 
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            showToast={showToast}
            users={users}
            setUsers={setUsers}
            articles={articles}
            setArticles={setArticles}
            ads={ads}
            setAds={setAds}
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
          />
        );
      default:
        return <HomePage articles={articles} onNavigate={navigate} ads={ads} />;
    }
  };

  const isFullPage = page.name === 'admin';

  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300`}>
      <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid; border-color: #d1d5db; border-radius: 0.375rem; background-color: transparent; outline: 2px solid transparent; outline-offset: 2px; } .dark .input-style { border-color: #4b5563; } .input-style:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px #3b82f6; }`}</style>
      
      {!isFullPage && <Header currentUser={currentUser} onLogout={handleLogout} onNavigate={navigate} onToggleTheme={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />}
      
      <main className={!isFullPage ? "min-h-[calc(100vh-150px)]" : ""}>
        {renderPage()}
      </main>
      
      {!isFullPage && <Footer />}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
