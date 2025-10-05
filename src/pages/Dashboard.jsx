import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiCalendar, FiUsers, FiExternalLink } from 'react-icons/fi';
import axios from 'axios'; 

const NODE_SERVER_URL = 'http://localhost:3000'; 

const Dashboard = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  
  // Get article data from sessionStorage
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

  // Fetch summary with article context
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

  // AI Assistant with article context
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-slate-800/50 text-slate-100 font-medium py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <FiArrowLeft size={20} /> Back to Articles
        </button>
      </div>

      {/* Article Header */}
      {articleData && (
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            {articleData.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-4">
            {articleData.authors && (
              <div className="flex items-center gap-2">
                <FiUsers className="text-teal-400" />
                <span>{articleData.authors}</span>
              </div>
            )}
            {articleData.publication_date && (
              <div className="flex items-center gap-2">
                <FiCalendar className="text-teal-400" />
                <span>{formatDate(articleData.publication_date)}</span>
              </div>
            )}
            {articleData.link && (
              <a 
                href={articleData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
              >
                <FiExternalLink /> View Original
              </a>
            )}
          </div>

          {articleData.keywords && (
            <div className="flex flex-wrap gap-2 mb-4">
              {articleData.keywords.split(',').map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-teal-900/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          {articleData.abstract && (
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h3 className="text-sm font-bold text-teal-400 mb-2">Abstract</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{articleData.abstract}</p>
            </div>
          )}
        </div>
      )}

      {/* Display API error */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* AI Research Assistant */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-2xl mb-8">
        <h3 className="text-2xl font-bold text-teal-400 mb-4">AI Research Assistant 🤖</h3>
        
        <form onSubmit={handleAskQuestion} className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder={`Ask about this article...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-400 outline-none"
            disabled={isAssistantLoading}
          />
          <button
            type="submit"
            disabled={isAssistantLoading || !question.trim()}
            className="bg-teal-400 text-slate-900 font-bold py-3 px-6 rounded-lg hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssistantLoading ? 'Thinking...' : <FiSend size={20} />}
          </button>
        </form>
        
        {answer && (
          <div className="p-4 bg-slate-900 rounded-lg border border-teal-400/50 whitespace-pre-wrap">
            <strong className="text-teal-400">Answer:</strong>
            <div className="mt-2 text-slate-300">{answer}</div>
          </div>
        )}
      </div>

      {/* AI Topic Summary & Conclusion Section */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-2xl mb-8">
        <h3 className="text-2xl font-bold text-green-400 mb-4">AI Article Summary & Analysis 📝</h3>
        {isSummaryLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mb-4"></div>
            <p className="text-slate-400">Loading comprehensive summary from Gemini...</p>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 rounded-lg border border-green-400/50 whitespace-pre-wrap">
            <div className="text-slate-300">{summary}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;