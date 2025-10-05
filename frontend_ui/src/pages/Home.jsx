import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FiBook, FiArrowRight, FiSearch, FiSliders, FiUsers, FiCalendar } from "react-icons/fi";
import { IoLeafOutline } from "react-icons/io5";
import { FaMicroscope, FaRadiation, FaSatelliteDish, FaDna } from "react-icons/fa";

// Use the same MetricCard component from before
const MetricCard = ({ icon, title, value }) => (
  <div className="bg-slate-800/50 p-5 rounded-lg flex flex-col items-start justify-center text-left h-32 border border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
    <div className="text-teal-400 mb-2">{icon}</div>
    <p className="text-slate-400 text-sm">{title}</p>
    <p className="text-slate-100 font-semibold text-xl leading-tight mt-1">{value}</p>
  </div>
);

// Updated Article Card Component
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
      className="bg-slate-800/50 p-6 rounded-xl border-2 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-slate-700 hover:border-teal-400/50 flex flex-col h-full group cursor-pointer"
    >
      <div className="flex-grow">
        {React.cloneElement(icon, { size: 36, className: "text-teal-400 mb-3 group-hover:scale-110 transition-transform duration-300" })}
        
        <h3 className="text-slate-100 font-bold mt-2 mb-2 text-lg leading-tight line-clamp-2 group-hover:text-teal-300 transition-colors">
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
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          {keywordList.map((keyword, idx) => (
            <span
              key={idx}
              className="inline-block bg-teal-900/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full shadow-inner"
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

  // Create URL-friendly slug
  const createSlug = (title) => {
    if (!title) return 'untitled';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle article click - navigate to dashboard
  const handleArticleClick = (article) => {
    const slug = createSlug(article.title);
    // Store article data for Dashboard to access
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    navigate(`/dashboard/${slug}`);
  };

  // Fetch articles
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

        // Get unique articles by link
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

  // Filter articles
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 px-10 py-24">
      {/* Hero Section */}
      <div className="relative bg-slate-800/50 p-10 rounded-2xl shadow-2xl mb-12 border border-slate-700">
        <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          Explore the Frontiers of <br />
          <span className="text-teal-400">Space Bioscience</span>
        </h2>
        <p className="text-slate-400 text-lg mb-6 max-w-2xl">
          Your gateway to NASA's bioscience research — human health, biology, and life beyond Earth.
        </p>
        <button
          onClick={() => navigate('/dashboard/overview')}
          className="inline-flex items-center bg-teal-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-teal-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Explore Insights <FiArrowRight className="ml-2" />
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<FiBook size={24} />}
          title="Research Articles"
          value={loading ? "..." : stats.uniqueArticles.toLocaleString()}
        />
        <MetricCard
          icon={<FaMicroscope size={24} />}
          title="Total Content Chunks"
          value={loading ? "..." : stats.totalArticles.toLocaleString()}
        />
        <MetricCard
          icon={<FaDna size={24} />}
          title="Search Results"
          value={filteredArticles.length.toLocaleString()}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative w-full max-w-2xl">
        <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search articles by title, keywords, authors, or abstract..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-3 pl-12 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
        />
        <FiSliders className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-teal-400" />
      </div>

      {/* Articles Grid */}
      <div>
        <h3 className="text-3xl font-bold text-white mb-6">
          {searchTerm 
            ? `Results for "${searchTerm}" (${filteredArticles.length})` 
            : "Latest Research Articles"}
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
            <p className="text-slate-400 mt-4">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <p className="text-slate-400 text-lg">No articles found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default Home;