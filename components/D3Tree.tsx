
import React, { useEffect, useRef, useState } from 'react';
import { select, hierarchy, tree, zoom, zoomIdentity } from 'd3';
import { Person, FamilyData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface D3TreeProps {
  data: FamilyData;
  rootId: string;
  onNodeClick: (personId: string) => void;
  onAddRelative: (personId: string, type: 'parent' | 'child' | 'partner') => void;
}

// Extended interface for hierarchy processing
interface HierarchyNode extends Person {
  children?: HierarchyNode[];
  spouses?: Person[];
}

const D3Tree: React.FC<D3TreeProps> = ({ data, rootId, onNodeClick, onAddRelative }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { dir, t } = useLanguage();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDims = () => {
      if (svgRef.current) {
        const { clientWidth, clientHeight } = svgRef.current.parentElement || { clientWidth: 800, clientHeight: 600 };
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    window.addEventListener('resize', updateDims);
    updateDims();
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    if (!data.people[rootId] || !svgRef.current) return;

    const svgSelection = select(svgRef.current);
    svgSelection.selectAll("*").remove(); // Clear previous render

    const width = dimensions.width;
    const height = dimensions.height;

    // --- Data Transformation to Hierarchy ---
    const buildHierarchy = (id: string): HierarchyNode | null => {
      const person = data.people[id];
      if (!person) return null;
      
      const children = person.childrenIds
        .map(childId => buildHierarchy(childId))
        .filter((c): c is HierarchyNode => c !== null);

      // Resolve partners
      // We only attach partners to the tree node for visualization
      // The tree structure relies on children links
      const spouses = person.partnerIds
        .map(pid => data.people[pid])
        .filter(p => p !== undefined);

      return {
        ...person,
        children: children.length > 0 ? children : undefined,
        spouses: spouses
      };
    };

    const hierarchyData = buildHierarchy(rootId);
    if (!hierarchyData) return;

    const root = hierarchy<HierarchyNode>(hierarchyData);

    // Layout configuration
    // Increase width to accommodate couples side-by-side
    // Standard card is ~220px. Couple is ~460px. 
    // We set nodeSize X to 520 to ensure safe spacing between siblings.
    const treeLayout = tree<HierarchyNode>().nodeSize([520, 280]); 
    treeLayout(root);

    // Zoom behavior
    const g = svgSelection.append("g");
    
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svgSelection.call(zoomBehavior);

    // Initial centering
    const initialTransform = zoomIdentity
      .translate(width / 2, 100)
      .scale(0.7);
    svgSelection.call(zoomBehavior.transform, initialTransform);

    // --- Rendering ---

    // Links (Edges) - Thick Line for Direct Children
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#475569") // Darker slate color
      .attr("stroke-width", 4)   // Thicker line (4px)
      .attr("d", (d: any) => {
        // Helper for standard bezier curve
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      });

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", "default");

    // Dimensions for a single card
    const cardWidth = 220;
    const cardHeight = 120;
    const gap = 40; // Increased gap to make room for the blue connector line

    // Determine size of the foreignObject based on whether there are spouses
    // We render spouses side-by-side
    node.each(function(d: any) {
      const person = d.data as HierarchyNode;
      const spouses = person.spouses || [];
      const totalCount = 1 + spouses.length;
      
      const totalWidth = (cardWidth * totalCount) + (gap * (totalCount - 1));
      const totalHeight = cardHeight + 40; // Extra space for shadows/hover

      // Center the foreignObject horizontally around d.x
      const xPos = -(totalWidth / 2);
      const yPos = -(cardHeight / 2);

      const fo = select(this).append("foreignObject")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .style("overflow", "visible");

      // Generate HTML for the group
      fo.append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", `${gap}px`)
        .html(() => {
          // Helper to generate card HTML
          const renderCard = (p: Person, isSpouse = false) => {
            const isDeceased = p.isDeceased || !!p.deathDate;
            const genderColor = isDeceased
                ? 'bg-gray-50 border-gray-400 grayscale-[0.8]'
                : p.gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200';
            
            const avatarHtml = p.photoUrl 
              ? `<img src="${p.photoUrl}" class="w-10 h-10 rounded-full object-cover border border-slate-200 mr-3 shadow-sm ${isDeceased ? 'grayscale' : ''}" />`
              : `<div class="w-10 h-10 rounded-full flex items-center justify-center bg-white text-lg font-bold shadow-sm mr-3 text-slate-600 ${isDeceased ? 'grayscale' : ''}">${p.name.charAt(0)}</div>`;

            const dateText = isDeceased 
                ? `<span class="text-xs text-gray-800 font-medium">${p.birthDate?.split('-')[0] || '?'} - ${p.deathDate?.split('-')[0] || '?'}</span>` 
                : p.birthDate || 'Unknown';

            const deceasedBadge = isDeceased 
                ? `<div class="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm z-10">RIP</div>`
                : '';

            const buttonsHtml = `
              <div class="flex justify-between mt-2 pt-2 border-t border-slate-200/60 gap-1">
                 <button class="action-btn flex-1 text-[10px] py-1 bg-white border border-slate-200 rounded hover:bg-brand-50 hover:text-brand-600 transition flex flex-col items-center gap-0.5" data-action="parent" data-id="${p.id}" title="${t('addParent')}">
                    <span>⬆</span> <span>${t('parents')}</span>
                 </button>
                 <button class="action-btn flex-1 text-[10px] py-1 bg-white border border-slate-200 rounded hover:bg-brand-50 hover:text-brand-600 transition flex flex-col items-center gap-0.5" data-action="partner" data-id="${p.id}" title="${t('addPartner')}">
                    <span>♥</span> <span>${t('partners')}</span>
                 </button>
                 <button class="action-btn flex-1 text-[10px] py-1 bg-white border border-slate-200 rounded hover:bg-brand-50 hover:text-brand-600 transition flex flex-col items-center gap-0.5" data-action="child" data-id="${p.id}" title="${t('addChild')}">
                    <span>⬇</span> <span>${t('children')}</span>
                 </button>
              </div>
            `;

            // Spouse Connector (Blue Line + Heart)
            // Positioned absolutely to the left of the spouse card to bridge the gap
            const spouseConnector = isSpouse ? `
              <div class="absolute top-1/2 -left-[40px] w-[40px] h-[3px] bg-blue-300 -translate-y-1/2 z-0"></div>
              <div class="absolute top-1/2 -left-[20px] -mt-3 text-pink-500 text-xl z-10 flex justify-center w-[40px] -ml-[20px]">
                 <div class="bg-white rounded-full p-0.5 shadow-sm border border-blue-100">♥</div>
              </div>
            ` : '';

            return `
              <div class="relative flex-shrink-0 w-[${cardWidth}px] h-[${cardHeight}px] flex flex-col p-2 rounded-lg border shadow-sm ${genderColor} transition hover:shadow-md select-none bg-white">
                ${deceasedBadge}
                ${spouseConnector}
                <div class="flex items-center mb-1 cursor-pointer card-main-area flex-1" data-id="${p.id}">
                  ${avatarHtml}
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate" title="${p.name}">${p.name}</p>
                    <p class="text-xs text-gray-500 truncate">${dateText}</p>
                  </div>
                </div>
                ${buttonsHtml}
              </div>
            `;
          };

          let html = renderCard(person, false); // Main Person

          // Append Spouses
          spouses.forEach(spouse => {
            html += renderCard(spouse, true);
          });

          return html;
        });
    });

    // --- Event Handling ---
    g.on("click", (event) => {
      const target = event.target as HTMLElement;
      
      // Check if an action button was clicked
      const btn = target.closest('.action-btn') as HTMLElement;
      if (btn) {
        event.stopPropagation();
        const action = btn.dataset.action as 'parent' | 'child' | 'partner';
        const id = btn.dataset.id;
        if (id && action) {
          onAddRelative(id, action);
        }
        return;
      }

      // Check if the main card area was clicked
      const cardMain = target.closest('.card-main-area') as HTMLElement;
      if (cardMain) {
        const id = cardMain.dataset.id;
        if (id) {
           onNodeClick(id);
        }
      }
    });

  }, [data, rootId, dimensions, dir, t, onNodeClick, onAddRelative]);

  return (
    <div className="w-full h-full bg-slate-50 overflow-hidden relative rounded-xl border border-slate-200 shadow-inner">
       <svg ref={svgRef} className="w-full h-full select-none"></svg>
       <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded shadow text-xs text-gray-500 flex flex-col gap-1 pointer-events-none">
          <span>Scroll to Zoom • Drag to Pan</span>
          <span>Click card to Edit</span>
       </div>
    </div>
  );
};

export default D3Tree;
