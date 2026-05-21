import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ComplianceIssue } from '../types';

interface QuantumEntropyChartProps {
  score: number;
  issues: ComplianceIssue[];
  efficiency: number;
}

export default function QuantumEntropyChart({ score, issues, efficiency }: QuantumEntropyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Data generation: mapping issues to entropy spikes
    const data = [
      { x: 0, y: 50 },
      ...issues.map((_, i) => ({
        x: (i + 1) * (width / (issues.length + 1)),
        y: 50 + Math.random() * 80
      })),
      { x: width, y: 50 + (1 - efficiency) * 100 }
    ];

    const x = d3.scaleLinear()
      .domain([0, width])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 150])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);

    const area = d3.area<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y0(height - margin.bottom)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);

    // Gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "entropy-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0);

    // Area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#entropy-gradient)")
      .attr("d", area);

    // Path
    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#06b6d4")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Animation
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    // Highlight points for issues
    svg.selectAll(".dot")
      .data(issues)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => x((i + 1) * (width / (issues.length + 1))))
      .attr("cy", (_, i) => y(50 + Math.random() * 40))
      .attr("r", 0)
      .attr("fill", "#f59e0b")
      .transition()
      .delay((_, i) => 1000 + i * 200)
      .attr("r", 3)
      .attr("class", "animate-pulse");

  }, [issues, efficiency]);

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-all rounded-full" />
      <svg 
        ref={svgRef} 
        width="100%" 
        height="200" 
        viewBox="0 0 300 200" 
        className="relative z-10"
      />
      <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-500/50 uppercase tracking-tighter">
        Thermodynamic Flux
      </div>
    </div>
  );
}
