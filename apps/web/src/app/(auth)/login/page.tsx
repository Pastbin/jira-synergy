"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as S from "@/components/AuthStyles";

// Страница авторизации пользователя
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Обработка отправки формы входа
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Попытка входа через NextAuth
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/projects"); // Перенаправление на список проектов
    }
  };

  return (
    <S.AuthContainer>
      <S.AuthCard>
        <S.Title>Вход в Jira Synergy</S.Title>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Электронная почта</S.Label>
            <S.Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Пароль</S.Label>
            <S.Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </S.FormGroup>
          {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}
          <S.Button type="submit">Войти</S.Button>
        </form>
        <S.ToggleLink>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </S.ToggleLink>
      </S.AuthCard>
    </S.AuthContainer>
  );
}
