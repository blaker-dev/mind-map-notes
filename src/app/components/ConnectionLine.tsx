export interface Connection {
  id: string;
  from: string;
  to: string;
}

import { useState } from 'react';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color?: string;
  onDelete?: () => void;
}

export function ConnectionLine({ fromX, fromY, toX, toY, color = '#3b82f6', onDelete }: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the center points of the nodes (node is now circular: 80px diameter - w-20 h-20)
  const nodeSize = 80;

  const startX = fromX + nodeSize / 2;
  const startY = fromY + nodeSize / 2;
  const endX = toX + nodeSize / 2;
  const endY = toY + nodeSize / 2;

  // Calculate control points for a smooth curved line
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const controlPointOffset = Math.abs(deltaX) * 0.5;

  const controlPoint1X = startX + controlPointOffset;
  const controlPoint1Y = startY;
  const controlPoint2X = endX - controlPointOffset;
  const controlPoint2Y = endY;

  // Create the path for a bezier curve
  const pathD = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

  // Calculate the angle for the arrowhead
  const angle = Math.atan2(endY - controlPoint2Y, endX - controlPoint2X);
  const arrowSize = 10;

  const arrowPoint1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);

  // Calculate the midpoint for the delete button
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (onDelete) {
          e.stopPropagation();
          onDelete();
        }
      }}
      style={{ cursor: onDelete ? 'pointer' : 'default' }}
    >
      {/* Invisible thick line for easier hover detection */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke' }}
      />
      
      {/* Glow effect */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={isHovered ? "0.6" : "0.3"}
        filter="blur(4px)"
        className="transition-all"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Main connection line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? "3" : "2"}
        strokeLinecap="round"
        className="transition-all"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Arrowhead */}
      <polygon
        points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
        fill={color}
        className="transition-all"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
          pointerEvents: 'none',
        }}
      />

      {/* Delete button on hover */}
      {isHovered && onDelete && (
        <g>
          {/* Button background */}
          <circle
            cx={midX}
            cy={midY}
            r="12"
            fill="#ef4444"
            stroke="#1f2937"
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 0 8px #ef4444)',
            }}
          />
          {/* X icon */}
          <line
            x1={midX - 5}
            y1={midY - 5}
            x2={midX + 5}
            y2={midY + 5}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={midX + 5}
            y1={midY - 5}
            x2={midX - 5}
            y2={midY + 5}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
}