import styled from "styled-components";

export const BoardContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
`;

export const PresenceBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  align-items: center;
`;

export const UserAvatar = styled.div<{ $color?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => props.$color || "#091e420f"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #ebecf0;
  position: relative;

  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: #172b4d;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 10;
  }
`;

export const ColumnContainer = styled.div`
  background-color: #f4f5f7;
  border-radius: 8px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

export const ColumnHeader = styled.div`
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #5e6c84;
  text-transform: uppercase;
  font-size: 0.75rem;

  span {
    background: #ebecf0;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 10px;
  }
`;

export const TaskList = styled.div`
  padding: 8px;
  flex: 1;
  overflow-y: auto;
  min-height: 50px;
`;

export const TaskCardWrapper = styled.div`
  background: white;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: #f4f5f7;
    border-color: #dfe1e6;
  }
`;

export const AddTaskButton = styled.button`
  background: transparent;
  border: none;
  color: #42526e;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin: 4px 8px 8px 8px;

  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 30, 66, 0.54);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const Modal = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
  box-shadow:
    0 20px 40px -12px rgba(9, 30, 66, 0.25),
    0 0 1px rgba(9, 30, 66, 0.31);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  margin: 8px 0 20px 0;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4c9aff;
    box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  margin: 8px 0 20px 0;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4c9aff;
    box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
  }
`;

export const SubmitButton = styled.button`
  background-color: #0052cc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: #0747a6;
  }

  &:disabled {
    background-color: #ebecf0;
    color: #a5adba;
    cursor: not-allowed;
  }
`;

export const DeleteButton = styled.button`
  background-color: #ffebe6;
  color: #bf2600;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: #ffbdad;
  }
`;

export const Toast = styled.div<{ $type?: "success" | "error" | "warning" }>`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${(props) => {
    if (props.$type === "error") return "#DE350B";
    if (props.$type === "warning") return "#FFAB00";
    return "#36B37E";
  }};
  color: ${(props) => (props.$type === "warning" ? "#172B4D" : "white")};
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2000;
  font-weight: 500;
  animation: slideUpToast 0.3s ease-out;

  @keyframes slideUpToast {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 2px solid #ebecf0;
  margin-bottom: 16px;
  margin-top: 16px;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 8px 4px;
  cursor: pointer;
  font-weight: 600;
  color: ${(props) => (props.$active ? "#0052cc" : "#5e6c84")};
  border-bottom: 2px solid ${(props) => (props.$active ? "#0052cc" : "transparent")};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: #0052cc;
  }
`;

export const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dfe1e6;
    border-radius: 3px;
  }
`;

export const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
`;

export const AvatarCircle = styled.div<{ $color?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) => props.$color || "#0052cc"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

export const CommentContent = styled.div`
  flex: 1;
  background: #f4f5f7;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-weight: 600;
  color: #172b4d;
`;

export const CommentTime = styled.span`
  font-weight: 400;
  font-size: 12px;
  color: #6b778c;
`;

export const ActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ebecf0;
  font-size: 14px;
  align-items: flex-start;

  svg {
    color: #5e6c84;
    margin-top: 2px;
  }
`;

export const ActivityText = styled.div`
  color: #172b4d;
  line-height: 1.4;

  span {
    font-weight: 600;
  }

  em {
    font-style: normal;
    color: #6b778c;
    font-size: 12px;
    display: block;
    margin-top: 2px;
  }
`;

export const ConfirmOverlay = styled(ModalOverlay)`
  z-index: 3000;
  background: rgba(9, 30, 66, 0.7);
  backdrop-filter: blur(2px);
`;

export const ConfirmBox = styled.div`
  background: white;
  padding: 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 66px -20px rgba(9, 30, 66, 0.5);
  text-align: center;
`;

export const DangerIcon = styled.div`
  color: #de350b;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
`;
