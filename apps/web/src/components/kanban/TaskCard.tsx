import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { TaskCardWrapper, PriorityBadge, AvatarCircle } from "./BoardStyles";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  order: number;
  assignees: { id: string; name: string | null; email: string }[];
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

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
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.9rem", color: "#172b4d", fontWeight: 500, marginBottom: "8px" }}>
              {task.title}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PriorityBadge $priority={task.priority}>
                {task.priority === "LOW" && "↓"}
                {task.priority === "MEDIUM" && "="}
                {task.priority === "HIGH" && "↑"}
                {task.priority === "URGENT" && "!!!"}
              </PriorityBadge>

              <div style={{ display: "flex", marginLeft: "auto" }}>
                {task.assignees?.slice(0, 3).map((a, i) => (
                  <AvatarCircle
                    key={a.id}
                    style={{
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      marginLeft: i > 0 ? -6 : 0,
                      border: "2px solid white",
                      zIndex: 10 - i,
                    }}
                    title={a.name || a.email}
                  >
                    {getInitials(a.name)}
                  </AvatarCircle>
                ))}
                {task.assignees?.length > 3 && (
                  <div style={{ fontSize: 10, color: "#6b778c", alignSelf: "center", marginLeft: 4 }}>
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TaskCardWrapper>
      )}
    </Draggable>
  );
});

TaskCard.displayName = "TaskCard";
