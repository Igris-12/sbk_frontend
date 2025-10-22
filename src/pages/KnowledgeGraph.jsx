import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiShare2, FiLayers, FiActivity } from 'react-icons/fi';
import axios from 'axios';
import * as d3 from 'd3';

const NODE_SERVER_URL = 'https://sbk-backend-chi.vercel.app' || 'http://localhost:3000';

const KnowledgeGraph = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const svgRef = useRef(null);
  
  const readableTopic = topic ? 
      topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
      "General Knowledge";

  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

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

  // Fetch graph data from Gemini with improved prompt
  useEffect(() => {
    if (!topic) {
      setGraphData({
        nodes: [
          { id: 'center', label: 'NASA Bioscience', group: 1, description: 'Space biology research hub' },
          { id: 'n1', label: 'Space Biology', group: 2, description: 'Study of life in space' },
          { id: 'n2', label: 'Research', group: 2, description: 'Scientific investigations' }
        ],
        links: [
          { source: 'center', target: 'n1', type: 'studies' },
          { source: 'center', target: 'n2', type: 'conducts' }
        ]
      });
      return;
    }

    const graphPrompt = `Create a detailed knowledge graph for "${readableTopic}" in NASA space biology research. 
    Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
    {
      "nodes": [
        {"id": "unique_id", "label": "Node Name", "group": 1, "description": "brief description"}
      ],
      "links": [
        {"source": "id1", "target": "id2", "type": "relationship_type"}
      ]
    }
    
    REQUIREMENTS:
    - 1 central node (group 1): "${readableTopic}" - the main research focus
    - 3-4 key research areas (group 2): Major subtopics like "Microgravity Effects", "Radiation Biology", "Life Support Systems"
    - 4-6 specific experiments/studies (group 3): Real NASA experiments or missions related to each research area
    - 3-4 practical applications (group 4): Real-world outcomes, technologies, or discoveries
    
    CONNECTIONS must be MEANINGFUL:
    - Link central topic to research areas with type: "encompasses" or "studies"
    - Link research areas to specific experiments with type: "investigates" or "includes"
    - Link experiments to applications with type: "enables" or "leads_to"
    - Create some cross-connections between research areas with type: "relates_to" or "supports"
    
    Use actual NASA terminology and real examples where possible. Labels: 2-4 words max. Descriptions: 5-10 words.`;
    
    setIsLoading(true);

    fetchGeminiResponse(graphPrompt)
      .then(response => {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            // Validate and ensure proper structure
            if (parsedData.nodes && parsedData.links) {
              // Add default descriptions if missing
              parsedData.nodes = parsedData.nodes.map(node => ({
                ...node,
                description: node.description || 'Research concept'
              }));
              // Add default link types if missing
              parsedData.links = parsedData.links.map(link => ({
                ...link,
                type: link.type || 'connects'
              }));
              setGraphData(parsedData);
            } else {
              throw new Error('Invalid data structure');
            }
          } else {
            throw new Error('Invalid JSON format');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          // Fallback with meaningful structure
          setGraphData({
            nodes: [
              { id: 'center', label: readableTopic, group: 1, description: 'Main research focus' },
              { id: 'n1', label: 'Microgravity Research', group: 2, description: 'Effects of low gravity' },
              { id: 'n2', label: 'Radiation Biology', group: 2, description: 'Space radiation effects' },
              { id: 'n3', label: 'Plant Growth Exp', group: 3, description: 'Growing food in space' },
              { id: 'n4', label: 'Cell Culture Study', group: 3, description: 'Tissue behavior research' },
              { id: 'n5', label: 'Bone Density Loss', group: 3, description: 'Astronaut health monitoring' },
              { id: 'n6', label: 'Life Support Tech', group: 4, description: 'Sustainable systems' },
              { id: 'n7', label: 'Medical Advances', group: 4, description: 'Healthcare innovations' }
            ],
            links: [
              { source: 'center', target: 'n1', type: 'studies' },
              { source: 'center', target: 'n2', type: 'studies' },
              { source: 'n1', target: 'n3', type: 'investigates' },
              { source: 'n1', target: 'n4', type: 'investigates' },
              { source: 'n2', target: 'n5', type: 'investigates' },
              { source: 'n3', target: 'n6', type: 'enables' },
              { source: 'n4', target: 'n7', type: 'enables' },
              { source: 'n5', target: 'n7', type: 'leads_to' },
              { source: 'n1', target: 'n2', type: 'relates_to' }
            ]
          });
        }
      })
      .catch(() => {
        setGraphData({
          nodes: [{ id: 'error', label: 'Error Loading', group: 1, description: 'Please try again' }],
          links: []
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch insights with better prompt
    const insightsPrompt = `Provide 2-3 key insights about the research connections and interdependencies in "${readableTopic}" within NASA space biology. Focus on how different areas support each other. Keep it brief (3-4 sentences total). Be specific about relationships.`;
    
    fetchGeminiResponse(insightsPrompt)
      .then(text => setInsights(text))
      .catch(() => setInsights('Insights unavailable.'));

  }, [topic, fetchGeminiResponse, readableTopic]);

  // Render D3 graph with enhanced visuals
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Enhanced color scheme with glow effects
    const color = d3.scaleOrdinal()
      .domain([1, 2, 3, 4])
      .range(['#2dd4bf', '#06b6d4', '#8b5cf6', '#ec4899']);

    // Link type styling
    const linkStyles = {
      'studies': { dash: '0', width: 3, color: '#2dd4bf' },
      'encompasses': { dash: '0', width: 3, color: '#2dd4bf' },
      'investigates': { dash: '5,5', width: 2, color: '#06b6d4' },
      'includes': { dash: '5,5', width: 2, color: '#06b6d4' },
      'enables': { dash: '0', width: 2.5, color: '#8b5cf6' },
      'leads_to': { dash: '0', width: 2.5, color: '#8b5cf6' },
      'relates_to': { dash: '2,2', width: 1.5, color: '#ec4899' },
      'supports': { dash: '2,2', width: 1.5, color: '#ec4899' },
      'default': { dash: '0', width: 2, color: '#475569' }
    };

    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(d => {
        // Vary distance based on node groups for better hierarchy
        const sourceGroup = d.source.group || 1;
        const targetGroup = d.target.group || 1;
        if (sourceGroup === 1) return 150;
        if (Math.abs(sourceGroup - targetGroup) === 1) return 120;
        return 100;
      }))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.group === 1 ? 60 : 40));

    // Add arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#475569')
      .attr('d', 'M0,-5L10,0L0,5');

    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', d => {
        const style = linkStyles[d.type] || linkStyles.default;
        return style.color;
      })
      .attr('stroke-width', d => {
        const style = linkStyles[d.type] || linkStyles.default;
        return style.width;
      })
      .attr('stroke-dasharray', d => {
        const style = linkStyles[d.type] || linkStyles.default;
        return style.dash;
      })
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Add link labels
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(graphData.links)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#94a3b8')
      .attr('font-style', 'italic')
      .style('pointer-events', 'none')
      .text(d => d.type ? d.type.replace(/_/g, ' ') : '');

    const node = svg.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('r', d => d.group === 1 ? 35 : d.group === 2 ? 25 : d.group === 3 ? 20 : 18)
      .attr('fill', d => color(d.group))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2.5)
      .style('filter', d => {
        const colors = {1: 'rgba(45, 212, 191, 0.6)', 2: 'rgba(6, 182, 212, 0.5)', 
                        3: 'rgba(139, 92, 246, 0.4)', 4: 'rgba(236, 72, 153, 0.4)'};
        return `drop-shadow(0 0 10px ${colors[d.group]})`;
      });

    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => {
        const radius = d.group === 1 ? 35 : d.group === 2 ? 25 : d.group === 3 ? 20 : 18;
        return radius + 15;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', d => d.group === 1 ? '13px' : '10px')
      .attr('font-weight', d => d.group === 1 ? 'bold' : d.group === 2 ? '600' : 'normal')
      .style('pointer-events', 'none')
      .each(function(d) {
        // Word wrap for long labels
        const text = d3.select(this);
        const words = d.label.split(/\s+/);
        if (words.length > 2) {
          text.text('');
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', 0)
            .text(words.slice(0, 2).join(' '));
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.1em')
            .text(words.slice(2).join(' '));
        }
      });

    // Enhanced hover effects
    node.on('mouseover', function(event, d) {
      setSelectedNode(d);
      
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d => {
          const base = d.group === 1 ? 35 : d.group === 2 ? 25 : d.group === 3 ? 20 : 18;
          return base * 1.2;
        })
        .attr('stroke-width', 4);

      // Highlight connected links
      link
        .transition()
        .duration(200)
        .attr('stroke-opacity', l => 
          (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.15
        )
        .attr('stroke-width', l => {
          const style = linkStyles[l.type] || linkStyles.default;
          return (l.source.id === d.id || l.target.id === d.id) ? style.width * 1.5 : style.width;
        });

      // Highlight connected nodes
      node.select('circle')
        .transition()
        .duration(200)
        .attr('opacity', n => {
          if (n.id === d.id) return 1;
          const isConnected = graphData.links.some(l => 
            (l.source.id === d.id && l.target.id === n.id) ||
            (l.target.id === d.id && l.source.id === n.id)
          );
          return isConnected ? 1 : 0.3;
        });
    })
    .on('mouseout', function() {
      setSelectedNode(null);
      
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d => d.group === 1 ? 35 : d.group === 2 ? 25 : d.group === 3 ? 20 : 18)
        .attr('stroke-width', 2.5);

      link
        .transition()
        .duration(200)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => {
          const style = linkStyles[d.type] || linkStyles.default;
          return style.width;
        });

      node.select('circle')
        .transition()
        .duration(200)
        .attr('opacity', 1);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData]);

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
          <FiShare2 size={16} />
          <span>Knowledge Graph</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          {readableTopic}
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg">
          Explore interconnected research concepts and their meaningful relationships
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl text-red-300">
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Graph Visualization - Takes up 3 columns */}
        <div className="lg:col-span-3 bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
                <FiShare2 className="text-cyan-400" size={24} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">Interactive Graph</h2>
            </div>
            
            {/* Graph Stats Badge */}
            {graphData && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <FiLayers className="text-cyan-400" size={16} />
                  <span className="text-cyan-400 font-semibold">{graphData.nodes?.length || 0} Nodes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <FiActivity className="text-purple-400" size={16} />
                  <span className="text-purple-400 font-semibold">{graphData.links?.length || 0} Links</span>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-slate-950/50 rounded-2xl border border-slate-700">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-4"></div>
              <p className="text-slate-400 text-lg mb-2">Generating knowledge graph...</p>
              <p className="text-slate-500 text-sm">AI is mapping connections for {readableTopic}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-slate-950/50 rounded-2xl border border-cyan-500/20 overflow-hidden">
                <svg ref={svgRef} className="w-full" style={{ background: '#0f172a' }}></svg>
              </div>
              
              {/* Selected Node Info */}
              {selectedNode && (
                <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedNode.group === 1 ? 'bg-teal-400/20' :
                      selectedNode.group === 2 ? 'bg-cyan-400/20' :
                      selectedNode.group === 3 ? 'bg-purple-400/20' :
                      'bg-pink-400/20'
                    }`}>
                      <FiZap className={`${
                        selectedNode.group === 1 ? 'text-teal-400' :
                        selectedNode.group === 2 ? 'text-cyan-400' :
                        selectedNode.group === 3 ? 'text-purple-400' :
                        'text-pink-400'
                      }`} size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{selectedNode.label}</h4>
                      <p className="text-slate-300 text-sm">{selectedNode.description || 'Research concept'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-slate-950/50 backdrop-blur-sm rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FiZap className="text-cyan-400" size={14} />
                  <span><strong className="text-cyan-400">Tip:</strong> Drag nodes to explore • Hover to see connections • Different line styles show relationship types</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Graph Legend */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                <FiLayers className="text-purple-400" size={20} />
              </div>
              <h3 className="text-lg font-bold text-purple-400">Node Types</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-teal-400 flex-shrink-0 shadow-lg shadow-teal-400/50"></div>
                <span className="text-slate-300 text-sm">Central Topic</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex-shrink-0 shadow-lg shadow-cyan-400/50"></div>
                <span className="text-slate-300 text-sm">Research Areas</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex-shrink-0 shadow-lg shadow-purple-500/50"></div>
                <span className="text-slate-300 text-sm">Experiments</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-pink-500 flex-shrink-0 shadow-lg shadow-pink-500/50"></div>
                <span className="text-slate-300 text-sm">Applications</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h4 className="text-xs font-bold text-purple-300 mb-3">Connection Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-teal-400"></div>
                  <span className="text-slate-400 text-xs">Studies/Encompasses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-cyan-400" style={{borderTop: '2px dashed'}}></div>
                  <span className="text-slate-400 text-xs">Investigates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-purple-400"></div>
                  <span className="text-slate-400 text-xs">Enables/Leads To</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-pink-400" style={{borderTop: '2px dotted'}}></div>
                  <span className="text-slate-400 text-xs">Relates/Supports</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/30">
                <FiZap className="text-green-400" size={20} />
              </div>
              <h3 className="text-lg font-bold text-green-400">AI Insights</h3>
            </div>
            
            {insights ? (
              <div className="p-3 bg-slate-950/50 rounded-lg border border-green-500/20">
                <p className="text-xs text-slate-300 leading-relaxed">{insights}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400 mb-2"></div>
                <p className="text-xs text-slate-400">Loading insights...</p>
              </div>
            )}
          </div>

          {/* Graph Statistics */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
                <FiActivity className="text-cyan-400" size={20} />
              </div>
              <h3 className="text-lg font-bold text-cyan-400">Statistics</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Nodes:</span>
                <span className="text-cyan-400 font-bold text-lg">{graphData?.nodes?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Connections:</span>
                <span className="text-cyan-400 font-bold text-lg">{graphData?.links?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Complexity:</span>
                <span className={`font-bold text-lg ${
                  graphData?.links?.length > 10 ? 'text-red-400' : 
                  graphData?.links?.length > 5 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {graphData?.links?.length > 10 ? 'High' : graphData?.links?.length > 5 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Stats (visible only on mobile) */}
          {graphData && (
            <div className="lg:hidden flex gap-4">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <FiLayers className="text-cyan-400" size={16} />
                <span className="text-cyan-400 font-semibold text-sm">{graphData.nodes?.length || 0} Nodes</span>
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <FiActivity className="text-purple-400" size={16} />
                <span className="text-purple-400 font-semibold text-sm">{graphData.links?.length || 0} Links</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;