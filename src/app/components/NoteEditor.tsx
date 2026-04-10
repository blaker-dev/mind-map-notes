import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuX, LuSave, LuPenTool, LuEraser, LuType, LuTrash2, LuMinus, LuPlus, LuMousePointer2 } from 'react-icons/lu';
import { Button } from './ui/button';
import { NoteNodeData, Stroke } from './NoteNode';

interface NoteEditorProps {
  node: NoteNodeData;
  onClose: () => void;
  onSave: (id: string, title: string, content: string, strokes: Stroke[]) => void;
}

interface TextBlock {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number; 
}

const getSvgPathFromPoints = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

export function NoteEditor({ node, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(node.title);
  
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(() => {
    try {
      const parsed = JSON.parse(node.content);
      return Array.isArray(parsed) ? parsed : [{ id: 'tb-initial', x: 20, y: 20, text: node.content, fontSize: 16 }];
    } catch (e) {
      return node.content ? [{ id: 'tb-initial', x: 20, y: 20, text: node.content, fontSize: 16 }] : [];
    }
  });
  
  const [strokes, setStrokes] = useState<Stroke[]>(node.strokes || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const [mode, setMode] = useState<'default' | 'text' | 'draw' | 'erase'>('default');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // dragging state for text blocks
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number } | null>(null);
  
  const drawAreaRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const cleanBlocks = textBlocks.filter(tb => tb.text.trim() !== '');
    onSave(node.id, title, JSON.stringify(cleanBlocks), strokes);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleSave();
  };

  const clearStrokes = () => {
    if (confirm("Are you sure you want to clear all drawings and erasures on this note?")) {
      setStrokes([]);
    }
  };

  // --- Dynamic Bounds Calculation ---
  const { canvasWidth, canvasHeight } = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    
    textBlocks.forEach(tb => {
      maxX = Math.max(maxX, tb.x + 300); // Account for text width
      maxY = Math.max(maxY, tb.y + 100);
    });
    strokes.forEach(s => {
      s.points.forEach(p => {
        maxX = Math.max(maxX, p.x + 50);
        maxY = Math.max(maxY, p.y + 50);
      });
    });
    if (currentStroke) {
      currentStroke.points.forEach(p => {
        maxX = Math.max(maxX, p.x + 50);
        maxY = Math.max(maxY, p.y + 50);
      });
    }

    return { 
      canvasWidth: maxX + 200, 
      canvasHeight: maxY + 200 
    };
  }, [textBlocks, strokes, currentStroke]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.text-block-container')) return;

    setActiveBlockId(null);
    
    const isPen = e.pointerType === 'pen';
    const drawTool = isPen || e.buttons === 1;
    const drawModes = ['draw', 'erase'];
    if (mode === 'default' && !isPen) return;
    if (drawModes.includes(mode) && !drawTool) return;

    const isEraserInput = mode === 'erase' || (isPen && (e.button === 5 || e.buttons === 32));

    // --- drawing tools ---
    if (mode === 'draw' || mode === 'erase' || isPen) { 
      e.preventDefault(); // Prevents native scrolling while drawing
      if (isPen && mode !== 'draw' && mode !== 'erase') setMode('draw');

      const rect = drawAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        points: [{ x, y }],
        color: node.color || '#3b82f6', 
        width: isEraserInput ? 30 : 3,
        isEraser: isEraserInput
      });

      target.setPointerCapture(e.pointerId);
    } 
    // --- text mode ---
    else if (mode === 'text') {
      const rect = drawAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newId = `tb-${Date.now()}`;
      const newBlock: TextBlock = { id: newId, x, y, text: '', fontSize: 16 };
      
      setTextBlocks(prev => [...prev, newBlock]);
      setActiveBlockId(newId);
      
      // Automatically switch back to default mode after placing a text box
      setMode('default');
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'pen' && e.pressure === 0) return; 

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
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch(err) {}
    }
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(prev => prev.map(tb => tb.id === id ? { ...tb, ...updates } : tb));
  };

  const deleteTextBlock = (id: string) => {
    setTextBlocks(prev => prev.filter(tb => tb.id !== id));
    setActiveBlockId(null);
  };

  const adjustFontSize = (id: string, delta: number) => {
    setTextBlocks(prev => prev.map(tb => {
      if (tb.id === id) {
        const currentSize = tb.fontSize || 16;
        return { ...tb, fontSize: Math.max(10, Math.min(72, currentSize + delta)) }; 
      }
      return tb;
    }));
  };

  const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight + 2}px`;
    updateTextBlock(e.target.dataset.id!, { text: e.target.value });
  };

  const glowColor = node.color || '#3b82f6';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) handleSave();
        }}
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
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b shrink-0 bg-gray-900 z-50 shadow-sm" style={{ borderColor: `${glowColor}30` }}>
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('default')}
                className={`transition-all duration-200 ${mode === 'default' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Pan / Select"
              >
                <LuMousePointer2 className="w-4 h-4 mr-2" /> Select
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('text')}
                className={`transition-all duration-200 ${mode === 'text' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Text Mode"
              >
                <LuType className="w-4 h-4 mr-2" /> Text
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('draw')}
                className={`transition-all duration-200 ${mode === 'draw' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Draw Mode"
              >
                <LuPenTool className="w-4 h-4 mr-2" /> Draw
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('erase')}
                className={`transition-all duration-200 ${mode === 'erase' ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:text-red-300'}`}
                title="Eraser Tool"
              >
                <LuEraser className="w-4 h-4 mr-2" /> Erase
              </Button>

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

          {/* Dynamic Scrollable Wrapper */}
          <div className="flex-1 w-full overflow-auto relative custom-scrollbar touch-pan-x touch-pan-y">
            {/* Expanded Spatial Canvas Area */}
            <div 
              ref={drawAreaRef}
              className={`relative ${mode === 'default' ? 'cursor-grab active:cursor-grabbing' : mode === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
              style={{
                minWidth: `max(100%, ${canvasWidth}px)`,
                minHeight: `max(100%, ${canvasHeight}px)`,
              }}
              onPointerDownCapture={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {textBlocks.length === 0 && strokes.length === 0 && (
                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                  <div className="text-lg">
                    {mode === 'default' ? "Select a tool to start creating" : mode === 'text' ? "Click anywhere to create a text box" : "Draw anywhere on the canvas"}
                  </div>
                  <div className="text-sm mt-2 opacity-50">(Scroll outward to expand the canvas)</div>
                </div>
              )}

              {/* Render Spatial Text Blocks */}
              {textBlocks.map(tb => (
                <div 
                  key={tb.id}
                  className="text-block-container absolute z-20"
                  style={{ left: tb.x, top: tb.y }}
                >
                  <div
                    className={`relative p-4 -m-4 rounded-lg border-2 transition-colors ${
                      activeBlockId === tb.id ? 'border-blue-500/50 bg-gray-900/40' : 'border-transparent hover:border-gray-700/50'
                    }`}
                    style={{ cursor: draggingTextId === tb.id ? 'grabbing' : 'grab' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setActiveBlockId(tb.id);
                      
                      const target = e.target as HTMLElement;
                      if (target.tagName.toLowerCase() === 'textarea' || target.closest('button')) return;

                      const rect = drawAreaRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const localX = e.clientX - rect.left;
                      const localY = e.clientY - rect.top;

                      setDraggingTextId(tb.id);
                      setDragStartOffset({ x: localX - tb.x, y: localY - tb.y });
                      target.setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={(e) => {
                      if (draggingTextId === tb.id && dragStartOffset) {
                        const rect = drawAreaRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        updateTextBlock(tb.id, { 
                          x: (e.clientX - rect.left) - dragStartOffset.x, 
                          y: (e.clientY - rect.top) - dragStartOffset.y 
                        });
                      }
                    }}
                    onPointerUp={(e) => {
                      if (draggingTextId === tb.id) {
                        setDraggingTextId(null);
                        setDragStartOffset(null);
                        try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch(err) {}
                      }
                    }}
                  >
                    <AnimatePresence>
                      {activeBlockId === tb.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-12 left-0 flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-1 z-30"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => adjustFontSize(tb.id, -2)}>
                            <LuMinus className="w-4 h-4" />
                          </Button>
                          <span className="text-xs text-gray-300 w-8 text-center select-none font-mono">
                            {tb.fontSize || 16}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => adjustFontSize(tb.id, 2)}>
                            <LuPlus className="w-4 h-4" />
                          </Button>
                          <div className="w-px h-4 bg-gray-600 mx-1" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => deleteTextBlock(tb.id)}>
                            <LuTrash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      data-id={tb.id}
                      autoFocus={tb.text === ''}
                      className="bg-transparent border-none outline-none resize-none block text-gray-200 placeholder-gray-600 relative z-10"
                      style={{
                        minWidth: '200px',
                        minHeight: '48px',
                        fontSize: `${tb.fontSize || 16}px`,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        lineHeight: '1.5'
                      }}
                      value={tb.text}
                      placeholder="Type here..."
                      onFocus={() => setActiveBlockId(tb.id)}
                      onChange={handleTextAreaInput}
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight + 2}px`;
                        }
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Drawing Layer with Eraser SVG Mask */}
              <svg
                className={`absolute inset-0 w-full h-full z-10 ${mode === 'draw' || mode === 'erase' ? 'pointer-events-auto touch-none' : 'pointer-events-none'}`}
              >
                <defs>
                  <mask id={`eraser-mask-${node.id}`}>
                    <rect width="100%" height="100%" fill="white" />
                    {strokes.filter(s => s.isEraser).map(stroke => (
                      <path
                        key={`mask-${stroke.id}`}
                        d={getSvgPathFromPoints(stroke.points)}
                        stroke="black"
                        strokeWidth={stroke.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    {currentStroke?.isEraser && (
                      <path
                        d={getSvgPathFromPoints(currentStroke.points)}
                        stroke="black"
                        strokeWidth={currentStroke.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </mask>
                </defs>

                <g mask={`url(#eraser-mask-${node.id})`}>
                  {strokes.filter(s => !s.isEraser).map(stroke => (
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
                  {currentStroke && !currentStroke.isEraser && (
                    <path
                      d={getSvgPathFromPoints(currentStroke.points)}
                      stroke={currentStroke.color}
                      strokeWidth={currentStroke.width}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>

                {currentStroke?.isEraser && (
                  <path
                    d={getSvgPathFromPoints(currentStroke.points)}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={currentStroke.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                )}
              </svg>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}