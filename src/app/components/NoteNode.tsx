import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuFileText, LuTrash2 } from 'react-icons/lu'; // Updated import

export interface NoteNodeData {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  color?: string;
}

interface NoteNodeProps {
  node: NoteNodeData;
  onPositionChange: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  onConnectionStart: (id: string) => void;
  onConnectionEnd: (id: string) => void;
  scale: number;
  isConnecting?: boolean;
}

export function NoteNode({ 
  node, 
  onPositionChange, 
  onDelete, 
  onClick, 
  onColorChange,
  onConnectionStart,
  onConnectionEnd,
  scale,
  isConnecting = false
}: NoteNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const clickTimeRef = useRef<number>(0);

  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) {
      return;
    }

    // Right click for connection
    if (e.button === 2) {
      e.preventDefault();
      onConnectionStart(node.id);
      return;
    }
    
    clickTimeRef.current = Date.now();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = (e.clientX - dragRef.current.startX) / scale;
    const deltaY = (e.clientY - dragRef.current.startY) / scale;

    onPositionChange(
      node.id,
      dragRef.current.nodeX + deltaX,
      dragRef.current.nodeY + deltaY
    );
  };

  const handleMouseUp = () => {
    const clickDuration = Date.now() - clickTimeRef.current;
    
    // If it was a quick click (not a drag), open the note
    if (clickDuration < 200 && dragRef.current) {
      const deltaX = Math.abs(dragRef.current.nodeX - node.x);
      const deltaY = Math.abs(dragRef.current.nodeY - node.y);
      
      if (deltaX < 5 && deltaY < 5) {
        onClick(node.id);
      }
    }
    
    setIsDragging(false);
    dragRef.current = null;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isConnecting) {
      onConnectionEnd(node.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const glowColor = node.color || '#3b82f6';

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        cursor: isDragging ? 'grabbing' : 'pointer',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      className="select-none"
    >
      <div className="relative flex flex-col items-center gap-2 w-24">
        {/* Circular Icon Container with Glow */}
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 border transition-all duration-200"
          style={{
            borderColor: glowColor,
            borderWidth: '2px',
            boxShadow: isConnecting
              ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}80`
              : isHovered 
                ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40, inset 0 0 20px ${glowColor}20` 
                : `0 0 10px ${glowColor}80, inset 0 0 10px ${glowColor}10`,
          }}
        >
          <LuFileText 
            className="w-8 h-8 transition-all duration-200" 
            style={{ 
              color: glowColor,
              filter: isHovered ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
            }} 
          />
          
          {/* Delete Button (shown on hover) */}
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="no-drag absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 border-2 border-gray-900 flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              style={{
                boxShadow: '0 0 10px #ef4444',
              }}
            >
              <LuTrash2 className="w-3.5 h-3.5 text-white" /> {/* Updated Icon Usage */}
            </motion.button>
          )}

          {/* Color Picker Button (shown on hover) */}
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="no-drag absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              style={{
                backgroundColor: glowColor,
                boxShadow: `0 0 10px ${glowColor}`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white/30" />
            </motion.button>
          )}
        </div>

        {/* Color Picker Palette */}
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="no-drag absolute top-24 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-50"
            style={{
              boxShadow: '0 0 20px #00000080',
            }}
          >
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-gray-900 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}60`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(node.id, color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Title */}
        <div 
          className="text-center px-2 py-1 rounded text-xs font-medium transition-all duration-200 max-w-24 truncate"
          style={{
            color: isHovered ? glowColor : '#9ca3af',
            textShadow: isHovered ? `0 0 10px ${glowColor}` : 'none',
          }}
        >
          {node.title}
        </div>
      </div>
    </motion.div>
  );
}