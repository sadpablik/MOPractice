import { useState } from "react";

const STATUS_OPTIONS = ["Новый", "В обработке", "Готов к выдаче", "Выдан", "Отменён"];

export function OrderForm({ order, nextId, onSave, onCancel }) {
  const isEdit = Boolean(order);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    id: order?.id ?? nextId,
    status: order?.status ?? "Новый",
    pickup_address: order?.pickup_address ?? "",
    order_date: order?.order_date ?? today,
    delivery_date: order?.delivery_date ?? "",
    client_full_name: order?.client_full_name ?? "",
    receive_code: order?.receive_code ?? "",
    items: order?.items ?? [{ article: "", quantity: 1 }],
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // Обновление одного поля в конкретной строке состава заказа
  function setItem(index, field, value) {
    setForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { article: "", quantity: 1 }] }));
  }

  function removeItem(index) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function validate() {
    const errs = {};
    if (!form.status) errs.status = "Обязательное поле";
    if (!form.pickup_address || form.pickup_address.length < 5)
      errs.pickup_address = "Минимум 5 символов";
    if (!form.order_date) errs.order_date = "Укажите дату заказа";
    if (!form.delivery_date) errs.delivery_date = "Укажите дату выдачи";
    if (!form.receive_code || form.receive_code.length < 3)
      errs.receive_code = "Минимум 3 символа (код выдачи)";
    if (form.items.length === 0) errs.items = "Добавьте хотя бы один товар в состав";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSave(form, isEdit);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{isEdit ? `Редактирование заказа №${order.id}` : "Добавление заказа"}</h2>
          <button type="button" className="ghost-btn" onClick={onCancel}>
            ✕ Закрыть
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            № заказа <span className="hint">(только чтение)</span>
            <input value={form.id} disabled />
          </label>

          <label>
            Статус заказа
            <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && <span className="field-error">{errors.status}</span>}
          </label>

          <label>
            Адрес пункта выдачи
            <input
              value={form.pickup_address}
              placeholder="420151, г. Казань, ул. Пушкина, 1"
              onChange={(e) => setField("pickup_address", e.target.value)}
            />
            {errors.pickup_address && (
              <span className="field-error">{errors.pickup_address}</span>
            )}
          </label>

          <div className="form-row">
            <label>
              Дата заказа
              <input
                type="date"
                value={form.order_date}
                onChange={(e) => setField("order_date", e.target.value)}
              />
              {errors.order_date && <span className="field-error">{errors.order_date}</span>}
            </label>
            <label>
              Дата выдачи
              <input
                type="date"
                value={form.delivery_date}
                onChange={(e) => setField("delivery_date", e.target.value)}
              />
              {errors.delivery_date && (
                <span className="field-error">{errors.delivery_date}</span>
              )}
            </label>
          </div>

          <label>
            ФИО клиента
            <input
              value={form.client_full_name}
              onChange={(e) => setField("client_full_name", e.target.value)}
            />
          </label>

          <label>
            Код получения
            <input
              value={form.receive_code}
              placeholder="от 3 символов"
              onChange={(e) => setField("receive_code", e.target.value)}
            />
            {errors.receive_code && <span className="field-error">{errors.receive_code}</span>}
          </label>

          {/* Динамический список товаров в составе заказа */}
          <div>
            <div className="items-header">
              <strong>Состав заказа</strong>
              <button type="button" className="ghost-btn" onClick={addItem}>
                + Добавить строку
              </button>
            </div>
            {errors.items && <span className="field-error">{errors.items}</span>}
            {form.items.map((item, i) => (
              <div key={i} className="form-row items-row">
                <label>
                  Артикул
                  <input
                    value={item.article}
                    onChange={(e) => setItem(i, "article", e.target.value)}
                  />
                </label>
                <label>
                  Кол-во
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => setItem(i, "quantity", parseInt(e.target.value) || 1)}
                  />
                </label>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="delete-btn"
                    style={{ alignSelf: "flex-end" }}
                    onClick={() => removeItem(i)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Добавить заказ"}
            </button>
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
