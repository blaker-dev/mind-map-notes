import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuX, LuSave, LuPenTool, LuEraser } from 'react-icons/lu';
import { Button } from './ui/button';
import { NoteNodeData, Stroke } from './NoteNode';

interface NoteEditorProps {
  node: NoteNodeData;
  onClose: () => void;
  onSave: (id: string, title: string, content: string, strokes: Stroke[]) => void;
}

// Helper to generate an SVG path from an array of coordinates
const getSvgPathFromPoints = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

export function NoteEditor({ node, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  
  // Drawing States
  const [strokes, setStrokes] = useState<Stroke[]>(node.strokes || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current && !isDrawMode) {
      textareaRef.current.focus();
    }
  }, [isDrawMode]);

  const handleSave = () => {
    onSave(node.id, title, content, strokes);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleSave();
  };

  const clearStrokes = () => {
    if (confirm("Are you sure you want to clear all drawings on this note?")) {
      setStrokes([]);
    }
  };

  // --- POINTER EVENTS FOR APPLE PENCIL ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // Activate drawing if explicitly in Draw Mode, OR if using an Apple Pencil
    if (isDrawMode || e.pointerType === 'pen') {
      e.preventDefault();
      setIsDrawMode(true); // Force UI into draw mode so the overlay stays active

      const rect = drawAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        points: [{ x, y }],
        color: node.color || '#3b82f6', // Draw using the note's theme color
        width: 3
      });

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // ignore pen movement until the pen actually touches the screen 
    // (prevents drawing when hovering with Apple Pencil)
    if (e.pointerType === 'pen' && e.pressure === 0) {
      return; 
    }

    // Safety catch: If the iPad missed the pointerup event, but the pen is lifted
    if (currentStroke && e.buttons === 0) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch(err) {}
      return;
    }

    if (currentStroke) {
      const rect = drawAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentStroke(prev => {
        if (!prev) return null;
        return { ...prev, points: [...prev.points, { x, y }] };
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const glowColor = node.color || '#3b82f6';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleSave}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-2xl border flex flex-col overflow-hidden"
          style={{
            borderColor: `${glowColor}60`,
            boxShadow: `0 0 15px ${glowColor}20, inset 0 0 20px ${glowColor}05`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: `${glowColor}30` }}>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-2xl font-semibold text-white placeholder-gray-500"
              placeholder="Note Title"
              style={{ textShadow: `0 0 20px ${glowColor}40` }}
            />
            <div className="flex items-center gap-2">
              
              {/* Draw Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawMode(!isDrawMode)}
                className={`transition-all duration-200 ${isDrawMode ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Toggle Draw Mode"
              >
                <LuPenTool className="w-4 h-4 mr-2" />
                {isDrawMode ? "Drawing" : "Draw"}
              </Button>

              {/* Clear Drawings */}
              {strokes.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearStrokes} className="text-gray-400 hover:text-red-400" title="Clear Ink">
                  <LuEraser className="w-4 h-4" />
                </Button>
              )}

              <div className="w-px h-6 bg-gray-700 mx-1" />

              <Button
                onClick={handleSave}
                size="sm"
                className="transition-all duration-200"
                style={{ backgroundColor: glowColor, boxShadow: `0 0 20px ${glowColor}60` }}
              >
                <LuSave className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button onClick={handleSave} variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <LuX className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content & Drawing Area Wrapper */}
          <div 
            ref={drawAreaRef}
            className="relative flex-1 w-full overflow-hidden"
            // Use Capture so Apple Pencil events are intercepted before the textarea eats them
            onPointerDownCapture={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Text Area Layer */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full p-6 bg-transparent border-none outline-none text-gray-300 text-lg resize-none placeholder-gray-600 z-0"
              placeholder="Start typing your notes here. You can also use an Apple Pencil to draw directly on this screen!"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            />

            {/* Drawing Layer (SVG) */}
            <svg
              className={`absolute inset-0 w-full h-full z-10 ${isDrawMode ? 'pointer-events-auto touch-none' : 'pointer-events-none'}`}
            >
              {strokes.map(stroke => (
                <path
                  key={stroke.id}
                  d={getSvgPathFromPoints(stroke.points)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke && (
                <path
                  d={getSvgPathFromPoints(currentStroke.points)}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}