import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiCalendar, FiUsers, FiExternalLink, FiZap } from 'react-icons/fi';
import axios from 'axios'; 

const NODE_SERVER_URL = 'https://sbk-backend-chi.vercel.app' || 'http://localhost:3000'; 

const Dashboard = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  
  const [articleData, setArticleData] = useState(null);
  
  useEffect(() => {
    const storedArticle = sessionStorage.getItem('currentArticle');
    if (storedArticle) {
      setArticleData(JSON.parse(storedArticle));
    }
  }, []);

  const readableTopic = articleData?.title || topic?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Loading Article...";
  
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGeminiResponse = useCallback(async (userQuery) => {
    setError(null); 
    try {
      const response = await axios.post(`${NODE_SERVER_URL}/ask-gemini`, {
        query: userQuery,
      });
      return response.data.response; 
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'An unknown API error occurred.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (!articleData) {
        setIsSummaryLoading(false);
        setSummary("No article data available. Please select an article from the home page.");
        return;
    }

    const articleContext = `
Title: ${articleData.title}
Authors: ${articleData.authors || 'N/A'}
Publication Date: ${articleData.publication_date || 'N/A'}
Keywords: ${articleData.keywords || 'N/A'}
Abstract: ${articleData.abstract || 'N/A'}
${articleData.conclusion ? `Conclusion: ${articleData.conclusion}` : ''}
${articleData.content ? `Content: ${articleData.content}` : ''}
    `.trim();

    const initialPrompt = `Based on the following research article, provide a detailed summary and analysis:\n\n${articleContext}\n\nProvide a comprehensive summary highlighting key findings, methodology, and conclusions. Structure the response clearly with headings for 'Summary' and 'Conclusion'.`;
    
    setIsSummaryLoading(true);

    fetchGeminiResponse(initialPrompt)
      .then(geminiResponseText => {
        setSummary(geminiResponseText);
      })
      .catch(err => {
        setSummary("⚠️ Could not load article summary. Check your Node.js and Flask servers.");
      })
      .finally(() => {
        setIsSummaryLoading(false);
      });
  }, [articleData, fetchGeminiResponse]); 

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || !articleData) return;
    
    setIsAssistantLoading(true);
    setAnswer(null);

    try {
      const articleContext = `
Research Article Context:
Title: ${articleData.title}
Authors: ${articleData.authors || 'N/A'}
Abstract: ${articleData.abstract || 'N/A'}
${articleData.content ? `Content: ${articleData.content}` : ''}
${articleData.conclusion ? `Conclusion: ${articleData.conclusion}` : ''}
      `.trim();

      const fullQuery = `${articleContext}\n\nQuestion: ${question}\n\nPlease answer this question based on the research article provided above.`;
      const geminiResponseText = await fetchGeminiResponse(fullQuery);
      setAnswer(geminiResponseText);
      setQuestion(''); 
    } catch (err) {
      setAnswer(`Error: Failed to get a response. Details: ${error}`);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-xl text-slate-100 font-medium py-3 px-6 rounded-xl hover:bg-slate-700/50 transition-all border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <FiArrowLeft size={20} /> Back to Articles
        </button>
      </div>

      {/* Article Header */}
      {articleData && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-8 sm:p-10 lg:p-12 rounded-3xl shadow-2xl shadow-cyan-500/10 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-6">
            <FiZap size={16} />
            <span>Research Article</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            {articleData.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
            {articleData.authors && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <FiUsers className="text-cyan-400" size={18} />
                </div>
                <span className="text-sm">{articleData.authors}</span>
              </div>
            )}
            {articleData.publication_date && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <FiCalendar className="text-cyan-400" size={18} />
                </div>
                <span className="text-sm">{formatDate(articleData.publication_date)}</span>
              </div>
            )}
            {articleData.link && (
              <a 
                href={articleData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm group"
              >
                <FiExternalLink className="group-hover:scale-110 transition-transform" size={18} /> 
                View Original
              </a>
            )}
          </div>

          {articleData.keywords && (
            <div className="flex flex-wrap gap-2 mb-6">
              {articleData.keywords.split(',').map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-cyan-900/30 text-cyan-300 text-xs font-medium px-4 py-2 rounded-full border border-cyan-500/30"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          {articleData.abstract && (
            <div className="bg-slate-950/50 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/20">
              <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">Abstract</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{articleData.abstract}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl text-red-300">
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* AI Research Assistant */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
            <FiZap className="text-cyan-400" size={24} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-cyan-400">AI Research Assistant</h3>
        </div>
        
        <form onSubmit={handleAskQuestion} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Ask about this article..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-slate-950/50 backdrop-blur-sm border-2 border-cyan-500/20 rounded-xl py-3 sm:py-4 px-4 sm:px-6 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-500/50 outline-none transition-all"
            disabled={isAssistantLoading}
          />
          <button
            type="submit"
            disabled={isAssistantLoading || !question.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 sm:py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAssistantLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <FiSend size={20} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
        
        {answer && (
          <div className="p-6 bg-slate-950/50 backdrop-blur-sm rounded-2xl border-2 border-cyan-500/30 whitespace-pre-wrap">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <strong className="text-cyan-400 text-sm uppercase tracking-wider">Answer</strong>
            </div>
            <div className="text-slate-300 leading-relaxed">{answer}</div>
          </div>
        )}
      </div>

      {/* AI Summary Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl border border-green-500/30">
            <FiZap className="text-green-400" size={24} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-green-400">AI Article Summary & Analysis</h3>
        </div>
        
        {isSummaryLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400 mb-4"></div>
            <p className="text-slate-400 text-lg">Loading comprehensive summary from Gemini...</p>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-green-500/30 whitespace-pre-wrap">
            <div className="text-slate-300 leading-relaxed">{summary}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;