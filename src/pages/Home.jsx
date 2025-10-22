import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FiBook, FiArrowRight, FiSearch, FiUsers, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { IoLeafOutline } from "react-icons/io5";
import { FaMicroscope, FaRadiation, FaSatelliteDish, FaDna, FaRocket } from "react-icons/fa";
import { MyContext } from "../AppLayout";

// Animated particles background
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-900" />
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-cyan-400/30"
        style={{
          width: Math.random() * 4 + 1 + 'px',
          height: Math.random() * 4 + 1 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out ${Math.random() * 5}s`,
          opacity: Math.random() * 0.5 + 0.2
        }}
      />
    ))}
  </div>
);

const MetricCard = ({ icon, title, value }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-2xl hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group">
    <div className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <p className="text-slate-500 text-sm font-medium mb-2">{title}</p>
    <p className="text-slate-100 font-bold text-3xl">{value}</p>
  </div>
);

const ArticleCard = ({ icon, title, authors, publicationDate, abstract, keywords, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "No abstract available.";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const displayKeywords = (keywordsStr) => {
    if (!keywordsStr) return null;
    const keywordArray = keywordsStr.split(',').slice(0, 3);
    return keywordArray.map(k => k.trim()).filter(k => k);
  };

  const keywordList = displayKeywords(keywords);

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:border-cyan-500/50 flex flex-col h-full group cursor-pointer"
    >
      <div className="flex-grow">
        <div className="mb-4 p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl w-fit border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon, { size: 32, className: "text-cyan-400" })}
        </div>

        <h3 className="text-slate-100 font-bold mt-2 mb-3 text-lg leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
          {authors && (
            <div className="flex items-center gap-1">
              <FiUsers size={12} />
              <span className="truncate max-w-[150px]">{authors.split(',')[0].trim()}{authors.includes(',') && ' et al.'}</span>
            </div>
          )}
          {publicationDate && (
            <div className="flex items-center gap-1">
              <FiCalendar size={12} />
              <span>{formatDate(publicationDate)}</span>
            </div>
          )}
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-3">
          {truncateText(abstract)}
        </p>
      </div>

      {keywordList && keywordList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700/50">
          {keywordList.map((keyword, idx) => (
            <span
              key={idx}
              className="inline-block bg-cyan-900/30 text-cyan-300 text-xs font-medium px-3 py-1 rounded-full border border-cyan-500/30"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ICONS = [FiBook, FaMicroscope, IoLeafOutline, FaRadiation, FaSatelliteDish, FaDna];

const Home = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalArticles: 0, uniqueArticles: 0 });
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);
  const history = useNavigate();

  const createSlug = (title) => {
    if (!title) return 'untitled';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleArticleClick = (article) => {
    // Check if user is logged in
    if (context.isLogin === false) {
      // Store the article data and intended destination
      const slug = createSlug(article.title);
      sessionStorage.setItem('currentArticle', JSON.stringify(article));
      sessionStorage.setItem('redirectAfterLogin', `/dashboard/${slug}`);

      context.openAlertBox("error", "Need to Login for viewing articles");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    const slug = createSlug(article.title);
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    navigate(`/dashboard/${slug}`);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order('publication_date', { ascending: false })
          .order('chunk_id', { ascending: true });

        if (error) {
          console.error("Error fetching articles:", error);
          setLoading(false);
          return;
        }

        const uniqueArticlesMap = new Map();
        data.forEach(article => {
          if (!uniqueArticlesMap.has(article.link)) {
            uniqueArticlesMap.set(article.link, article);
          }
        });

        const uniqueArticles = Array.from(uniqueArticlesMap.values());

        setArticles(uniqueArticles);
        setFilteredArticles(uniqueArticles);
        setStats({
          totalArticles: data.length,
          uniqueArticles: uniqueArticles.length
        });
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(searchLower) ||
        article.abstract?.toLowerCase().includes(searchLower) ||
        article.keywords?.toLowerCase().includes(searchLower) ||
        article.authors?.toLowerCase().includes(searchLower)
    );

    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const MetricCard = ({ icon, title, value, gradient, delay = 0, trend, subtitle }) => (
    <div
      className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-3xl hover:border-cyan-400/60 transition-all duration-500 group overflow-hidden shadow-2xl hover:shadow-cyan-500/25"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Multiple animated gradient layers */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-700`} />
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />

      {/* Animated border glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          {/* Icon with multiple animation layers */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute -inset-3 border-2 border-cyan-400/20 rounded-2xl rotate-45 group-hover:rotate-90 transition-all duration-1000" />
            <div className="absolute -inset-2 border border-blue-400/20 rounded-2xl -rotate-45 group-hover:-rotate-90 transition-all duration-1000" />

            {/* Pulsing background */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-xl animate-pulse group-hover:animate-none" />

            {/* Icon container */}
            <div className={`relative p-5 bg-gradient-to-br ${gradient} rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-cyan-500/20`}>
              {React.cloneElement(icon, { className: "text-white drop-shadow-2xl filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" })}
            </div>

            {/* Corner accents */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>

          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full backdrop-blur-sm">
              <FiTrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold">{trend}</span>
            </div>
          )}
        </div>

        {/* Title with gradient */}
        <div className="mb-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-cyan-300 transition-colors duration-300 flex items-center gap-2">
            <div className="w-8 h-px bg-gradient-to-r from-cyan-400/50 to-transparent" />
            {title}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-xs">{subtitle}</p>
          )}
        </div>

        {/* Value with animated counter effect */}
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-blue-200 font-black text-5xl lg:text-6xl group-hover:scale-105 transition-transform duration-300 drop-shadow-lg">
              {value}
            </p>
            <div className="flex flex-col gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            </div>
          </div>
        </div>

        {/* Multi-layer progress bar */}
        <div className="space-y-2">
          <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ animation: 'shimmer 2s infinite' }} />

            {/* Progress fill */}
            <div className={`h-full bg-gradient-to-r ${gradient} rounded-full relative overflow-hidden group-hover:w-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: '70%' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
            </div>
          </div>

          {/* Micro stats */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
              Active
            </span>
            <span>Updated now</span>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          {React.cloneElement(icon, { size: 96, className: "text-cyan-400" })}
        </div>
      </div>
    </div>
  );
  return (
    <>
      <AnimatedBackground />
      <style>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(-20px) translateX(10px); }
    66% { transform: translateY(-10px) translateX(-10px); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`}</style>

      <div className="relative min-h-screen px-4 sm:px-6 lg:px-10 py-24">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-cyan-500/20 p-8 sm:p-12 lg:p-16 rounded-3xl shadow-2xl shadow-cyan-500/10 mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-6 backdrop-blur-sm">
              <FaRocket size={16} />
              <span>NASA Space Biology Knowledge Engine</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Explore the Frontiers of <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Space Bioscience
              </span>
            </h2>

            <p className="text-slate-400 text-lg sm:text-xl mb-8 max-w-3xl leading-relaxed">
              Your gateway to NASA's bioscience research — human health, biology, and life beyond Earth.
            </p>

            <button
              onClick={() => navigate('/dashboard/overview')}
              className="group inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Explore Insights
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
            </button>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="relative mb-16">
          {/* Section header with decorative elements */}
          <div className="text-center mb-12 relative">
            {/* Top decoration */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/50 to-cyan-400" />
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent via-cyan-400/50 to-cyan-400" />
            </div>

            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 rounded-full backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-cyan-400 text-sm font-bold tracking-wider">LIVE ANALYTICS</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-300 mb-3 drop-shadow-2xl">
              Platform Intelligence
            </h3>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              Real-time insights powered by{" "}
              <span className="text-cyan-400 font-semibold">NASA's research database</span>
              {" "}• Updated continuously
            </p>

            {/* Decorative bottom element */}
            <div className="flex justify-center mt-6 gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{
                    width: i === 2 ? '40px' : '12px',
                    opacity: i === 2 ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stats cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* Background decoration */}
            <div className="absolute -top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <MetricCard
              icon={<FiBook size={32} />}
              title="Research Articles"
              subtitle="Unique publications"
              value={loading ? "..." : stats.uniqueArticles.toLocaleString()}
              gradient="from-cyan-500 via-cyan-600 to-blue-600"
              trend="+12%"
              delay={0}
            />
            <MetricCard
              icon={<FaMicroscope size={32} />}
              title="Content Chunks"
              subtitle="Indexed segments"
              value={loading ? "..." : stats.totalArticles.toLocaleString()}
              gradient="from-blue-500 via-blue-600 to-purple-600"
              trend="+8%"
              delay={100}
            />
            <MetricCard
              icon={<FiTrendingUp size={32} />}
              title="Active Results"
              subtitle="Current search"
              value={filteredArticles.length.toLocaleString()}
              gradient="from-purple-500 via-purple-600 to-pink-600"
              trend="Live"
              delay={200}
            />
          </div>

          {/* Bottom separator with icon */}
          <div className="mt-16 relative">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-slate-950">
              <FaRocket className="text-cyan-400/50" size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-3xl mx-auto group">
            <FiSearch className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors z-10" size={20} />
            <input
              type="text"
              placeholder="Search articles by title, keywords, authors, or abstract..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 backdrop-blur-xl border-2 border-cyan-500/20 rounded-2xl py-4 pl-14 pr-6 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:shadow-2xl focus:shadow-cyan-500/20 transition-all"
            />
          </div>
        </div>

        {/* Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {searchTerm
                ? <span>Results for <span className="text-cyan-400">"{searchTerm}"</span> ({filteredArticles.length})</span>
                : "Latest Research Articles"}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-4"></div>
              <p className="text-slate-400 text-lg">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
              <FiSearch className="mx-auto text-slate-600 mb-4" size={64} />
              <p className="text-slate-400 text-xl mb-2">No articles found</p>
              <p className="text-slate-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, idx) => {
                const IconComponent = ICONS[idx % ICONS.length];
                return (
                  <ArticleCard
                    key={article.id}
                    icon={<IconComponent />}
                    title={article.title || "Untitled Article"}
                    authors={article.authors}
                    publicationDate={article.publication_date}
                    abstract={article.abstract}
                    keywords={article.keywords}
                    onClick={() => handleArticleClick(article)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;