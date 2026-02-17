import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { ColumnContainer, ColumnHeader, TaskList, AddTaskButton, StatusBadge } from "./BoardStyles";
import { TaskCard } from "./TaskCard";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  order: number;
  assignees: { id: string; name: string | null; email: string }[];
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn = React.memo(({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) => {
  return (
    <ColumnContainer>
      <ColumnHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusBadge $status={id}>{title}</StatusBadge>
          <span style={{ color: "#5e6c84", fontSize: "0.85rem" }}>{tasks.length}</span>
        </div>
      </ColumnHeader>
      <Droppable droppableId={id}>
        {(provided) => (
          <TaskList {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
      <AddTaskButton onClick={() => onAddTask(id)}>
        <Plus size={16} /> Добавить задачу
      </AddTaskButton>
    </ColumnContainer>
  );
});

KanbanColumn.displayName = "KanbanColumn";
