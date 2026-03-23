import { useState } from "react";
import { api } from "../api";
import { OrderForm } from "./OrderForm";

export function OrdersTable({ orders, role, onDataChange }) {
  // Хуки должны вызываться до любого раннего возврата
  const [editingOrder, setEditingOrder] = useState(null);
  const [addingOrder, setAddingOrder] = useState(false);
  const [actionError, setActionError] = useState("");

  if (role !== "Администратор" && role !== "Менеджер") return null;

  const isAdmin = role === "Администратор";

  // Следующий ID = максимальный существующий + 1
  const nextId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

  function handleRowClick(order) {
    if (!isAdmin || editingOrder) return;
    setEditingOrder(order);
    setActionError("");
  }

  async function handleSaveOrder(formData, isEdit) {
    try {
      if (isEdit) {
        await api.updateOrder(editingOrder.id, formData);
      } else {
        await api.createOrder(formData);
      }
      setEditingOrder(null);
      setAddingOrder(false);
      onDataChange();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm(`Удалить заказ №${orderId}? Это действие необратимо.`)) return;
    try {
      setActionError("");
      await api.deleteOrder(orderId);
      onDataChange();
    } catch (err) {
      setActionError(`Ошибка удаления: ${err.message}`);
    }
  }

  return (
    <>
      {(editingOrder || addingOrder) && (
        <OrderForm
          order={editingOrder}
          nextId={nextId}
          onSave={handleSaveOrder}
          onCancel={() => {
            setEditingOrder(null);
            setAddingOrder(false);
          }}
        />
      )}

      <section className="card">
        <div className="panel-header">
          <h2>Заказы</h2>
          <div className="panel-header-actions">
            <span className="badge">{orders.length} шт.</span>
            {isAdmin && (
              <button
                type="button"
                className="primary-btn"
                disabled={Boolean(editingOrder)}
                onClick={() => {
                  setAddingOrder(true);
                  setActionError("");
                }}
              >
                + Добавить заказ
              </button>
            )}
          </div>
        </div>

        {actionError && <p className="error" style={{ marginTop: "10px" }}>{actionError}</p>}

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
                {isAdmin && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={isAdmin ? "clickable-row" : ""}
                  onClick={() => handleRowClick(order)}
                >
                  <td>{order.id}</td>
                  <td>{order.status}</td>
                  <td>{order.client_full_name || "—"}</td>
                  <td>{order.pickup_address}</td>
                  <td>{order.order_date}</td>
                  <td>{order.delivery_date}</td>
                  <td>
                    {order.items.map((item) => `${item.article} ×${item.quantity}`).join(", ")}
                  </td>
                  {isAdmin && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order.id)}
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
