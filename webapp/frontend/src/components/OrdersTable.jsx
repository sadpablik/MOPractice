export function OrdersTable({ orders, role }) {
  if (role !== "Администратор" && role !== "Менеджер") {
    return null;
  }

  return (
    <section className="card">
      <div className="panel-header">
        <h2>Заказы</h2>
        <span className="badge">{orders.length} шт.</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Статус</th>
              <th>Клиент</th>
              <th>Пункт выдачи</th>
              <th>Дата заказа</th>
              <th>Дата выдачи</th>
              <th>Состав</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>{order.client_full_name || "Гость"}</td>
                <td>{order.pickup_address}</td>
                <td>{order.order_date}</td>
                <td>{order.delivery_date}</td>
                <td>{order.items.map((item) => `${item.article} x${item.quantity}`).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
