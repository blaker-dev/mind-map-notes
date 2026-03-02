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
  LuMinus
} from "react-icons/lu";
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Toolbar() {
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

      {/* Menu Bar */}
      <div className="flex items-center px-4 py-1 gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              File
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700">
            <DropdownMenuItem>
              <LuPlus className="w-4 h-4 mr-2" />
              New
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LuUpload className="w-4 h-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LuDownload className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LuPrinter className="w-4 h-4 mr-2" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              Edit
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700">
            <DropdownMenuItem>
              <LuUndo2 className="w-4 h-4 mr-2" />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LuRedo2 className="w-4 h-4 mr-2" />
              Redo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              View
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700">
            <DropdownMenuItem>
              <LuZoomIn className="w-4 h-4 mr-2" />
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LuZoomOut className="w-4 h-4 mr-2" />
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LuMaximize2 className="w-4 h-4 mr-2" />
              Fit to Screen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
          Insert
        </button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
          Format
        </button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
          Tools
        </button>
        <button className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
          Help
        </button>
      </div>

      {/* Icon Toolbar */}
      <div className="flex items-center px-4 py-2 gap-1 border-t border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Undo"
        >
          <LuUndo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Redo"
        >
          <LuRedo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Print"
        >
          <LuPrinter className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Zoom Out"
        >
          <LuZoomOut className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-3 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <span className="text-sm">100%</span>
              <LuChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-900 border-gray-700">
            <DropdownMenuItem>50%</DropdownMenuItem>
            <DropdownMenuItem>75%</DropdownMenuItem>
            <DropdownMenuItem>100%</DropdownMenuItem>
            <DropdownMenuItem>125%</DropdownMenuItem>
            <DropdownMenuItem>150%</DropdownMenuItem>
            <DropdownMenuItem>200%</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Zoom In"
        >
          <LuZoomIn className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
          title="Fit to Screen"
        >
          <LuMaximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}