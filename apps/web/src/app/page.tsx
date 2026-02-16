import Link from "next/link";

// Главная страница приложения (Landing)
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
      <div className="text-center p-12 bg-white rounded-xl shadow-xl max-w-lg border border-slate-200">
        <h1 className="text-5xl font-extrabold text-[#0052cc] mb-6">Jira Synergy</h1>
        <p className="text-slate-600 text-lg mb-10 leading-relaxed">
          Профессиональный инструмент для управления проектами и задачами по методологиям Agile и Kanban.
        </p>
        <div className="flex gap-6 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-[#0052cc] text-white rounded-md font-bold hover:bg-[#0747a6] transition-all shadow-md"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 border-2 border-[#0052cc] text-[#0052cc] rounded-md font-bold hover:bg-[#0052cc]/5 transition-all"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </main>
  );
}
