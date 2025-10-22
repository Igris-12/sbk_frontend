import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiCalendar, FiUsers, FiTrendingUp, FiBook, FiAward, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import plant1 from '../assets/plant-1.png';
import plant2 from '../assets/plant-2.png';

const NODE_SERVER_URL = 'https://sbk-backend-chi.vercel.app' || 'http://localhost:3000';

const PublicationsExplorer = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  
  const readableTopic = topic ? 
      topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
      "General Publications";

  const [tableData, setTableData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [detailedSummary, setDetailedSummary] = useState('');
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);
  const [imageUrl1, setImageUrl1] = useState(plant1);
  const [imageUrl2, setImageUrl2] = useState(plant2);
  const [isImageLoading, setIsImageLoading] = useState(false);
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

  // Fetch table data based on topic
  useEffect(() => {
    if (!topic) {
      setTableData([
        { year: 2023, author: 'Smith et al.', mission: 'ISS-67', impact: 3.1, species: 10, citations: 13 },
        { year: 2022, author: 'Johnson et al.', mission: 'Artemis I', impact: 2.8, species: 8, citations: 11 },
      ]);
      return;
    }

    const tablePrompt = `Generate a table of 7 recent research publications related to "${readableTopic}". 
    Return ONLY a JSON array with this exact structure (no additional text):
    [
      {"year": number, "author": "string", "mission": "string", "impact": number, "species": number, "citations": number}
    ]
    Use realistic data for space biology research.`;
    
    setIsTableLoading(true);

    fetchGeminiResponse(tablePrompt)
      .then(response => {
        try {
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            setTableData(parsedData);
          } else {
            throw new Error('Invalid JSON format');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setTableData([
            { year: 2023, author: 'Research Team', mission: readableTopic, impact: 3.2, species: 12, citations: 15 },
            { year: 2022, author: 'Science Group', mission: readableTopic, impact: 2.9, species: 9, citations: 11 },
          ]);
        }
      })
      .catch(() => {
        setTableData([
          { year: 2023, author: 'Error loading', mission: 'N/A', impact: 0, species: 0, citations: 0 }
        ]);
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  }, [topic, fetchGeminiResponse, readableTopic]);

  // Fetch brief AI Summary
  useEffect(() => {
    if (!topic) {
      setAiSummary("No topic selected.");
      return;
    }

    const summaryPrompt = `Provide a VERY BRIEF summary for "${readableTopic}" publications with these sections (2 points each, one line per point):

**Results:**
- [key finding 1]
- [key finding 2]

**Conclusions:**
- [conclusion 1]
- [conclusion 2]

**Linked Missions:**
- [mission 1]
- [mission 2]

Keep it extremely concise.`;
    
    setIsSummaryLoading(true);

    fetchGeminiResponse(summaryPrompt)
      .then(geminiResponseText => {
        setAiSummary(geminiResponseText);
      })
      .catch(() => {
        setAiSummary("⚠️ Could not load AI summary.");
      })
      .finally(() => {
        setIsSummaryLoading(false);
      });
  }, [topic, fetchGeminiResponse, readableTopic]);

  // Validate and test if image URL is accessible
  const validateImageUrl = async (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 5000);
    });
  };

  // Fetch dynamic images based on topic
  useEffect(() => {
    if (!topic) {
      setImageUrl1(plant1);
      setImageUrl2(plant2);
      return;
    }

    const imagePrompt = `Provide 2 relevant, WORKING image URLs for "${readableTopic}" research. 
    IMPORTANT: Use only reliable sources like:
    - NASA Images: https://images.nasa.gov/
    - Unsplash: https://images.unsplash.com/
    
    Return ONLY a JSON array with this exact structure (no additional text, no markdown):
    [
      {"url": "https://images.unsplash.com/...", "description": "brief description"},
      {"url": "https://images.unsplash.com/...", "description": "brief description"}
    ]
    
    Example URLs that work:
    - https://images.unsplash.com/photo-1614728894747-a83421e2b9c9 (space)
    - https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45 (plants)
    
    Make sure URLs are direct image links, not webpage links.`;
    
    setIsImageLoading(true);
    console.log('🔍 Fetching images for:', readableTopic);

    fetchGeminiResponse(imagePrompt)
      .then(async response => {
        console.log('📥 Raw Gemini response:', response);
        
        try {
          let jsonMatch = response.match(/\[[\s\S]*\]/);
          
          if (!jsonMatch) {
            const codeBlockMatch = response.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
            if (codeBlockMatch) {
              jsonMatch = [codeBlockMatch[1]];
            }
          }
          
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ Parsed image data:', parsedData);
            
            if (parsedData.length >= 2) {
              const url1Valid = await validateImageUrl(parsedData[0].url);
              const url2Valid = await validateImageUrl(parsedData[1].url);
              
              console.log('🔗 URL1 valid:', url1Valid, parsedData[0].url);
              console.log('🔗 URL2 valid:', url2Valid, parsedData[1].url);
              
              if (url1Valid) {
                setImageUrl1(parsedData[0].url);
                console.log('✅ Image 1 updated');
              } else {
                console.warn('⚠️ Image 1 failed validation, keeping default');
              }
              
              if (url2Valid) {
                setImageUrl2(parsedData[1].url);
                console.log('✅ Image 2 updated');
              } else {
                console.warn('⚠️ Image 2 failed validation, keeping default');
              }
            } else {
              console.warn('⚠️ Not enough images in response');
            }
          } else {
            console.error('❌ No JSON found in response');
          }
        } catch (parseError) {
          console.error('❌ Image parse error:', parseError);
          console.error('Response was:', response);
        }
      })
      .catch((err) => {
        console.error('❌ Failed to fetch images:', err);
      })
      .finally(() => {
        setIsImageLoading(false);
      });
  }, [topic, fetchGeminiResponse, readableTopic]);

  // Handle AI Summarizer button click
  const handleAiSummarize = async () => {
    setIsDetailedLoading(true);
    setDetailedSummary('');

    const detailedPrompt = `Provide a detailed but concise summary (3-4 sentences) about "Arabidopsis Thaliana Growth in Lunar Regolith Simulant" in the context of "${readableTopic}". Include key findings and implications.`;

    try {
      const response = await fetchGeminiResponse(detailedPrompt);
      setDetailedSummary(response);
    } catch (err) {
      setDetailedSummary("Failed to generate summary.");
    } finally {
      setIsDetailedLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-xl text-slate-100 font-medium py-3 px-6 rounded-xl hover:bg-slate-700/50 transition-all border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <FiArrowLeft size={20} /> Back to Home
        </button>
      </div>

      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl shadow-cyan-500/10 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-4">
          <FiBook size={16} />
          <span>Publications Explorer</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          {readableTopic}
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg">
          Explore recent research publications and their impact on space biology
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl text-red-300">
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Publications Table */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
              <FiBook className="text-cyan-400" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">Recent Publications</h2>
          </div>

          {isTableLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-4"></div>
              <p className="text-slate-400 text-lg">Loading publications...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-cyan-500/30">
                    <th className="p-3 text-cyan-400 font-semibold">Year</th>
                    <th className="p-3 text-cyan-400 font-semibold">Author</th>
                    <th className="p-3 text-cyan-400 font-semibold hidden sm:table-cell">Mission</th>
                    <th className="p-3 text-cyan-400 font-semibold">Impact</th>
                    <th className="p-3 text-cyan-400 font-semibold hidden md:table-cell">Species</th>
                    <th className="p-3 text-cyan-400 font-semibold">Citations</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr 
                      key={i} 
                      className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3 text-slate-300 font-medium">{row.year}</td>
                      <td className="p-3 text-slate-300">{row.author}</td>
                      <td className="p-3 text-slate-400 hidden sm:table-cell">{row.mission}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          <FiTrendingUp size={12} />
                          {row.impact}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 hidden md:table-cell">{row.species}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium">
                          <FiAward size={12} />
                          {row.citations}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Summary Panel */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl border border-green-500/30">
              <FiZap className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-green-400">AI Insights</h3>
          </div>
          
          {isSummaryLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-400 mb-4"></div>
              <p className="text-slate-400">Generating insights...</p>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-green-500/30 whitespace-pre-wrap">
              <div className="text-slate-300 leading-relaxed text-sm">{aiSummary}</div>
            </div>
          )}
        </div>
      </div>

      {/* Image Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Image Card 1 */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs mb-4">
            <FiFileText size={14} />
            <span>Research Visualization</span>
          </div>
          
          {isImageLoading ? (
            <div className="rounded-2xl w-full h-64 bg-slate-800/50 animate-pulse flex items-center justify-center border border-slate-700">
              <span className="text-slate-500 text-sm">Loading image...</span>
            </div>
          ) : (
            <>
              <img 
                src={imageUrl1} 
                className="rounded-2xl w-full h-64 object-cover border border-slate-700/50 mb-4" 
                alt="Research Image 1"
                onError={(e) => { 
                  console.warn('⚠️ Image 1 failed to load, using fallback');
                  e.target.src = plant1; 
                }}
              />
              {imageUrl1 !== plant1 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">AI-Generated Image</span>
                </div>
              )}
            </>
          )}
          <p className="text-xs text-slate-400 mb-2">{readableTopic} Research</p>
          <p className="text-slate-100 font-semibold text-lg">Scientific Study Visualization</p>
        </div>

        {/* Image Card 2 with Profile */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs mb-4">
            <FiUsers size={14} />
            <span>Research Team</span>
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            {isImageLoading ? (
              <div className="w-16 h-16 rounded-full bg-slate-800/50 animate-pulse border border-slate-700"></div>
            ) : (
              <div className="relative">
                <img 
                  src={imageUrl2} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30" 
                  alt="Research Image 2"
                  onError={(e) => { 
                    console.warn('⚠️ Image 2 failed to load, using fallback');
                    e.target.src = plant2; 
                  }}
                />
                {imageUrl2 !== plant2 && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
                )}
              </div>
            )}
            <div className="flex-1">
              <p className="text-slate-100 font-semibold text-base">Research Profile</p>
              <p className="text-xs text-slate-400">Space Biology Team</p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
            <p className="text-sm text-slate-300 leading-relaxed">
              Collaborative research initiative exploring the boundaries of space biology and its applications for future missions.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Publication Card */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs mb-4">
              <FiZap size={14} />
              <span>Featured Study</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Arabidopsis Thaliana Growth in Lunar Regolith Simulant
            </h3>
            
            {detailedSummary ? (
              <div className="p-4 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <strong className="text-cyan-400 text-sm uppercase tracking-wider">AI Analysis</strong>
                </div>
                <p className="text-slate-300 leading-relaxed">{detailedSummary}</p>
              </div>
            ) : (
              <p className="text-slate-400 mb-4 leading-relaxed">
                Click the AI Summarizer button to generate a comprehensive analysis of this groundbreaking research publication exploring plant growth in simulated lunar soil conditions...
              </p>
            )}

            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={handleAiSummarize}
                disabled={isDetailedLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDetailedLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FiZap size={20} />
                    <span>AI Summarizer</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="flex items-center gap-1">
                  <FiCalendar size={16} />
                  <span>2023</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers size={16} />
                  <span>Multi-Institution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationsExplorer;