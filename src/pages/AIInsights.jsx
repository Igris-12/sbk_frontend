import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { FiTrendingUp, FiAlertCircle, FiZap, FiTarget, FiRefreshCw } from 'react-icons/fi';

const NODE_SERVER_URL = 'https://sbk-backend-chi.vercel.app' || 'http://localhost:3000';

const InsightCard = ({ icon: Icon, title, content, isLoading, color }) => (
  <div className={`bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/20 shadow-xl hover:shadow-2xl hover:shadow-${color}-500/20 transition-all duration-300 hover:border-${color}-500/40`}>
    <div className="flex items-start gap-4 mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 border border-${color}-500/30 group-hover:scale-110 transition-transform`}>
        <Icon className={`text-${color}-400`} size={24} />
      </div>
      <h3 className={`text-lg font-bold text-${color}-400 flex-1`}>{title}</h3>
    </div>
    {isLoading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        <div className="h-3 bg-slate-700 rounded w-4/6"></div>
      </div>
    ) : (
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    )}
  </div>
);

const AllInsights = () => {
  const { topic } = useParams();
  const readableTopic = topic ? 
      topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
      "AI Insights";

  const [insights, setInsights] = useState({
    trends: '',
    challenges: '',
    opportunities: '',
    recommendations: '',
    analysis: ''
  });

  const [isLoading, setIsLoading] = useState(false);
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

  const generateInsights = useCallback(async () => {
    if (!topic) {
      setInsights({
        trends: 'No topic selected. Please navigate from the Home page.',
        challenges: 'Select a topic to see challenges.',
        opportunities: 'Select a topic to see opportunities.',
        recommendations: 'Select a topic to see recommendations.',
        analysis: 'Select a topic to see detailed analysis.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const [trendsRes, challengesRes, opportunitiesRes, recommendationsRes, analysisRes] = await Promise.all([
        fetchGeminiResponse(`Identify 3-4 key research trends in "${readableTopic}" for NASA space biology. Be specific and concise (3-4 sentences).`),
        fetchGeminiResponse(`List 3-4 major research challenges in "${readableTopic}" for space exploration. Be specific and concise (3-4 sentences).`),
        fetchGeminiResponse(`Describe 3-4 promising research opportunities in "${readableTopic}" for future space missions. Be specific and concise (3-4 sentences).`),
        fetchGeminiResponse(`Provide 3-4 strategic recommendations for advancing "${readableTopic}" research. Be actionable and concise (3-4 sentences).`),
        fetchGeminiResponse(`Provide a comprehensive analysis of the current state of "${readableTopic}" research in space biology, including key findings, implications, and future directions. Keep it under 150 words.`)
      ]);

      setInsights({
        trends: trendsRes,
        challenges: challengesRes,
        opportunities: opportunitiesRes,
        recommendations: recommendationsRes,
        analysis: analysisRes
      });
    } catch (err) {
      setInsights({
        trends: '⚠️ Failed to generate insights.',
        challenges: '⚠️ Failed to generate insights.',
        opportunities: '⚠️ Failed to generate insights.',
        recommendations: '⚠️ Failed to generate insights.',
        analysis: '⚠️ Failed to generate insights.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [topic, fetchGeminiResponse, readableTopic]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            AI Insights: <span className="text-cyan-400">{readableTopic}</span>
          </h2>
          <p className="text-slate-400 text-sm">AI-powered research analysis and strategic recommendations</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 hover:scale-105"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Generating...' : 'Refresh Insights'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl text-red-300">
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* Comprehensive Analysis Section */}
      <div className="mb-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <FiZap className="text-cyan-400" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-cyan-400">Comprehensive Analysis</h3>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        ) : (
          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{insights.analysis}</p>
        )}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <InsightCard
          icon={FiTrendingUp}
          title="Research Trends"
          content={insights.trends}
          isLoading={isLoading}
          color="cyan"
        />
        <InsightCard
          icon={FiAlertCircle}
          title="Key Challenges"
          content={insights.challenges}
          isLoading={isLoading}
          color="purple"
        />
        <InsightCard
          icon={FiZap}
          title="Opportunities"
          content={insights.opportunities}
          isLoading={isLoading}
          color="purple"
        />
        <InsightCard
          icon={FiTarget}
          title="Strategic Recommendations"
          content={insights.recommendations}
          isLoading={isLoading}
          color="cyan"
        />
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 text-center">
        <p className="text-xs text-slate-400">
          💡 AI-generated insights powered by Google Gemini • Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AllInsights;