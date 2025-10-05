import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { FiTrendingUp, FiAlertCircle, FiZap, FiTarget, FiRefreshCw } from 'react-icons/fi';

const NODE_SERVER_URL = 'http://localhost:3000';

const InsightCard = ({ icon: Icon, title, content, isLoading, color }) => (
  <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl hover:shadow-${color}-400/10 transition-all duration-300`}>
    <div className="flex items-start gap-4 mb-3">
      <div className={`p-3 rounded-lg bg-${color}-400/10 border border-${color}-400/30`}>
        <Icon className={`text-${color}-400`} size={24} />
      </div>
      <h3 className={`text-lg font-bold text-${color}-400 flex-1`}>{title}</h3>
    </div>
    {isLoading ? (
      <div className="animate-pulse space-y-2">
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
      // Parallel API calls for better performance
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
    <div className="p-6 h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 border-b border-teal-400 pb-2">
        <h2 className="text-3xl font-bold text-slate-100">
          AI Insights: {readableTopic}
        </h2>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="flex items-center gap-2 bg-teal-400 text-slate-900 font-bold py-2 px-4 rounded-lg hover:bg-teal-300 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Generating...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-900 border border-red-500 rounded-lg text-red-300">
          **API Error:** {error}
        </div>
      )}

      {/* Comprehensive Analysis Section */}
      <div className="mb-6 bg-gradient-to-br from-slate-800/70 to-slate-800/40 p-6 rounded-xl border border-teal-400/30 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-teal-400/10 border border-teal-400/30">
            <FiZap className="text-teal-400" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-teal-400">Comprehensive Analysis</h3>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        ) : (
          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{insights.analysis}</p>
        )}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          icon={FiTrendingUp}
          title="Research Trends"
          content={insights.trends}
          isLoading={isLoading}
          color="teal"
        />
        <InsightCard
          icon={FiAlertCircle}
          title="Key Challenges"
          content={insights.challenges}
          isLoading={isLoading}
          color="orange"
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
      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-center">
        <p className="text-xs text-slate-400">
          💡 AI-generated insights powered by Google Gemini • Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AllInsights;