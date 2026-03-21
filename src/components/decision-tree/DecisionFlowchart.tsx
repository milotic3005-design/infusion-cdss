'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { DecisionNode } from './DecisionNode';
import { ActionNode } from './ActionNode';
import type { DecisionNodeData, DecisionEdgeData } from '@/types/decision.types';
import { CTCAE_COLORS } from '@/lib/constants';

interface DecisionFlowchartProps {
  nodes: DecisionNodeData[];
  edges: DecisionEdgeData[];
}

const nodeTypes: NodeTypes = {
  decision: DecisionNode,
  action: ActionNode,
};

function getLayoutedElements(
  inputNodes: DecisionNodeData[],
  inputEdges: DecisionEdgeData[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, marginx: 20, marginy: 20 });

  inputNodes.forEach((node) => {
    g.setNode(node.id, { width: 180, height: 80 });
  });

  inputEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const nodes: Node[] = inputNodes.map((node) => {
    const pos = g.node(node.id);
    const isActionType = node.type === 'action' || node.type === 'terminal';
    return {
      id: node.id,
      type: isActionType ? 'action' : 'decision',
      data: { ...node } as Record<string, unknown>,
      position: { x: pos.x - 90, y: pos.y - 40 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  const edges: Edge[] = inputEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated,
    style: {
      stroke: edge.animated
        ? CTCAE_COLORS[inputNodes.find((n) => n.id === edge.source)?.grade ?? 1]
        : '#d1d5db',
      strokeWidth: edge.animated ? 2 : 1,
    },
    labelStyle: { fontSize: 11, fontWeight: 600, fill: '#6b7280' },
  }));

  return { nodes, edges };
}

export function DecisionFlowchart({ nodes: inputNodes, edges: inputEdges }: DecisionFlowchartProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(inputNodes, inputEdges),
    [inputNodes, inputEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onInit={onInit}
      nodeTypes={nodeTypes}
      fitView
      panOnDrag
      zoomOnScroll
      minZoom={0.5}
      maxZoom={2}
      nodesDraggable={false}
    >
      <Background color="#e5e7eb" gap={16} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
