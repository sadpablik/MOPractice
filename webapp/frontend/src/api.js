export const API_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || "Ошибка запроса");
  }

  return response.json();
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getProducts: () => request("/products"),
  createProduct: (body) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (article, body) =>
    request(`/products/${article}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (article) => request(`/products/${article}`, { method: "DELETE" }),
  getOrders: () => request("/orders"),
};
