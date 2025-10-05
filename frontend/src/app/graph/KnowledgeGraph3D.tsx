"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

// Type definitions
type NodeType = "Publication" | "Mission" | "Keyword" | "Organism" | "Location";
interface GraphNode {
  id: string;
  type: NodeType;
  color: string;
  label: string;
}
interface GraphLink {
  source: string;
  target: string;
}
interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
interface RawDoc {
  Title?: string;
  Introduction?: string;
  Abstract?: string;
  [key: string]: unknown;
}

const typeColors: Record<NodeType, string> = {
  Publication: "#ff6f61",
  Mission: "#9e9ac8",
  Keyword: "#74c476",
  Organism: "#6baed6",
  Location: "#fdae6b",
};

export default function KnowledgeGraph3D() {
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for controls
  const [allNodes, setAllNodes] = useState<GraphNode[]>([]);
  const [allLinks, setAllLinks] = useState<GraphLink[]>([]);
  const [allPublications, setAllPublications] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<NodeType[]>(["Publication", "Mission", "Keyword", "Organism"]);
  const [maxPubs, setMaxPubs] = useState(50);
  const [pubSliderBounds, setPubSliderBounds] = useState({ min: 1, max: 1 });

  useEffect(() => {
    fetch("/cleaned.json")
      .then((res) => res.json())
      .then((data: Record<string, RawDoc>) => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        
        Object.entries(data).forEach(([doc_id, doc]) => {
          if (!doc || typeof doc !== "object") return;
          const title = doc.Title || "";
          if (!title || title.length < 5) return;
          const pub_id = `pub_${doc_id}`;
          nodes.push({ id: pub_id, type: "Publication", color: typeColors.Publication, label: title.slice(0, 100) });

          // Missions
          const intro = doc.Introduction || "";
          const missionPattern = /(Bion-M\s?\d+|STS-\d+|ISS|International Space Station|Space Shuttle|Spacelab-?\d*|NeuroLab)/gi;
          const missions = new Set<string>((intro.match(missionPattern) || []).map((m: string) => m.trim()));
          missions.forEach((mission) => {
            nodes.push({ id: mission, type: "Mission", color: typeColors.Mission, label: mission });
            links.push({ source: pub_id, target: mission });
          });

          // Keywords
          const abstract = doc.Abstract || "";
          const combined = `${title} ${abstract}`.toLowerCase();
          const keywords: Record<string, string> = {
            microgravity: "Microgravity",
            bone: "Bone",
            muscle: "Muscle",
            cardiovascular: "Cardiovascular",
            radiation: "Radiation",
            "oxidative stress": "Oxidative Stress",
            "cell cycle": "Cell Cycle",
            "stem cell": "Stem Cells",
            osteoblast: "Osteoblasts",
            spaceflight: "Spaceflight",
            immune: "Immune System",
            "gene expression": "Gene Expression",
          };
          Object.entries(keywords).forEach(([search, label]) => {
            if (combined.includes(search)) {
              nodes.push({ id: label, type: "Keyword", color: typeColors.Keyword, label });
              links.push({ source: pub_id, target: label });
            }
          });

          // Organisms
          const organismPattern = /(mice|mouse|Mus musculus|rats|human|Homo sapiens|C57BL\/6J?)/gi;
          const organisms = new Set<string>((`${intro} ${abstract}`.match(organismPattern) || []).map((o: string) => o.trim()));
          const organismMap: Record<string, string> = {
            mice: "Mice",
            mouse: "Mice",
            "mus musculus": "Mice",
            rats: "Rats",
            human: "Humans",
            "homo sapiens": "Humans",
            "c57bl/6j": "Mice",
            "c57bl/6": "Mice",
          };
          organisms.forEach((org) => {
            const label = organismMap[org.toLowerCase()] || org;
            nodes.push({ id: label, type: "Organism", color: typeColors.Organism, label });
            links.push({ source: pub_id, target: label });
          });
        });
        // Remove duplicate nodes by id
        const nodeMap: Record<string, GraphNode> = {};
        nodes.forEach((n) => { nodeMap[n.id] = n; });
        const uniqueNodes = Object.values(nodeMap);
        setAllNodes(uniqueNodes);
        setAllLinks(links);
        // Publications
        const pubs = uniqueNodes.filter((n) => n.type === "Publication").map((n) => n.id);
        setAllPublications(pubs);
        setPubSliderBounds({ min: 1, max: pubs.length });
        setMaxPubs(Math.min(50, pubs.length));
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load graph data.");
        setLoading(false);
      });
  }, []);

  // Filter nodes and links based on controls
  const pubsToShow = selectedTypes.includes("Publication") ? allPublications.slice(0, maxPubs) : [];
  const nodesToShow = allNodes.filter((n) => {
    if (!selectedTypes.includes(n.type)) return false;
    if (n.type === "Publication") return pubsToShow.includes(n.id);
    return true;
  });
  const nodeIdsToShow = new Set(nodesToShow.map((n) => n.id));
  const linksToShow = allLinks.filter((l) => {
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
    const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
    return nodeIdsToShow.has(sourceId) && nodeIdsToShow.has(targetId);
  });
  const filteredGraphData = { nodes: nodesToShow, links: linksToShow };

  // Statistics
  const totalNodes = nodesToShow.length;
  const totalEdges = linksToShow.length;

  if (loading) return <div className="text-center py-10">Loading graph...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-stretch max-w-full">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 max-w-full bg-white/80 dark:bg-black/40 rounded-2xl shadow-lg border border-white/30 p-5 mb-6 md:mb-0 flex-shrink-0 z-10" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
        <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-300">Graph Statistics</h2>
        <div className="mb-6">
          <div className="text-base font-medium">Total Nodes: <span className="font-bold">{totalNodes}</span></div>
          <div className="text-base font-medium">Total Edges: <span className="font-bold">{totalEdges}</span></div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-300">Graph Controls</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Max Publications to Display</label>
          <input
            type="range"
            min={pubSliderBounds.min}
            max={pubSliderBounds.max}
            value={maxPubs}
            onChange={e => setMaxPubs(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>{pubSliderBounds.min}</span>
            <span className="font-bold">{maxPubs}</span>
            <span>{pubSliderBounds.max}</span>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Node Types to Display</label>
          <div className="flex flex-col gap-1">
            {(["Publication", "Mission", "Keyword", "Organism"] as NodeType[]).map((type) => (
              <label key={type} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => setSelectedTypes(selectedTypes.includes(type)
                    ? selectedTypes.filter(t => t !== type)
                    : [...selectedTypes, type])}
                  className="accent-indigo-500"
                />
                <span className="capitalize text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-300">Legend</h2>
          <div className="space-y-2">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Graph Visualization */}
      <div className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full h-[70vh] bg-white dark:bg-black rounded-2xl shadow-lg border border-white/30 overflow-hidden flex items-center justify-center">
          <ForceGraph3D
            graphData={filteredGraphData}
            nodeAutoColorBy="type"
            nodeLabel={(node) => {
              const label = `${node.type}:\n${node.label}`;
              const safeLabel = label.replace(/</g, '&lt;').replace(/>/g, '&gt;');
              return `<div class='graph-tooltip'>${safeLabel}</div>`;
            }}
            nodeThreeObjectExtend={true}
            linkColor={() => "#aaa"}
            backgroundColor="#f8fafc"
            nodeColor={(node) => (node && typeof node === 'object' && 'color' in node ? (node as GraphNode).color : '#cccccc')}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
          />
        </div>
      </div>
    </div>
  );
}