import { useMemo, useState } from "react";
import { API_URL, api } from "../api";
import { ProductForm } from "./ProductForm";

// Определяет стиль строки по остатку и скидке
function rowStyle(product) {
  if (product.stock_qty === 0) return { backgroundColor: "#bde9ff" };
  if (product.discount_percent > 15) return { backgroundColor: "#2e8b57", color: "white" };
  return {};
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return `${API_URL}/images/picture.png`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("/")) return `${API_URL}${imageUrl}`;
  return `${API_URL}/images/${imageUrl}`;
}

function PriceCell({ product }) {
  if (product.discount_percent <= 0) return <span>{product.price.toFixed(2)} ₽</span>;

  return (
    <div>
      {/* Перечёркнутая цена отображается красным при наличии скидки */}
      <span className="old-price">{product.price.toFixed(2)} ₽</span>
      <span className="new-price">{product.final_price.toFixed(2)} ₽</span>
    </div>
  );
}

export function ProductTable({
  products,
  allProducts,
  role,
  query,
  setQuery,
  supplier,
  setSupplier,
  suppliers,
  onDataChange,
}) {
  const canFilter = role === "Администратор" || role === "Менеджер";
  const isAdmin = role === "Администратор";

  // Направление сортировки: null = без сортировки, "asc" = по возрастанию, "desc" = по убыванию
  const [sortDir, setSortDir] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [actionError, setActionError] = useState("");

  const categories = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))].sort(),
    [allProducts],
  );
  const manufacturers = useMemo(
    () => [...new Set(allProducts.map((p) => p.manufacturer))].sort(),
    [allProducts],
  );

  // Применяем сортировку поверх уже отфильтрованного списка
  const sortedProducts = useMemo(() => {
    if (!sortDir) return products;
    return [...products].sort((a, b) =>
      sortDir === "asc" ? a.stock_qty - b.stock_qty : b.stock_qty - a.stock_qty,
    );
  }, [products, sortDir]);

  function toggleSort() {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  // Открытие редактирования: запрещено открывать второе окно
  function handleRowClick(product) {
    if (!isAdmin || editingProduct) return;
    setEditingProduct(product);
    setActionError("");
  }

  async function handleSaveProduct(formData, isEdit) {
    try {
      if (isEdit) {
        await api.updateProduct(editingProduct.article, formData);
      } else {
        await api.createProduct(formData);
      }
      setEditingProduct(null);
      setAddingProduct(false);
      onDataChange();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDeleteProduct(article) {
    if (!window.confirm(`Удалить товар «${article}»? Это действие необратимо.`)) return;
    try {
      setActionError("");
      await api.deleteProduct(article);
      onDataChange();
    } catch (err) {
      // Уведомляем пользователя: товар нельзя удалить, если он присутствует в заказе
      setActionError(`Ошибка удаления: ${err.message}`);
    }
  }

  return (
    <>
      {(editingProduct || addingProduct) && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          manufacturers={manufacturers}
          onSave={handleSaveProduct}
          onCancel={() => {
            setEditingProduct(null);
            setAddingProduct(false);
          }}
        />
      )}

      <section className="card">
        <div className="panel-header">
          <h2>Товары</h2>
          <div className="panel-header-actions">
            <span className="badge">{products.length} шт.</span>
            {isAdmin && (
              <button
                type="button"
                className="primary-btn"
                disabled={Boolean(editingProduct)}
                onClick={() => {
                  setAddingProduct(true);
                  setActionError("");
                }}
              >
                + Добавить товар
              </button>
            )}
          </div>
        </div>

        {actionError && <p className="error" style={{ marginTop: "10px" }}>{actionError}</p>}

        {canFilter && (
          <div className="filters">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию, артикулу, категории, поставщику..."
            />
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="all">Все поставщики</option>
              {suppliers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Артикул</th>
                <th>Наименование</th>
                <th>Категория</th>
                <th>Поставщик</th>
                <th>
                  Остаток
                  {canFilter && (
                    <button
                      type="button"
                      className="sort-btn"
                      onClick={toggleSort}
                      title="Сортировать по остатку"
                    >
                      {sortDir === "asc" ? " ↑" : sortDir === "desc" ? " ↓" : " ↕"}
                    </button>
                  )}
                </th>
                <th>Скидка</th>
                <th>Цена</th>
                {isAdmin && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr
                  key={product.article}
                  style={rowStyle(product)}
                  className={isAdmin ? "clickable-row" : ""}
                  onClick={() => handleRowClick(product)}
                >
                  <td>
                    <img
                      className="product-image"
                      src={resolveImageUrl(product.image_url)}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `${API_URL}/images/picture.png`;
                      }}
                    />
                  </td>
                  <td>{product.article}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.supplier}</td>
                  <td>{product.stock_qty}</td>
                  <td>{product.discount_percent}%</td>
                  <td>
                    <PriceCell product={product} />
                  </td>
                  {isAdmin && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.article)}
                      >
                        Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
