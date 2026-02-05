import React, { useRef } from 'react';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { Plus, Download, Upload, Save } from 'lucide-react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';

const CanvasToolbar = () => {
  const addEntity = useDiagramStore((state) => state.addEntity);
  const loadGraph = useDiagramStore((state) => state.loadGraph);
  const { getNodes, getEdges } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadImage = async () => {
    const nodes = getNodes();
    if (nodes.length === 0) return;

    // Use a specific selector for the react-flow viewport to capture everything
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (!viewport) {
        console.error("Viewport not found");
        return;
    }

    // Calculate bounds of the entire graph
    const bounds = getNodesBounds(nodes);
    const imageWidth = bounds.width + 100; // Add padding
    const imageHeight = bounds.height + 100;

    try {
        const dataUrl = await toPng(viewport, {
            backgroundColor: '#f8fafc',
            width: imageWidth,
            height: imageHeight,
            style: {
                 // Translate content so that the top-left most node is at (50, 50)
                 transform: `translate(${-bounds.x + 50}px, ${-bounds.y + 50}px) scale(1)`,
                 width: `${imageWidth}px`,
                 height: `${imageHeight}px`,
            },
            // Fix for "font is undefined" / "trim" error
            fontEmbedCSS: '', 
        });
        
        const a = document.createElement('a');
        a.setAttribute('download', 'er-diagram.png');
        a.setAttribute('href', dataUrl);
        a.click();
    } catch (err) {
        console.error('Failed to download image', err);
    }
  };

  const handleSaveData = () => {
      const nodes = getNodes();
      const edges = getEdges();
      const data = { nodes, edges };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'er-diagram-data.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleLoadData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.nodes && json.edges) {
                  loadGraph(json.nodes, json.edges);
              } else {
                  alert('Invalid file format');
              }
          } catch (err) {
              console.error('Failed to parse JSON', err);
              alert('Failed to load file');
          }
      };
      reader.readAsText(file);
      
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="bg-white p-1.5 rounded-lg shadow-md border border-slate-200 flex flex-col gap-1">
        <button
            onClick={addEntity}
            className="p-2 hover:bg-slate-100 rounded text-slate-700"
            title="Add Table (Shift+N)"
        >
            <Plus className="w-5 h-5" />
        </button>
      </div>
      
       <div className="bg-white p-1.5 rounded-lg shadow-md border border-slate-200 flex flex-col gap-1">
         <button
            onClick={handleSaveData}
            className="p-2 hover:bg-slate-100 rounded text-slate-700"
            title="Save Data (JSON)"
         >
            <Save className="w-5 h-5" />
        </button>
         <button
            onClick={triggerFileInput}
            className="p-2 hover:bg-slate-100 rounded text-slate-700"
            title="Load Data (JSON)"
         >
            <Upload className="w-5 h-5" />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLoadData} 
            accept=".json" 
            className="hidden" 
        />
       </div>

       <div className="bg-white p-1.5 rounded-lg shadow-md border border-slate-200 flex flex-col gap-1">
         <button
            onClick={handleDownloadImage}
            className="p-2 hover:bg-slate-100 rounded text-slate-700"
            title="Export Image (PNG)"
         >
            <Download className="w-5 h-5" />
        </button>
       </div>
    </div>
  );
};

export default CanvasToolbar;
