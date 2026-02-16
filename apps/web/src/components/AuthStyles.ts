"use client";

import styled from "styled-components";

// Основной контейнер формы
export const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f5f7;
`;

// Карточка формы
export const AuthCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

// Заголовок формы
export const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #172b4d;
  text-align: center;
`;

// Группа ввода (label + input)
export const FormGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`;

// Метка поля ввода
export const Label = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #5e6c84;
`;

// Поле ввода
export const Input = styled.input`
  padding: 0.6rem;
  border: 2px solid #dfe1e6;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #0052cc;
  }
`;

// Основная кнопка действия
export const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #0052cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0747a6;
  }

  &:disabled {
    background-color: #ebecf0;
    cursor: not-allowed;
  }
`;

// Ссылка для переключения между login/register
export const ToggleLink = styled.p`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #5e6c84;

  a {
    color: #0052cc;
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;
