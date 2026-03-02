import { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { NoteNodeData } from './components/NoteNode';
import { Connection } from './components/ConnectionLine';

// Sample initial data
const initialNodes: NoteNodeData[] = [
  {
    id: 'node-1',
    title: 'Project Overview',
    content: 'This is the main idea for our new project. We need to break this down into smaller, actionable tasks.',
    x: 100,
    y: 100,
    color: '#3b82f6',
  },
  {
    id: 'node-2',
    title: 'Research Phase',
    content: 'Conduct market research and competitor analysis. Identify key features and user needs.',
    x: 450,
    y: 50,
    color: '#8b5cf6',
  },
  {
    id: 'node-3',
    title: 'Design System',
    content: 'Create a comprehensive design system with components, colors, and typography guidelines.',
    x: 450,
    y: 250,
    color: '#ec4899',
  },
  {
    id: 'node-4',
    title: 'Development',
    content: 'Build the core functionality using React and TypeScript. Implement the main features and user flows.',
    x: 800,
    y: 100,
    color: '#10b981',
  },
  {
    id: 'node-5',
    title: 'Testing & QA',
    content: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing.',
    x: 800,
    y: 300,
    color: '#f59e0b',
  },
  {
    id: 'node-6',
    title: 'Launch Strategy',
    content: 'Plan the product launch, marketing campaigns, and user onboarding experience.',
    x: 1150,
    y: 200,
    color: '#ef4444',
  },
];

const initialConnections: Connection[] = [
  { id: 'conn-1', from: 'node-1', to: 'node-2' },
  { id: 'conn-2', from: 'node-1', to: 'node-3' },
  { id: 'conn-3', from: 'node-2', to: 'node-4' },
  { id: 'conn-4', from: 'node-3', to: 'node-4' },
  { id: 'conn-5', from: 'node-4', to: 'node-5' },
  { id: 'conn-6', from: 'node-5', to: 'node-6' },
];

export default function App() {
  const [nodes, setNodes] = useState<NoteNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      <Toolbar />
      <div className="flex-1 relative">
        <InfiniteCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
        />
      </div>
    </div>
  );
}