import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as d3 from 'd3';

const NODE_SERVER_URL = 'http://localhost:3000';

const KnowledgeGraph = () => {
  const { topic } = useParams();
  const svgRef = useRef(null);
  
  const readableTopic = topic ? 
      topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
      "General Knowledge";

  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState('');

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

  // Fetch graph data from Gemini
  useEffect(() => {
    if (!topic) {
      setGraphData({
        nodes: [
          { id: 'center', label: 'NASA Bioscience', group: 1 },
          { id: 'n1', label: 'Space Biology', group: 2 },
          { id: 'n2', label: 'Research', group: 2 }
        ],
        links: [
          { source: 'center', target: 'n1' },
          { source: 'center', target: 'n2' }
        ]
      });
      return;
    }

    const graphPrompt = `Create a knowledge graph for "${readableTopic}" in NASA space biology research. 
    Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
    {
      "nodes": [
        {"id": "unique_id", "label": "Node Name", "group": 1}
      ],
      "links": [
        {"source": "id1", "target": "id2"}
      ]
    }
    
    Include:
    - 1 central node (group 1) for "${readableTopic}"
    - 8-12 related nodes (groups 2-4) for: experiments, organisms, technologies, missions, researchers, findings
    - Links connecting related concepts
    
    Use short labels (2-3 words max). Make it scientifically accurate.`;
    
    setIsLoading(true);

    fetchGeminiResponse(graphPrompt)
      .then(response => {
        try {
          // Extract JSON from response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            setGraphData(parsedData);
          } else {
            throw new Error('Invalid JSON format');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          // Fallback data
          setGraphData({
            nodes: [
              { id: 'center', label: readableTopic, group: 1 },
              { id: 'n1', label: 'Research Area 1', group: 2 },
              { id: 'n2', label: 'Research Area 2', group: 2 },
              { id: 'n3', label: 'Experiment', group: 3 },
              { id: 'n4', label: 'Mission', group: 3 }
            ],
            links: [
              { source: 'center', target: 'n1' },
              { source: 'center', target: 'n2' },
              { source: 'n1', target: 'n3' },
              { source: 'n2', target: 'n4' }
            ]
          });
        }
      })
      .catch(() => {
        setGraphData({
          nodes: [{ id: 'error', label: 'Error Loading', group: 1 }],
          links: []
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch insights
    const insightsPrompt = `Provide 3-4 key insights about the knowledge connections in "${readableTopic}" research. Keep it brief (2-3 sentences total).`;
    
    fetchGeminiResponse(insightsPrompt)
      .then(text => setInsights(text))
      .catch(() => setInsights('Insights unavailable.'));

  }, [topic, fetchGeminiResponse, readableTopic]);

  // Render D3 graph
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain([1, 2, 3, 4])
      .range(['#2dd4bf', '#06b6d4', '#8b5cf6', '#ec4899']);

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Add links
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Add nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles
    node.append('circle')
      .attr('r', d => d.group === 1 ? 30 : 20)
      .attr('fill', d => color(d.group))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.5))');

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => d.group === 1 ? 45 : 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', d => d.group === 1 ? '14px' : '11px')
      .attr('font-weight', d => d.group === 1 ? 'bold' : 'normal')
      .style('pointer-events', 'none');

    // Add hover effects
    node.on('mouseover', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d => d.group === 1 ? 35 : 25);
    })
    .on('mouseout', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d => d.group === 1 ? 30 : 20);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
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
    <div className="h-full p-6 bg-slate-900">
      <h2 className="text-3xl font-bold text-slate-100 mb-4 border-b border-teal-400 pb-2">
        Knowledge Graph: {readableTopic}
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-900 border border-red-500 rounded-lg text-red-300">
          **API Error:** {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Main Graph Visualization */}
        <div className="col-span-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-2xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px] text-slate-400">
              <div className="text-center">
                <div className="animate-pulse mb-4">Generating knowledge graph...</div>
                <div className="text-sm">AI is mapping connections for {readableTopic}</div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <svg ref={svgRef} className="w-full" style={{ background: '#0f172a', borderRadius: '8px' }}></svg>
              <div className="mt-4 text-xs text-slate-400 text-center">
                💡 Drag nodes to explore • Hover for details • AI-generated connections
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Insights */}
        <div className="col-span-4 space-y-6">
          {/* Graph Legend */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Graph Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-400"></div>
                <span className="text-slate-300">Main Topic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-400"></div>
                <span className="text-slate-300">Sub Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                <span className="text-slate-300">Research Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                <span className="text-slate-300">Related Concepts</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-bold text-teal-400 mb-3">🤖 AI Insights</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insights || 'Loading insights...'}
            </p>
          </div>

          {/* Graph Stats */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Graph Statistics</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nodes:</span>
                <span className="text-teal-400 font-bold">{graphData?.nodes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Connections:</span>
                <span className="text-teal-400 font-bold">{graphData?.links?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Complexity:</span>
                <span className="text-teal-400 font-bold">
                  {graphData?.links?.length > 10 ? 'High' : graphData?.links?.length > 5 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;