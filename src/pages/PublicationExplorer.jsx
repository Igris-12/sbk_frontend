import React, { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import plant1 from '../assets/plant-1.png';
import plant2 from '../assets/plant-2.png';

const NODE_SERVER_URL = 'https://sbk-backend-chi.vercel.app';

const Tag = ({ text, active }) => (
  <button className={`px-3 py-1 text-xs rounded-md font-medium ${
    active 
       ? 'bg-teal-400 text-slate-900' 
       : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
  }`}>
    {text}
  </button>
);

const PublicationsExplorer = () => {
  const { topic } = useParams();
  
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

  // Fetch brief AI Summary for right panel
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
      // Timeout after 5 seconds
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
          // Try to extract JSON from response
          let jsonMatch = response.match(/\[[\s\S]*\]/);
          
          if (!jsonMatch) {
            // Try to find JSON even if wrapped in markdown code blocks
            const codeBlockMatch = response.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
            if (codeBlockMatch) {
              jsonMatch = [codeBlockMatch[1]];
            }
          }
          
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ Parsed image data:', parsedData);
            
            if (parsedData.length >= 2) {
              // Validate both URLs
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
    <div className="flex-1 bg-slate-900 p-6"> 
      <h2 className="text-3xl font-bold text-slate-100 mb-4 border-b border-teal-400 pb-2">
          Publications Explorer: {readableTopic}
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-900 border border-red-500 rounded-lg text-red-300">
          **API Error:** {error}
        </div>
      )}
      

      <div className="grid grid-cols-12 gap-6">
        {/* Left Section: Keywords and Table */}
        <div className="col-span-4">
          
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 shadow-xl"> 
            {isTableLoading ? (
              <div className="text-center py-8 text-slate-400">Loading publications...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                      <th key={key} className="p-2 font-normal">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => ( 
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors"> 
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Middle Section: Image Cards */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-1 shadow-xl"> 
            {isImageLoading ? (
              <div className="rounded-md w-full h-40 bg-slate-700 animate-pulse flex items-center justify-center">
                <span className="text-slate-500 text-sm">Loading image...</span>
              </div>
            ) : (
              <>
                <img 
                  src={imageUrl1} 
                  className="rounded-md w-full h-40 object-cover" 
                  alt="Research Image 1"
                  onError={(e) => { 
                    console.warn('⚠️ Image 1 failed to load, using fallback');
                    e.target.src = plant1; 
                  }}
                />
                {imageUrl1 !== plant1 && (
                  <div className="mt-1 text-xs text-teal-400">✓ Dynamic image loaded</div>
                )}
              </>
            )}
            <p className="text-xs text-slate-400 mt-2">{readableTopic} Research</p>
            <p className="text-slate-100 font-semibold">Scientific Study</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-[2] shadow-xl"> 
            <h3 className="text-base font-bold text-slate-100 mb-2">Arabidopsis Thaliana Growth in Lunar Regolith Simulant</h3>
            
            {detailedSummary ? (
              <p className="text-sm text-slate-300 mb-4">{detailedSummary}</p>
            ) : (
              <p className="text-sm text-slate-400 mb-4">
                Click AI Summarizer to generate a detailed analysis of this research publication...
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {isImageLoading ? (
                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
              ) : (
                <div className="relative">
                  <img 
                    src={imageUrl2} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-700" 
                    alt="Research Image 2"
                    onError={(e) => { 
                      console.warn('⚠️ Image 2 failed to load, using fallback');
                      e.target.src = plant2; 
                    }}
                  />
                  {imageUrl2 !== plant2 && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border border-slate-800"></div>
                  )}
                </div>
              )}
              <button 
                onClick={handleAiSummarize}
                disabled={isDetailedLoading}
                className="bg-teal-400 text-slate-900 font-bold py-2 px-5 rounded-lg text-sm hover:bg-teal-300 transition-colors disabled:opacity-50"
              >
                {isDetailedLoading ? 'Generating...' : 'AI Summarizer'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Section: AI Summary */}
        <div className="col-span-4 bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-xl"> 
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            AI Summary: {readableTopic}
          </h3>
          
          {isSummaryLoading ? (
            <div className="text-center py-8 text-slate-400">
              <div className="animate-pulse">Generating summary...</div>
            </div>
          ) : (
            <div className="text-sm space-y-4 text-slate-300 whitespace-pre-wrap">
              {aiSummary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationsExplorer;