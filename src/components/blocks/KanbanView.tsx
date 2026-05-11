"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { Kanban, Plus } from "lucide-react";
import { RecordFormModal } from "./RecordFormModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COL_ACCENTS: Record<string, string> = {
  "Draft": "var(--foreground-dimmed)",
  "Sent": "var(--accent-blue)",
  "Received": "var(--success)",
  "Cancelled": "var(--danger)",
  "To Do": "var(--foreground-dimmed)",
  "In Progress": "var(--accent-blue)",
  "Review": "var(--accent-amber)",
  "Done": "var(--success)",
};

const KanbanCardContent = ({ item, fields, groupByField }: any) => {
  return (
    <>
      <div className="font-semibold text-[14px] leading-snug">
          {(() => {
            const titleField = fields?.find((f: any) =>
              ["PO Number", "Name", "Reference", "Deal Name"].includes(f.name)
            ) ?? fields?.find((f: any) => f.type === "TEXT");
            const titleVal = titleField ? item.data[titleField.id] ?? item.data[titleField.name] : null;
            return titleVal || item.id.substring(0, 8);
          })()}
      </div>
      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          {fields?.filter((f: any) => f.name !== groupByField && f.name !== "PO Number" && f.name !== "Notes" && f.name !== "Status")
                  .slice(0, 2)
                  .map((f: any) => {
            const val = item.data[f.id] ?? item.data[f.name];
            if (!val) return null;
            return (
              <div key={f.id} className="flex justify-between text-xs">
                <span style={{ color: "var(--foreground-dimmed)" }}>{f.name}</span>
                <span className="font-medium truncate max-w-[120px]" title={String(val)}>
                  {f.type === "CURRENCY" ? `₹${val}` : String(val)}
                </span>
              </div>
            )
          })}
      </div>
    </>
  );
};

const KanbanCard = ({ item, fields, groupByField, onClick, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, isDragging }: any) => {
  return (
    <div
      data-card-id={item.id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDragStart={e => e.preventDefault()}
      className="rounded-xl p-4 text-sm shadow-sm transition-all cursor-pointer group card-interactive relative"
      onClick={onClick}
      style={{
        opacity: isDragging ? 0 : 1,
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
        color: "var(--foreground)",
        touchAction: 'none'
      }}
    >
      <KanbanCardContent item={item} fields={fields} groupByField={groupByField} />
    </div>
  );
};

function KanbanColumn({ col, items, fields, groupByField, accent, onAdd, onCardClick, dragHandlers, draggingCardId }: any) {
  return (
    <div
      data-column-id={col}
      className="flex-1 rounded-xl p-3.5 min-w-[280px] snap-start flex flex-col max-h-[70vh] overflow-hidden transition-colors"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: accent }} />
          <h4 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
            {col}
          </h4>
        </div>
        <span className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md" style={{ background: "var(--surface-3)", color: "var(--foreground-dimmed)" }}>
          {items.length}
        </span>
      </div>
      
      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-2">
        {items.map((item: any) => (
          <KanbanCard 
            key={item.id} 
            item={item} 
            fields={fields} 
            groupByField={groupByField} 
            onClick={() => onCardClick(item)}
            isDragging={item.id === draggingCardId}
            onPointerDown={(e: any) => dragHandlers.down(e, col, item.id)}
            onPointerMove={(e: any) => dragHandlers.move(e, col, item.id)}
            onPointerUp={(e: any) => dragHandlers.up(e, col, item.id)}
            onPointerCancel={(e: any) => dragHandlers.cancel(e, col, item.id)}
          />
        ))}

        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition-colors text-xs font-semibold mt-2"
          style={{ borderColor: "var(--border)", color: "var(--foreground-dimmed)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.background = "color-mix(in oklch, var(--primary), transparent 95%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--foreground-dimmed)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

export function KanbanView({ config, tableId }: { config: any; tableId?: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const { data: fields } = useSWR(tableId ? `/api/tables/${tableId}/fields` : null, fetcher);
  const { data: recordsData, mutate: refreshRecords } = useSWR(tableId ? `/api/tables/${tableId}/records` : null, fetcher);

  // --- Pointer Drag State ---
  const dragRef = useRef<any>(null);
  const ghostRef = useRef<any>(null);
  const wasDraggingRef = useRef<boolean>(false);

  const removeGhost = () => {
    if (ghostRef.current) {
        if (ghostRef.current.parentNode) {
            ghostRef.current.parentNode.removeChild(ghostRef.current);
        }
        ghostRef.current = null;
    }
    document.querySelectorAll('.kanban-ghost').forEach(el => el.remove());
  };

  useEffect(() => {
    const sweepGhosts = () => {
         setTimeout(() => {
             if (dragRef.current) {
                 dragRef.current = null;
                 setDraggingCardId(null);
             }
             removeGhost();
         }, 100);
    };
    window.addEventListener('pointerup', sweepGhosts);
    window.addEventListener('pointercancel', sweepGhosts);
    return () => {
        window.removeEventListener('pointerup', sweepGhosts);
        window.removeEventListener('pointercancel', sweepGhosts);
        removeGhost();
    };
  }, []);

  if (!tableId) {
    return (
      <div
        className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
          background: "var(--surface-sunken)",
        }}
      >
        <Kanban className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No table configured or table not found.</p>
      </div>
    );
  }

  const records = recordsData?.records || [];
  const groupByField = config.groupByField;

  const fieldConfig = fields?.find((f: any) => f.name === groupByField || f.packFieldKey === groupByField);
  const columns: string[] = fieldConfig?.config?.options || ["Draft", "Sent", "Received", "Cancelled"];

  const grouped: Record<string, any[]> = {};
  columns.forEach((col) => { grouped[col] = []; });

  records.forEach((r: any) => {
    const val = (fieldConfig && r.data[fieldConfig.id]) ?? r.data[groupByField];
    const groupName = val || columns[0];
    if (!grouped[groupName]) {
      grouped[groupName] = [];
    }
    grouped[groupName].push(r);
  });

  const moveCard = async (cardId: string, targetCol: string) => {
    const r = records.find((rec: any) => rec.id === cardId);
    if (!r) return;
    const currentColumn = ((fieldConfig && r.data[fieldConfig.id]) ?? r.data[groupByField]) || columns[0];
    
    if (currentColumn === targetCol) return;

    const updatedRecords = records.map((rec: any) => {
      if (rec.id === cardId) {
        return {
          ...rec,
          data: {
            ...rec.data,
            [fieldConfig ? fieldConfig.id : groupByField]: targetCol
          }
        };
      }
      return rec;
    });
    
    refreshRecords({ records: updatedRecords, ...recordsData }, false);

    try {
      await fetch(`/api/tables/${tableId}/records/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { [fieldConfig ? fieldConfig.id : groupByField]: targetCol }
        })
      });
      refreshRecords();
    } catch (err) {
      console.error("Failed to update record", err);
      refreshRecords(); 
    }
  };

  const handleCardPointerDown = (e: any, colId: string, cardId: string) => {
    if (e.button !== 0 && e.nativeEvent?.type !== 'pointerdown') return;
    
    dragRef.current = {
        cardId,
        colId,
        startX: e.clientX,
        startY: e.clientY,
        isDragging: false,
        pointerId: e.pointerId,
        offsetX: 0,
        offsetY: 0,
    };
  };

  const handleCardPointerMove = (e: any, colId: string, cardId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.cardId !== cardId || drag.colId !== colId) return;

    if (!drag.isDragging) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 8) return;

        drag.isDragging = true;
        setDraggingCardId(cardId);
        e.currentTarget.setPointerCapture(drag.pointerId);

        const rect = e.currentTarget.getBoundingClientRect();
        drag.offsetX = e.clientX - rect.left;
        drag.offsetY = e.clientY - rect.top;

        removeGhost();
        const ghost = document.createElement('div');
        ghost.className = 'kanban-ghost';
        ghost.style.cssText = [
            'position:fixed',
            'pointer-events:none',
            `z-index:99999`,
            `width:${rect.width}px`,
            `left:${rect.left}px`,
            `top:${rect.top}px`,
            'background:var(--card)',
            'border:1.5px solid var(--primary)',
            'border-radius:12px',
            'padding:16px',
            'font-size:14px',
            'color:var(--foreground)',
            'opacity:0.9',
            'box-shadow:0 10px 25px rgba(0,0,0,0.1)',
            'transform:rotate(2deg) scale(1.02)',
        ].join(';');
        
        ghost.innerHTML = e.currentTarget.innerHTML;
        document.body.appendChild(ghost);
        ghostRef.current = ghost;
    }

    if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - drag.offsetX}px`;
        ghostRef.current.style.top  = `${e.clientY - drag.offsetY}px`;
    }
  };

  const handleCardPointerUp = (e: any, colId: string, cardId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.cardId !== cardId || drag.colId !== colId) return;
    
    if (drag.isDragging) {
      wasDraggingRef.current = true;
      setTimeout(() => { wasDraggingRef.current = false; }, 50);
    }
    
    dragRef.current = null;
    setDraggingCardId(null);

    if (!drag.isDragging) {
      if (ghostRef.current) ghostRef.current.style.display = 'none';
      if (e.currentTarget.hasPointerCapture(drag.pointerId)) {
        e.currentTarget.releasePointerCapture(drag.pointerId);
      }
      removeGhost();
      return;
    }

    if (e.currentTarget.hasPointerCapture(drag.pointerId)) {
        e.currentTarget.releasePointerCapture(drag.pointerId);
    }

    if (ghostRef.current) ghostRef.current.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    removeGhost();

    const targetColumn = el?.closest('[data-column-id]') as HTMLElement;
    if (targetColumn) {
        const targetColId = targetColumn.dataset.columnId;
        if (targetColId) {
            moveCard(cardId, targetColId);
        }
    }
  };

  const handleCardPointerCancel = (e: any, colId: string, cardId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.cardId !== cardId) return;
    dragRef.current = null;
    setDraggingCardId(null);
    removeGhost();
  };

  const dragHandlers = {
    down: handleCardPointerDown,
    move: handleCardPointerMove,
    up: handleCardPointerUp,
    cancel: handleCardPointerCancel
  };

  return (
    <div className="w-full min-w-0 max-w-full h-full flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "color-mix(in oklch, var(--accent-violet), transparent 85%)",
              color: "var(--accent-violet)",
            }}
          >
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            {config.tableRef || "Kanban Board"}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md"
            style={{
              background: "var(--surface-3)",
              color: "var(--foreground-dimmed)",
            }}
          >
            {records.length} {records.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x relative flex-1 min-h-0 select-none">
        {columns.map((col) => {
          const items = grouped[col] || [];
          const accent = COL_ACCENTS[col] || "var(--foreground-dimmed)";
          return (
            <KanbanColumn
              key={col}
              col={col}
              items={items}
              fields={fields}
              groupByField={groupByField}
              accent={accent}
              dragHandlers={dragHandlers}
              draggingCardId={draggingCardId}
              onCardClick={(item: any) => {
                if (draggingCardId === item.id || wasDraggingRef.current) return;
                setSelectedRecordId(item.id);
                setIsFormOpen(true);
              }}
              onAdd={() => {
                setSelectedRecordId(undefined);
                setIsFormOpen(true);
              }}
            />
          );
        })}
      </div>

      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tableId={tableId}
        recordId={selectedRecordId}
        recordData={selectedRecordId ? records.find((r: any) => r.id === selectedRecordId)?.data : undefined}
        onSuccess={() => {
          refreshRecords();
          setIsFormOpen(false);
        }}
        fields={fields || []}
      />
    </div>
  );
}
