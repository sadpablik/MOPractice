import { useState } from "react";
import { API_URL } from "../api";

const DEMO_USERS = [
  { login: "admin@shop.local", password: "admin123", role: "Администратор" },
  { login: "manager@shop.local", password: "manager123", role: "Менеджер" },
  { login: "client@shop.local", password: "client123", role: "Клиент" },
];

export function LoginPanel({ onLogin, onGuest, loading, error }) {
  const [form, setForm] = useState({ login: "", password: "" });

  return (
    <section className="card login-card">
      {/* Логотип компании на главной форме */}
      <img
        src={`${API_URL}/images/Icon.png`}
        alt="Логотип ООО Обувь"
        className="logo"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <h1>Shoe Store Control</h1>
      <p className="subtitle">Авторизация и мониторинг товаров в реальном времени</p>

      <div className="demo-users">
        {DEMO_USERS.map((user) => (
          <button
            key={user.login}
            type="button"
            className="ghost-btn"
            onClick={() => setForm({ login: user.login, password: user.password })}
          >
            {user.role}
          </button>
        ))}
      </div>

      <label>
        Логин
        <input
          value={form.login}
          onChange={(event) => setForm((prev) => ({ ...prev, login: event.target.value }))}
          placeholder="email"
        />
      </label>
      <label>
        Пароль
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="••••••"
        />
      </label>

      {error ? <p className="error">{error}</p> : null}

      <div className="actions">
        <button type="button" className="primary-btn" onClick={() => onLogin(form)} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
        <button type="button" className="secondary-btn" onClick={onGuest}>
          Гость
        </button>
      </div>
    </section>
  );
}
