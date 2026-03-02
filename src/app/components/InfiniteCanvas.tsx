import { useState, useRef, useEffect } from "react";
import { NoteNode, NoteNodeData } from "./NoteNode";
import { ConnectionLine, Connection } from "./ConnectionLine";
import { NoteEditor } from "./NoteEditor";
import { LuPlus } from "react-icons/lu"; // Updated import
import { Button } from "./ui/button";

interface InfiniteCanvasProps {
  nodes: NoteNodeData[];
  connections: Connection[];
  onNodesChange: (nodes: NoteNodeData[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
}

export function InfiniteCanvas({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
}: InfiniteCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<
    string | null
  >(null);
  const [connectingFrom, setConnectingFrom] = useState<
    string | null
  >(null);
  const [tempConnection, setTempConnection] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(
        Math.max(0.1, scale + delta),
        3,
      );
      setScale(newScale);
    } else {
      // Pan
      setPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 1 ||
      (e.button === 0 && e.target === canvasRef.current)
    ) {
      // Middle mouse button or clicking on empty canvas
      setIsPanning(true);
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && panRef.current) {
      const deltaX = e.clientX - panRef.current.startX;
      const deltaY = e.clientY - panRef.current.startY;
      setPan({
        x: panRef.current.panX + deltaX,
        y: panRef.current.panY + deltaY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panRef.current = null;
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener(
          "mousemove",
          handleMouseMove,
        );
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isPanning]);

  const handleNodePositionChange = (
    id: string,
    x: number,
    y: number,
  ) => {
    onNodesChange(
      nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node,
      ),
    );
  };

  const handleDeleteNode = (id: string) => {
    onNodesChange(nodes.filter((node) => node.id !== id));
    onConnectionsChange(
      connections.filter(
        (conn) => conn.from !== id && conn.to !== id,
      ),
    );
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
  };

  const handleColorChange = (id: string, color: string) => {
    onNodesChange(
      nodes.map((node) =>
        node.id === id ? { ...node, color } : node,
      ),
    );
  };

  const handleConnectionStart = (id: string) => {
    setConnectingFrom(id);
  };

  const handleConnectionEnd = (toId: string) => {
    if (connectingFrom && connectingFrom !== toId) {
      // Check if connection already exists
      const existingConnection = connections.find(
        (conn) =>
          conn.from === connectingFrom && conn.to === toId,
      );

      if (!existingConnection) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: toId,
        };
        onConnectionsChange([...connections, newConnection]);
      }
    }
    setConnectingFrom(null);
    setTempConnection(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (connectingFrom) {
      // Update temp connection line position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setTempConnection({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale,
        });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (connectingFrom) {
      setConnectingFrom(null);
      setTempConnection(null);
    }
  };

  const handleSaveNote = (
    id: string,
    title: string,
    content: string,
  ) => {
    onNodesChange(
      nodes.map((node) =>
        node.id === id ? { ...node, title, content } : node,
      ),
    );
  };

  const handleAddNode = () => {
    const newNode: NoteNodeData = {
      id: `node-${Date.now()}`,
      title: "New Note",
      content:
        "Click to edit this note. You can drag it around the canvas and connect it to other notes.",
      x: -pan.x / scale + 100,
      y: -pan.y / scale + 100,
      color: "#3b82f6",
    };
    onNodesChange([...nodes, newNode]);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gray-950"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1f2937 1px, transparent 1px),
            linear-gradient(to bottom, #1f2937 1px, transparent 1px)
          `,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* SVG for connections */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            {connections.map((connection) => {
              const fromNode = nodes.find(
                (n) => n.id === connection.from,
              );
              const toNode = nodes.find(
                (n) => n.id === connection.to,
              );

              if (!fromNode || !toNode) return null;

              return (
                <ConnectionLine
                  key={connection.id}
                  fromX={fromNode.x}
                  fromY={fromNode.y}
                  toX={toNode.x}
                  toY={toNode.y}
                  color={fromNode.color}
                  onDelete={() => {
                    onConnectionsChange(
                      connections.filter((c) => c.id !== connection.id)
                    );
                  }}
                />
              );
            })}

            {/* Temporary connection line while dragging */}
            {connectingFrom &&
              tempConnection &&
              (() => {
                const fromNode = nodes.find(
                  (n) => n.id === connectingFrom,
                );
                if (!fromNode) return null;

                return (
                  <ConnectionLine
                    key="temp-connection"
                    fromX={fromNode.x}
                    fromY={fromNode.y}
                    toX={tempConnection.x}
                    toY={tempConnection.y}
                    color={fromNode.color}
                  />
                );
              })()}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <NoteNode
              key={node.id}
              node={node}
              onPositionChange={handleNodePositionChange}
              onDelete={handleDeleteNode}
              onClick={handleNodeClick}
              onColorChange={handleColorChange}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              scale={scale}
              isConnecting={connectingFrom !== null}
            />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="absolute bottom-8 right-8">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 transition-all"
          onClick={handleAddNode}
          style={{
            boxShadow: "0 0 20px #3b82f660, 0 0 40px #3b82f620",
          }}
        >
          <LuPlus className="w-6 h-6" /> {/* Updated Icon Usage */}
        </Button>
      </div>

      {/* Controls Info */}
      <div
        className="absolute bottom-8 left-8 bg-gray-900 border border-gray-700 rounded-lg shadow-md px-4 py-3 text-sm text-gray-400"
        style={{
          boxShadow: "0 0 20px #00000040",
        }}
      >
        <div className="space-y-1">
          <div>🖱️ Click canvas to pan</div>
          <div>🎯 Drag nodes to move</div>
          <div>⌨️ Ctrl + Scroll to zoom</div>
          <div>💡 Click node to edit</div>
          <div>🔗 Right-click drag to connect</div>
          <div>❌ Click connection to delete</div>
        </div>
      </div>

      {/* Note Editor Overlay */}
      {selectedNodeId && (
        <NoteEditor
          node={nodes.find((n) => n.id === selectedNodeId)!}
          onClose={() => setSelectedNodeId(null)}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}