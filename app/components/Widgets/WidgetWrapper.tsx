import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconX } from '@tabler/icons-react';
import { ActionIcon, Paper } from '@mantine/core';

interface WidgetWrapperProps {
  id: string;
  children: React.ReactNode;
  onDelete: (id: string) => void;
}

export function WidgetWrapper({ id, children, onDelete }: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    onDelete(id);
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      shadow="sm"
      p="md"
      withBorder
      {...attributes}
      {...listeners}
    >
      <div className="draggable-handle" style={{ cursor: 'move' }}>
        <ActionIcon
          onClick={handleDelete}
          style={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}
        >
          <IconX size={18} />
        </ActionIcon>
      </div>
      {children}
    </Paper>
  );
}