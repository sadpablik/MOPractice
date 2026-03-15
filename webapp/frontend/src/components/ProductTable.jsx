import { API_URL } from "../api";

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
      <span className="old-price">{product.price.toFixed(2)} ₽</span>
      <span className="new-price">{product.final_price.toFixed(2)} ₽</span>
    </div>
  );
}

export function ProductTable({ products, role, query, setQuery, supplier, setSupplier, suppliers }) {
  const canFilter = role === "Администратор" || role === "Менеджер";

  return (
    <section className="card">
      <div className="panel-header">
        <h2>Товары</h2>
        <span className="badge">{products.length} шт.</span>
      </div>

      {canFilter ? (
        <div className="filters">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию, категории, поставщику..."
          />
          <select value={supplier} onChange={(event) => setSupplier(event.target.value)}>
            <option value="all">Все поставщики</option>
            {suppliers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Фото</th>
              <th>Артикул</th>
              <th>Наименование</th>
              <th>Категория</th>
              <th>Поставщик</th>
              <th>Остаток</th>
              <th>Скидка</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.article} style={rowStyle(product)}>
                <td>
                  <img
                    className="product-image"
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `${API_URL}/images/picture.png`;
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
