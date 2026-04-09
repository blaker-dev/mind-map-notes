import { 
  LuFileText, 
  LuDownload, 
  LuUpload, 
  LuPrinter, 
  LuUndo2, 
  LuRedo2, 
  LuZoomIn, 
  LuZoomOut, 
  LuMaximize2,
  LuChevronDown,
  LuPlus,
  LuLink
} from "react-icons/lu";
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ToolbarProps {
  scale: number;
  onScaleChange: (newScale: number) => void;
  onFitToScreen?: () => void;
  isLinkMode: boolean;
  onLinkModeChange: (active: boolean) => void;
}

export function Toolbar({ scale, onScaleChange, onFitToScreen, isLinkMode, onLinkModeChange }: ToolbarProps) {
  
  // Standard zoom steps
  const handleZoomIn = () => onScaleChange(Math.min(scale + 0.25, 3));
  const handleZoomOut = () => onScaleChange(Math.max(scale - 0.25, 0.1));
  const handleSetZoom = (value: number) => onScaleChange(value);

  // Native Browser Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="border-b border-gray-800 bg-gray-950">
      {/* Document Title Row */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <LuFileText className="w-10 h-10 text-blue-500" style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
          <div className="flex flex-col">
            <input
              type="text"
              defaultValue="Untitled Mind Map"
              className="text-lg font-normal bg-transparent border-none outline-none focus:outline-1 focus:outline-blue-500 px-1 -ml-1 rounded text-white"
            />
          </div>
        </div>
      </div>

      {/* Menu Bar (Truncated for brevity, functions exactly as before) */}
      <div className="flex items-center px-4 py-1 gap-1">
        {/* ... Keep your existing File, Edit menus here ... */}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              View
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700 text-gray-300">
            <DropdownMenuItem onClick={handleZoomIn}>
              <LuZoomIn className="w-4 h-4 mr-2" />
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleZoomOut}>
              <LuZoomOut className="w-4 h-4 mr-2" />
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFitToScreen}>
              <LuMaximize2 className="w-4 h-4 mr-2" />
              Fit to Screen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleFullscreen}>
              <LuMaximize2 className="w-4 h-4 mr-2" />
              Toggle Fullscreen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">Insert</button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">Format</button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">Tools</button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">Help</button>
      </div>

      {/* Icon Toolbar */}
      <div className="flex items-center px-4 py-2 gap-1 border-t border-gray-800">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800" title="Undo">
          <LuUndo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800" title="Redo">
          <LuRedo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800" title="Print">
          <LuPrinter className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 text-gray-300" 
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <LuZoomOut className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-3 text-gray-300 hover:text-white hover:bg-gray-800">
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <LuChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700 text-gray-300">
            <DropdownMenuItem onClick={() => handleSetZoom(0.5)}>50%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetZoom(0.75)}>75%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetZoom(1.0)}>100%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetZoom(1.25)}>125%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetZoom(1.5)}>150%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetZoom(2.0)}>200%</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800" 
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <LuZoomIn className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800" 
          title="Toggle Fullscreen"
          onClick={toggleFullscreen}
        >
          <LuMaximize2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-9 w-9 transition-colors ${
            isLinkMode 
              ? 'bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 hover:text-blue-400' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`} 
          title="Link Mode (Tap & drag to connect)"
          onClick={() => onLinkModeChange(!isLinkMode)}
        >
          <LuLink className="w-4 h-4" />
        </Button>

      </div>
    </div>
  );
}