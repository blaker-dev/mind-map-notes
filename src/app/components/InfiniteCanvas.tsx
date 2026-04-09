import { useState, useRef, useEffect } from "react";
import { NoteNode, NoteNodeData } from "./NoteNode";
import { ConnectionLine, Connection } from "./ConnectionLine";
import { NoteEditor } from "./NoteEditor";
import { LuPlus } from "react-icons/lu";
import { Button } from "./ui/button";

interface InfiniteCanvasProps {
  nodes: NoteNodeData[];
  connections: Connection[];
  onNodesChange: (nodes: NoteNodeData[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  // Zoom Props
  scale: number;
  onScaleChange: (scale: number) => void;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  isLinkMode: boolean;
}

export function InfiniteCanvas({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  scale,           
  onScaleChange,   
  pan,             
  onPanChange,
  isLinkMode
}: InfiniteCanvasProps) {
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

  // Initial scroll data
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Adding touch support for pinch and zoom
  const touchRef = useRef<{
    initialDistance: number | null;
    initialScale: number;
  } | null>(null);

  // Zooming with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(0.1, scale + delta), 3);
      onScaleChange(newScale); // <--- Updated
    } else {
      // Pan
      onPanChange({            // <--- Updated
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start panning the canvas if we tapped a node
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      panRef.current = { startX: touch.clientX, startY: touch.clientY, panX: pan.x, panY: pan.y };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchRef.current = { initialDistance: distance, initialScale: scale };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();

    // 1. Draw the temporary wire if dragging in link mode
    if (connectingFrom) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setTempConnection({
          x: (touch.clientX - rect.left - pan.x) / scale,
          y: (touch.clientY - rect.top - pan.y) / scale,
        });
      }
      return; 
    }

    // 2. Otherwise process normal pan/zoom
    if (e.touches.length === 1 && isPanning && panRef.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - panRef.current.startX;
      const deltaY = touch.clientY - panRef.current.startY;
      onPanChange({ x: panRef.current.panX + deltaX, y: panRef.current.panY + deltaY });
    } else if (e.touches.length === 2 && touchRef.current?.initialDistance) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDistance / touchRef.current.initialDistance;
      const newScale = Math.min(Math.max(0.1, touchRef.current.initialScale * factor), 3);
      onScaleChange(newScale);
    }
  };

  // Shared function to complete a connection
  const handleConnectionEnd = (toId: string) => {
    if (connectingFrom && connectingFrom !== toId) {
      const existingConnection = connections.find(
        (conn) => conn.from === connectingFrom && conn.to === toId
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check where the finger was lifted
    if (connectingFrom) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const nodeElement = element?.closest('[data-node-id]'); // Find the node under finger
      
      if (nodeElement) {
        const targetId = nodeElement.getAttribute('data-node-id');
        if (targetId && targetId !== connectingFrom) {
          handleConnectionEnd(targetId);
          return;
        }
      }
      
      // Cancel connection if dropped in empty space
      setConnectingFrom(null);
      setTempConnection(null);
    }

    setIsPanning(false);
    panRef.current = null;
    touchRef.current = null;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && panRef.current) {
      const deltaX = e.clientX - panRef.current.startX;
      const deltaY = e.clientY - panRef.current.startY;
      onPanChange({            // <--- Updated
        x: panRef.current.panX + deltaX,
        y: panRef.current.panY + deltaY,
      });
    }
  };

  // Panning with mouse drag
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
      className="relative w-full h-full overflow-hidden bg-gray-950 touch-none"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
              isLinkMode={isLinkMode}
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
          <div>⌨️ Ctrl + Scroll to zoom</div>
          <div>🔗 Right-click drag to connect</div>
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