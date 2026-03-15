import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { LoginPanel } from "./components/LoginPanel";
import { OrdersTable } from "./components/OrdersTable";
import { ProductTable } from "./components/ProductTable";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [supplier, setSupplier] = useState("all");

  const suppliers = useMemo(
    () => [...new Set(products.map((product) => product.supplier))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const bySupplier = supplier === "all" || product.supplier === supplier;
      const byQuery =
        normalizedQuery.length === 0 ||
        [product.article, product.name, product.category, product.supplier, product.manufacturer]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return bySupplier && byQuery;
    });
  }, [products, query, supplier]);

  async function loadData() {
    const [productData, orderData] = await Promise.all([api.getProducts(), api.getOrders()]);
    setProducts(productData);
    setOrders(orderData);
  }

  useEffect(() => {
    if (!user) return;
    loadData().catch((requestError) => setError(requestError.message));
  }, [user]);

  async function handleLogin(payload) {
    try {
      setLoading(true);
      setError("");
      const authUser = await api.login(payload);
      setUser(authUser);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    setUser({ full_name: "Гость", role: "Гость" });
    loadData().catch((requestError) => setError(requestError.message));
  }

  function handleLogout() {
    setUser(null);
    setError("");
    setQuery("");
    setSupplier("all");
  }

  if (!user) {
    return (
      <main className="layout auth-layout">
        <LoginPanel onLogin={handleLogin} onGuest={handleGuest} loading={loading} error={error} />
      </main>
    );
  }

  return (
    <main className="layout">
      <header className="topbar card">
        <div>
          <p className="hint">Панель управления</p>
          <h1>Склад обуви</h1>
        </div>
        <div className="user-box">
          <p>{user.full_name}</p>
          <small>{user.role}</small>
          <button type="button" className="secondary-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      {error ? <p className="error global-error">{error}</p> : null}

      <ProductTable
        products={filteredProducts}
        role={user.role}
        query={query}
        setQuery={setQuery}
        supplier={supplier}
        setSupplier={setSupplier}
        suppliers={suppliers}
      />
      <OrdersTable orders={orders} role={user.role} />
    </main>
  );
}
