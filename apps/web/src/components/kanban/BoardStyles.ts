import styled from "styled-components";

export const BoardContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
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
`;

export const Modal = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 4px 0 16px 0;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #4c9aff;
    box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 4px 0 16px 0;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: #4c9aff;
  }
`;

export const SubmitButton = styled.button`
  background-color: #0052cc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
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
  background-color: #de350b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background-color: #bf2600;
  }
`;
