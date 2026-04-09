import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuX, LuSave } from 'react-icons/lu';
import { Button } from './ui/button';
import { NoteNodeData } from './NoteNode';

interface NoteEditorProps {
  node: NoteNodeData;
  onClose: () => void;
  onSave: (id: string, title: string, content: string) => void;
}

export function NoteEditor({ node, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // useRef in order to call '.focus()' directly

  useEffect(() => {
    // Focus on textarea when opened
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(node.id, title, content);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleSave();
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
          className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-2xl border overflow-hidden"
          style={{
            borderColor: `${glowColor}60`,
            boxShadow: `0 0 15px ${glowColor}20, inset 0 0 20px ${glowColor}05`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: `${glowColor}30` }}
          >
            <input // Title Text
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-2xl font-semibold text-white placeholder-gray-500"
              placeholder="Note Title"
              style={{
                textShadow: `0 0 20px ${glowColor}40`,
              }}
            />
            <div className="flex items-center gap-2"> { /* Save Button */}
              <Button
                onClick={handleSave}
                size="sm"
                className="transition-all duration-200"
                style={{
                  backgroundColor: glowColor,
                  boxShadow: `0 0 20px ${glowColor}60`,
                }}
              >
                <LuSave className="w-4 h-4 mr-2" /> {/* Save Icon */}
                Save
              </Button>
              <Button // X button
                onClick={handleSave}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LuX className="w-5 h-5" /> {/* Updated Icon Usage */}
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 h-[calc(100%-88px)] overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent border-none outline-none text-gray-300 text-lg resize-none placeholder-gray-600"
              placeholder="Start typing your notes here..."
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            />
          </div>

          {/* Subtle glow effect at edges */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at top left, ${glowColor}05 0%, transparent 50%), radial-gradient(circle at bottom right, ${glowColor}05 0%, transparent 50%)`,
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}