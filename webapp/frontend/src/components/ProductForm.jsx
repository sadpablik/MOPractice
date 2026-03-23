import { useState } from "react";

export function ProductForm({ product, categories, manufacturers, onSave, onCancel }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    article: product?.article ?? "",
    name: product?.name ?? "",
    category: product?.category ?? "",
    description: product?.description ?? "",
    manufacturer: product?.manufacturer ?? "",
    supplier: product?.supplier ?? "",
    price: product?.price ?? 0,
    unit: product?.unit ?? "шт.",
    stock_qty: product?.stock_qty ?? 0,
    discount_percent: product?.discount_percent ?? 0,
    image_url: product?.image_url ?? "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.article.trim()) errs.article = "Обязательное поле";
    if (!form.name.trim() || form.name.length < 2) errs.name = "Минимум 2 символа";
    if (!form.category.trim()) errs.category = "Обязательное поле";
    if (!form.description.trim() || form.description.length < 2)
      errs.description = "Минимум 2 символа";
    if (!form.manufacturer.trim()) errs.manufacturer = "Обязательное поле";
    if (!form.supplier.trim()) errs.supplier = "Обязательное поле";
    if (form.price < 0) errs.price = "Цена не может быть отрицательной";
    if (form.stock_qty < 0) errs.stock_qty = "Количество не может быть отрицательным";
    if (form.discount_percent < 0 || form.discount_percent > 100)
      errs.discount_percent = "Скидка от 0 до 100";
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
          <h2>{isEdit ? `Редактирование товара: ${product.article}` : "Добавление товара"}</h2>
          <button type="button" className="ghost-btn" onClick={onCancel}>
            ✕ Закрыть
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Артикул{" "}
            {isEdit && <span className="hint">(только чтение)</span>}
            <input
              value={form.article}
              disabled={isEdit}
              onChange={(e) => setField("article", e.target.value)}
            />
            {errors.article && <span className="field-error">{errors.article}</span>}
          </label>

          <label>
            Наименование
            <input value={form.name} onChange={(e) => setField("name", e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label>
            Категория товара
            <input
              value={form.category}
              list="categories-list"
              onChange={(e) => setField("category", e.target.value)}
            />
            {/* datalist даёт подсказки из существующих категорий */}
            <datalist id="categories-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </label>

          <label>
            Описание
            <textarea
              value={form.description}
              rows={3}
              onChange={(e) => setField("description", e.target.value)}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>

          <label>
            Производитель
            <input
              value={form.manufacturer}
              list="manufacturers-list"
              onChange={(e) => setField("manufacturer", e.target.value)}
            />
            <datalist id="manufacturers-list">
              {manufacturers.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {errors.manufacturer && <span className="field-error">{errors.manufacturer}</span>}
          </label>

          <label>
            Поставщик
            <input value={form.supplier} onChange={(e) => setField("supplier", e.target.value)} />
            {errors.supplier && <span className="field-error">{errors.supplier}</span>}
          </label>

          <div className="form-row">
            <label>
              Цена (₽)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setField("price", parseFloat(e.target.value) || 0)}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </label>
            <label>
              Единица измерения
              <input value={form.unit} onChange={(e) => setField("unit", e.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Количество на складе
              <input
                type="number"
                min="0"
                value={form.stock_qty}
                onChange={(e) => setField("stock_qty", parseInt(e.target.value) || 0)}
              />
              {errors.stock_qty && <span className="field-error">{errors.stock_qty}</span>}
            </label>
            <label>
              Скидка (%)
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setField("discount_percent", parseInt(e.target.value) || 0)}
              />
              {errors.discount_percent && (
                <span className="field-error">{errors.discount_percent}</span>
              )}
            </label>
          </div>

          <label>
            URL изображения
            <input
              value={form.image_url}
              placeholder="/images/1.jpg"
              onChange={(e) => setField("image_url", e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Добавить товар"}
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
