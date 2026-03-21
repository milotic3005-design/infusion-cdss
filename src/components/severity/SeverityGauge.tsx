'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CTCAE_COLORS } from '@/lib/constants';
import type { CTCAEGradeNumber } from '@/types/grading.types';

interface SeverityGaugeProps {
  grade: CTCAEGradeNumber;
  size?: number;
}

const GRADE_ANGLES: Record<CTCAEGradeNumber, number> = {
  1: -90 + 54,    // ~-36 degrees
  2: -90 + 108,   // ~18 degrees
  3: -90 + 162,   // ~72 degrees
  4: -90 + 216,   // ~126 degrees
  5: -90 + 270,   // ~180 degrees
};

const GRADE_LABELS: Record<CTCAEGradeNumber, string> = {
  1: 'MILD',
  2: 'MODERATE',
  3: 'SEVERE',
  4: 'CRITICAL',
  5: 'FATAL',
};

export function SeverityGauge({ grade, size = 200 }: SeverityGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;
    const innerRadius = radius - 16;

    const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

    // Background arcs for each grade
    const arcGenerator = d3.arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    const gradeRanges: { grade: CTCAEGradeNumber; start: number; end: number }[] = [
      { grade: 1, start: -Math.PI / 2, end: -Math.PI / 2 + Math.PI * 54 / 135 },
      { grade: 2, start: -Math.PI / 2 + Math.PI * 54 / 135, end: -Math.PI / 2 + Math.PI * 108 / 135 },
      { grade: 3, start: -Math.PI / 2 + Math.PI * 108 / 135, end: -Math.PI / 2 + Math.PI * 162 / 135 },
      { grade: 4, start: -Math.PI / 2 + Math.PI * 162 / 135, end: -Math.PI / 2 + Math.PI * 216 / 135 },
      { grade: 5, start: -Math.PI / 2 + Math.PI * 216 / 135, end: Math.PI / 2 + Math.PI },
    ];

    gradeRanges.forEach(({ grade: g, start, end }) => {
      svg.select('g').append('path')
        .attr('d', arcGenerator({ startAngle: start, endAngle: end }) || '')
        .attr('fill', CTCAE_COLORS[g])
        .attr('opacity', 0.25);
    });

    // Active arc (filled to current grade)
    const activeEnd = gradeRanges[grade - 1].end;
    g.append('path')
      .attr('d', arcGenerator({ startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 }) || '')
      .attr('fill', CTCAE_COLORS[grade])
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(-Math.PI / 2, activeEnd);
        return (t: number) => arcGenerator({ startAngle: -Math.PI / 2, endAngle: interpolate(t) }) || '';
      });

    // Needle
    const needleAngle = GRADE_ANGLES[grade];
    const needleLength = innerRadius - 10;

    const needle = g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -needleLength)
      .attr('stroke', '#1d1d1f')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('transform', 'rotate(-90)');

    needle.transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('transform', `rotate(${needleAngle})`);

    // Center dot
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', '#1d1d1f');

    // Grade number
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .attr('class', 'severity-gauge')
      .attr('font-size', '36px')
      .attr('fill', CTCAE_COLORS[grade])
      .text(grade);

    // Label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 44)
      .attr('class', 'severity-gauge')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .attr('letter-spacing', '0.1em')
      .text(GRADE_LABELS[grade]);

  }, [grade, size]);

  return (
    <div className="flex-shrink-0" role="img" aria-label={`Severity gauge showing Grade ${grade}: ${GRADE_LABELS[grade]}`}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="severity-gauge"
      />
    </div>
  );
}
