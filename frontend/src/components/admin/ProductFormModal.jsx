import { useEffect, useState, useRef } from 'react'
import { productApi, uploadApi } from '../../services/api'
import { push } from './Toast'

const emptyVariant = () => ({
  sku: '',
  name: '',
  color: '',
  storage: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  isActive: true,
})

function buildEmptyProduct() {
  return {
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    variants: [emptyVariant()],
  }
}

// One image field: handles file picker → upload → preview → replace → delete.
// Keeps `value` in sync with form state via onChange(url|null).
function ImageField({ label, value, onChange, onDelete, required = false }) {
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const fileInputRef = useRef(null)

  // Reset broken-image flag whenever the value changes.
  useEffect(() => {
    setPreviewError(false)
  }, [value])

  const handlePick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so picking the same file twice still triggers onChange.
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      push('Vui lòng chọn file ảnh', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      push('Ảnh tối đa 5 MB', 'error')
      return
    }

    // Capture the old URL so we can clean it up after the new upload
    // succeeds (matches "delete_unused on replace" requirement).
    const previousUrl = value

    setBusy(true)
    setProgress(0)
    try {
      const { url } = await uploadApi.upload(file, (pct) => setProgress(pct))
      onChange(url)
      // Fire-and-forget the cleanup — don't block the form on it.
      if (previousUrl && previousUrl.startsWith('/uploads/')) {
        uploadApi.remove(previousUrl).catch(() => {})
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload thất bại'
      push(msg, 'error')
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!value) return
    if (value.startsWith('/uploads/')) {
      try {
        await uploadApi.remove(value)
      } catch {
        // Ignore — file might already be gone. We still clear the field.
      }
    }
    onDelete?.()
    onChange('')
  }

  const showImage = value && !previewError

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {showImage ? (
        <div className="relative border border-ink-300 rounded-xs overflow-hidden bg-ivory-50">
          <img
            src={value}
            alt=""
            className="w-full h-32 object-cover"
            onError={() => setPreviewError(true)}
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-white/90 backdrop-blur-sm">
            <button
              type="button"
              onClick={handlePick}
              disabled={busy}
              className="flex-1 px-2 py-1 text-[11px] border border-ink-300 hover:bg-ink-100 disabled:opacity-50"
            >
              Thay ảnh
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="px-2 py-1 text-[11px] border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="w-full h-32 border border-dashed border-ink-300 rounded-xs flex flex-col items-center justify-center gap-1 text-xs text-ink-500 hover:border-ink-900 hover:text-ink-900 hover:bg-ink-50 transition-colors disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="font-mono">{progress}%</span>
              <span className="text-[10px] tracking-wider uppercase">Đang tải lên…</span>
            </>
          ) : (
            <>
              <span className="font-display text-lg">+</span>
              <span>Chọn ảnh (jpg/png/webp, ≤ 5MB)</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {busy && (
        <div className="h-0.5 bg-ink-100 mt-1 overflow-hidden rounded-full">
          <div
            className="h-full bg-sage-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function ProductFormModal({ open, product, onClose, onSaved }) {
  const [form, setForm] = useState(buildEmptyProduct())
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setErrors({})
      if (product) {
        setForm({
          ...product,
          variants: (product.variants || []).map((v) => ({ ...v })),
        })
      } else {
        setForm(buildEmptyProduct())
      }
    }
  }, [open, product])

  if (!open) return null

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateVariant = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.variants]
      next[idx] = { ...next[idx], [field]: value }
      return { ...prev, variants: next }
    })
  }

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))
  }

  const removeVariant = (idx) => {
    setForm((prev) => {
      const removed = prev.variants[idx]
      // Best-effort cleanup of any uploaded variant image.
      if (removed?.imageUrl && removed.imageUrl.startsWith('/uploads/')) {
        uploadApi.remove(removed.imageUrl).catch(() => {})
      }
      return {
        ...prev,
        variants: prev.variants.length > 1
          ? prev.variants.filter((_, i) => i !== idx)
          : prev.variants,
      }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Tên sản phẩm bắt buộc'
    if (!form.variants.length) e.variants = 'Cần ít nhất 1 biến thể'
    form.variants.forEach((v, i) => {
      if (!v.name.trim()) e[`variant_${i}_name`] = 'Tên biến thể bắt buộc'
      if (v.price == null || v.price < 0) e[`variant_${i}_price`] = 'Giá không hợp lệ'
      if (v.stock == null || v.stock < 0) e[`variant_${i}_stock`] = 'Tồn kho không hợp lệ'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) {
      push('Vui lòng kiểm tra các trường được đánh dấu', 'error')
      return
    }
    setBusy(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        category: form.category?.trim() || '',
        imageUrl: form.imageUrl?.trim() || '',
        variants: form.variants.map((v) => ({
          sku: (v.sku || '').trim(),
          name: v.name.trim(),
          color: (v.color || '').trim(),
          storage: (v.storage || '').trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          imageUrl: (v.imageUrl || '').trim(),
          isActive: !!v.isActive,
        })),
      }
      if (product?.id) {
        await productApi.update(product.id, payload)
        push('Đã cập nhật sản phẩm', 'success')
      } else {
        await productApi.create(payload)
        push('Đã tạo sản phẩm mới', 'success')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lưu thất bại'
      push(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 bg-ink-900/50 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-3xl my-8 animate-fade-up"
      >
        <div className="px-5 py-4 border-b border-ink-200 flex items-center">
          <h2 className="font-display text-xl text-ink-900">
            {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-ink-500 hover:text-ink-900 text-xl leading-none"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Tên sản phẩm <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-xs focus:outline-none focus:border-ink-900 ${
                    errors.name ? 'border-red-500' : 'border-ink-300'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={form.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="Hoa sinh nhật"
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900 resize-y"
                />
              </div>
            </div>

            <div>
              <ImageField
                label="Ảnh chính"
                value={form.imageUrl}
                onChange={(url) => updateField('imageUrl', url)}
              />
            </div>
          </div>

          <div className="border-t border-ink-200 pt-4">
            <div className="flex items-center mb-3">
              <h3 className="font-display text-lg text-ink-900">Biến thể</h3>
              <span className="ml-2 text-xs text-ink-500 font-mono">
                {form.variants.length} dòng
              </span>
              <button
                type="button"
                onClick={addVariant}
                className="ml-auto px-3 py-1.5 text-xs border border-sage-600 text-sage-600 hover:bg-sage-600 hover:text-white rounded-xs transition-colors"
              >
                + Thêm biến thể
              </button>
            </div>

            <div className="space-y-2">
              {form.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="border border-ink-200 rounded-xs p-3 bg-ivory-50"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-mono text-ink-500">#{idx + 1}</span>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="ml-auto text-xs text-red-600 hover:text-red-700"
                      >
                        Xóa biến thể
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 md:col-span-2">
                      <input
                        type="text"
                        placeholder="SKU *"
                        value={v.sku || ''}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs font-mono focus:outline-none focus:border-ink-900"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <input
                        type="text"
                        placeholder="Tên biến thể *"
                        value={v.name}
                        onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-xs focus:outline-none focus:border-ink-900 ${
                          errors[`variant_${idx}_name`] ? 'border-red-500' : 'border-ink-300'
                        }`}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="text"
                        placeholder="Màu"
                        value={v.color || ''}
                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        placeholder="Giá *"
                        min="0"
                        step="1000"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-xs font-mono text-right focus:outline-none focus:border-ink-900 ${
                          errors[`variant_${idx}_price`] ? 'border-red-500' : 'border-ink-300'
                        }`}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <input
                        type="number"
                        placeholder="Kho *"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-xs font-mono text-right focus:outline-none focus:border-ink-900 ${
                          errors[`variant_${idx}_stock`] ? 'border-red-500' : 'border-ink-300'
                        }`}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <ImageField
                        label="Ảnh biến thể"
                        value={v.imageUrl}
                        onChange={(url) => updateVariant(idx, 'imageUrl', url)}
                      />
                    </div>

                    <div className="col-span-12 flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!v.isActive}
                          onChange={(e) => updateVariant(idx, 'isActive', e.target.checked)}
                          className="cursor-pointer"
                        />
                        Đang bán
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-ink-200 flex justify-end gap-2 bg-ivory-50">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-100 rounded-xs transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors disabled:opacity-50"
          >
            {busy ? 'Đang lưu…' : product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  )
}