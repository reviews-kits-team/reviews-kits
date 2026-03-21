import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Pencil,
  Share2,
  Layers,
  Pause,
  Play,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Badge, Stars } from './ui';
import type { DashboardForm } from './types';

interface SortableRowProps {
  form: DashboardForm;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTogglePause: (id: string) => void;
}

const SortableRow = ({ form, isSelected, onSelect, onOpen, onDelete, onDuplicate, onTogglePause }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: form.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-[var(--v3-teal)]/[0.03]' : ''}`}
    >
      <td className="py-3.5 pl-4 w-10">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[var(--v3-muted2)] hover:text-[var(--v3-text)] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={16} />
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(form.id, e.target.checked)}
            className="w-4 h-4 rounded border-[var(--v3-border)] bg-[var(--v3-bg)] text-[var(--v3-teal)] focus:ring-offset-0 focus:ring-0 cursor-pointer"
          />
        </div>
      </td>
      <td className="py-3.5 px-4 min-w-[240px]" onClick={() => onOpen(form.id)}>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[var(--v3-teal-dim)] border border-[var(--v3-teal)]/20 flex items-center justify-center shrink-0 text-[var(--v3-teal)]">
            <FileText size={16} />
          </div>
          <div className="min-w-0 max-w-[140px] sm:max-w-[180px]">
            <div className="font-bold text-[var(--v3-text)] truncate" title={form.name}>
              {form.name.length > 25 ? form.name.substring(0, 25) + '...' : form.name}
            </div>
            <div className="text-[9px] text-[var(--v3-muted2)] font-mono truncate opacity-50">/f/{form.slug}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        <Badge status={form.isActive ? 'active' : 'paused'} />
      </td>
      <td className="py-3.5 px-4 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-[var(--v3-text)]">{form.responses ?? 0}</span>
          <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--v3-muted2)] opacity-60">Réponses</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-center hidden sm:table-cell">
        <div className="flex flex-col items-center">
          <div className="h-4 flex items-center justify-center">
            {form.rating ? <Stars rating={form.rating} size={10} /> : <span className="text-[var(--v3-muted2)]">—</span>}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--v3-muted2)] opacity-60 mt-0.5">Note moy.</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1 w-24 mx-auto">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[9px] font-bold text-[var(--v3-muted2)] opacity-60 uppercase">Progress</span>
            <span className="text-[9px] font-bold text-[var(--v3-teal)]">{form.completion ?? 0}%</span>
          </div>
          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--v3-teal)] transition-all" style={{ width: `${form.completion ?? 0}%` }} />
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:bg-white/5 rounded-lg transition-all group/btn"
            title="Témoignages"
            onClick={() => onOpen(form.id)}
          >
            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
          </button>

          <button
            className="p-2 text-[var(--v3-muted2)] hover:text-[var(--v3-teal)] hover:bg-[var(--v3-teal)]/10 rounded-lg transition-all group/btn"
            title="Éditer"
          >
            <Pencil size={14} className="group-hover/btn:scale-110 transition-transform" />
          </button>

          <button
            className="p-2 text-[var(--v3-muted2)] hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all group/btn"
            title="Dupliquer"
            onClick={() => onDuplicate(form.id)}
          >
            <Layers size={14} className="group-hover/btn:scale-110 transition-transform" />
          </button>

          <button
            className="p-2 text-[var(--v3-muted2)] hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all group/btn"
            title="Partager"
            onClick={() => copyToClipboard(`https://reviewskits.com/f/${form.slug}`)}
          >
            <Share2 size={14} className="group-hover/btn:scale-110 transition-transform" />
          </button>

          <button
            className={`p-2 rounded-lg transition-all group/btn ${form.isActive ? 'text-[var(--v3-muted2)] hover:text-amber-400 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
            title={form.isActive ? "Mettre en pause" : "Activer"}
            onClick={() => onTogglePause(form.id)}
          >
            {form.isActive ? <Pause size={14} className="group-hover/btn:scale-110 transition-transform" /> : <Play size={14} className="group-hover/btn:scale-110 transition-transform" />}
          </button>

          <button
            className="p-2 text-[var(--v3-muted2)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group/btn"
            title="Supprimer"
            onClick={() => onDelete(form.id)}
          >
            <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface FormTableProps {
  forms: DashboardForm[];
  onReorder: (newForms: DashboardForm[]) => void;
  onOpenForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
  onToggleFormStatus: (id: string) => void;
  onDuplicateForm: (id: string) => void;
}

export const FormTable = ({
  forms,
  onReorder,
  onOpenForm,
  onDeleteForm,
  onToggleFormStatus,
  onDuplicateForm
}: FormTableProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = forms.findIndex((f) => f.id === active.id);
      const newIndex = forms.findIndex((f) => f.id === over.id);
      onReorder(arrayMove(forms, oldIndex, newIndex));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(forms.map(f => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  return (
    <div className="relative overflow-hidden bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl shadow-2xl">
      {/* Bulk Toolbar */}
      {selectedIds.size > 0 && (
        <div className="absolute top-0 left-0 right-0 z-20 h-14 bg-[var(--v3-teal)] flex items-center justify-between px-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white">{selectedIds.size} sélectionné(s)</span>
            <div className="h-4 w-px bg-white/20" />
            <button className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-xs uppercase tracking-wider transition-all">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/70 hover:text-white transition-all"
          >
            Annuler
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={forms.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="py-4 pl-4 w-10">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0" /> {/* Space for grip */}
                      <input
                        type="checkbox"
                        checked={forms.length > 0 && selectedIds.size === forms.length}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--v3-border)] bg-[var(--v3-bg)] text-[var(--v3-teal)] focus:ring-offset-0 focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)]">Formulaire</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] hidden md:table-cell">Status</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] text-center">Stats</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] text-center hidden sm:table-cell">Rating</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] text-center">Complétion</th>
                  <th className="py-4 px-4 text-right pr-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {forms.map((form) => (
                  <SortableRow
                    key={form.id}
                    form={form}
                    isSelected={selectedIds.has(form.id)}
                    onSelect={toggleSelect}
                    onOpen={onOpenForm}
                    onDelete={onDeleteForm}
                    onTogglePause={onToggleFormStatus}
                    onDuplicate={onDuplicateForm}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
