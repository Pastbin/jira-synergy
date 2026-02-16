export type Status = "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "DONE";

export interface UserDTO {
  id: string;
  name: string | null;
  email: string;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  projectId: string;
  assigneeId: string | null;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMovedEvent {
  taskId: string;
  projectId: string;
  newStatus: Status;
  userId: string;
}
