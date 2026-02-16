import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { TaskCardWrapper } from "./BoardStyles";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export const TaskCard = React.memo(({ task, index, onClick }: TaskCardProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <TaskCardWrapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
        >
          <div style={{ fontSize: "0.9rem", color: "#172b4d", fontWeight: 500 }}>{task.title}</div>
          {task.description && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#5e6c84",
                marginTop: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {task.description}
            </div>
          )}
        </TaskCardWrapper>
      )}
    </Draggable>
  );
});

TaskCard.displayName = "TaskCard";
