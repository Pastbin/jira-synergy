"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as S from "@/components/AuthStyles";

// Страница регистрации нового пользователя
export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  // Обработка регистрации
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/login"); // Переход на логин после успеха
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка при регистрации");
    }
  };

  return (
    <S.AuthContainer>
      <S.AuthCard>
        <S.Title>Регистрация</S.Title>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Имя</S.Label>
            <S.Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Электронная почта</S.Label>
            <S.Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Пароль</S.Label>
            <S.Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </S.FormGroup>
          {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}
          <S.Button type="submit">Создать аккаунт</S.Button>
        </form>
        <S.ToggleLink>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </S.ToggleLink>
      </S.AuthCard>
    </S.AuthContainer>
  );
}
