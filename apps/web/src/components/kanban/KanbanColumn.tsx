import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { ColumnContainer, ColumnHeader, TaskList, AddTaskButton } from "./BoardStyles";
import { TaskCard } from "./TaskCard";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
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
        {title} <span>{tasks.length}</span>
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
