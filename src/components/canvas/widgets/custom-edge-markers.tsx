import React from 'react';

// Markers for ER Diagram Relationships (Crow's Foot Notation)
// We use specific colors to ensure visibility. 
// The stroke color matches the slate-500/600 range for good contrast.
const STROKE_COLOR = "#475569"; // Slate 600

export const CustomEdgeMarkers = () => {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        {/* ONE (Simple Line) */}
        <marker
          id="marker-one"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <line x1="11" y1="0" x2="11" y2="12" stroke={STROKE_COLOR} strokeWidth="1.5" />
        </marker>

        {/* MANY (Crow's Foot) */}
        <marker
          id="marker-many"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <path d="M0,6 L12,6" stroke={STROKE_COLOR} strokeWidth="1.5" fill="none" />
          <path d="M0,0 L12,6 L0,12" stroke={STROKE_COLOR} strokeWidth="1.5" fill="none" />
        </marker>

        {/* ZERO OR ONE */}
        <marker
          id="marker-zero-one"
          viewBox="0 0 18 12"
          refX="17"
          refY="6"
          markerWidth="18"
          markerHeight="12"
          orient="auto"
        >
           {/* Circle for Zero */}
          <circle cx="8" cy="6" r="4" stroke={STROKE_COLOR} strokeWidth="1.5" fill="white" />
           {/* Line for One */}
          <line x1="17" y1="0" x2="17" y2="12" stroke={STROKE_COLOR} strokeWidth="1.5" />
        </marker>

        {/* ZERO OR MANY */}
        <marker
          id="marker-zero-many"
          viewBox="0 0 18 12"
          refX="17"
          refY="6"
          markerWidth="18"
          markerHeight="12"
          orient="auto"
        >
          {/* Circle for Zero */}
          <circle cx="8" cy="6" r="4" stroke={STROKE_COLOR} strokeWidth="1.5" fill="white" />
          {/* Crow's foot for Many */}
          <path d="M11,0 L17,6 L11,12" stroke={STROKE_COLOR} strokeWidth="1.5" fill="none" />
        </marker>
        
        {/* ONE OR MANY */}
        <marker
            id="marker-one-many"
            viewBox="0 0 18 12"
            refX="17"
            refY="6"
            markerWidth="18"
            markerHeight="12"
            orient="auto"
        >
            <line x1="8" y1="0" x2="8" y2="12" stroke={STROKE_COLOR} strokeWidth="1.5" />
            <path d="M11,0 L17,6 L11,12" stroke={STROKE_COLOR} strokeWidth="1.5" fill="none" />
        </marker>
      </defs>
    </svg>
  );
};
