import { useEffect, useState, useRef } from 'react'
import { productApi, categoryApi } from '../../services/api'
import { push } from './Toast'
import { Sparkles, Ruler, Droplets, Sun, Leaf } from 'lucide-react'

const emptyVariant = () => ({
  sku: '',
  name: '',
  color: '',
  storage: '',
  price: 0,
  originalPrice: '',
  imageUrl: '',
  isActive: true,
  plantAttributes: {
    careLevel: null,
    size: null,
    humidity: null,
    suitability: null,
  },
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

// (Per-variant plant attributes UI in the admin modal uses numeric
// 1–5 buttons rather than human labels — the labels live on the
// storefront render instead.)

// One image field: handles file picker → upload → preview → replace → delete.
function ImageField({ label, value, onChange, onDelete, required = false }) {
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { setPreviewError(false) }, [value])

  const handlePick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!file.type.startsWith('image/')) { push('Vui lòng chọn file ảnh', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { push('Ảnh tối đa 5 MB', 'error'); return }

    const previousUrl = value
    setBusy(true)
    setProgress(0)
    try {
      const { url } = await (await import('../../services/api')).uploadApi.upload(file, (pct) => setProgress(pct))
      onChange(url)
      if (previousUrl && previousUrl.startsWith('/uploads/')) {
        ;(await import('../../services/api')).uploadApi.remove(previousUrl).catch(() => {})
      }
    } catch (err) {
      push(err?.response?.data?.message || 'Upload thất bại', 'error')
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!value) return
    if (value.startsWith('/uploads/')) {
      try { await (await import('../../services/api')).uploadApi.remove(value) } catch {}
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
          <img src={value} alt="" className="w-full h-32 object-cover" onError={() => setPreviewError(true)} />
          <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-white/90 backdrop-blur-sm">
            <button type="button" onClick={handlePick} disabled={busy}
              className="flex-1 px-2 py-1 text-[11px] border border-ink-300 hover:bg-ink-100 disabled:opacity-50">
              Thay ảnh
            </button>
            <button type="button" onClick={handleDelete} disabled={busy}
              className="px-2 py-1 text-[11px] border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50">
              Xóa
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={handlePick} disabled={busy}
          className="w-full h-32 border border-dashed border-ink-300 rounded-xs flex flex-col items-center justify-center gap-1 text-xs text-ink-500 hover:border-ink-900 hover:text-ink-900 hover:bg-ink-50 transition-colors disabled:opacity-50">
          {busy ? (
            <><span className="font-mono">{progress}%</span><span className="text-[10px]">Đang tải lên…</span></>
          ) : (
            <><span className="font-display text-lg">+</span><span>Chọn ảnh (jpg/png/webp, ≤ 5MB)</span></>
          )}
        </button>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange} className="hidden" />

      {busy && (
        <div className="h-0.5 bg-ink-100 mt-1 overflow-hidden rounded-full">
          <div className="h-full bg-sage-600 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

// Inline category form — used both in the dropdown and in standalone mode
function CategoryForm({ editing, onSave, onCancel, saving }) {
  const [name, setName] = useState(editing?.name || '')
  const [desc, setDesc] = useState(editing?.description || '')

  return (
    <div className="border border-ink-300 rounded-xs bg-ivory-50 p-3 space-y-2">
      <input
        type="text" value={name} autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên danh mục *"
        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900"
      />
      <input
        type="text" value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Mô tả (tùy chọn)"
        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900"
      />
      <div className="flex gap-2">
        <button
          type="button" disabled={saving}
          onClick={() => onSave({ name: name.trim(), description: desc.trim(), id: editing?.id })}
          className="flex-1 py-1 text-[11px] bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50 rounded-xs transition-colors"
        >
          {saving ? '…' : editing ? 'Cập nhật' : 'Tạo'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1 text-[11px] border border-ink-300 hover:bg-ink-100 rounded-xs transition-colors">
          Hủy
        </button>
      </div>
    </div>
  )
}

export default function ProductFormModal({ open, product, onClose, onSaved }) {
  const [form, setForm] = useState(buildEmptyProduct())
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  // --- Category state ---
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(false)
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [catFormMode, setCatFormMode] = useState(null) // null | 'create' | Category object
  const [savingCat, setSavingCat] = useState(false)
  const [deletingCatId, setDeletingCatId] = useState(null)
  const catInputRef = useRef(null)
  const catDropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setShowCatDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const fetchCategories = () => {
    setCatLoading(true)
    categoryApi.getAll()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCatLoading(false))
  }

  useEffect(() => {
    if (open) {
      setErrors({})
      fetchCategories()
      if (product) {
        setForm({
          ...product,
          variants: (product.variants || []).map((v) => ({
            ...v,
            plantAttributes: {
              careLevel:    v.plantAttributes?.careLevel    ?? null,
              size:         v.plantAttributes?.size         ?? null,
              humidity:     v.plantAttributes?.humidity     ?? null,
              suitability:  v.plantAttributes?.suitability  ?? null,
            },
          })),
        })
      } else {
        setForm(buildEmptyProduct())
      }
    }
  }, [open, product])

  if (!open) return null

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateVariant = (idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.variants]
      next[idx] = { ...next[idx], [field]: value }
      return { ...prev, variants: next }
    })
  }

  const addVariant = () => setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))

  const removeVariant = (idx) => {
    setForm((prev) => {
      const removed = prev.variants[idx]
      if (removed?.imageUrl && removed.imageUrl.startsWith('/uploads/')) {
        import('../../services/api').then(m => m.uploadApi.remove(removed.imageUrl).catch(() => {}))
      }
      return {
        ...prev,
        variants: prev.variants.length > 1 ? prev.variants.filter((_, i) => i !== idx) : prev.variants,
      }
    })
  }

  // --- Category CRUD ---
  const handleSaveCatForm = async ({ name, description, id }) => {
    if (!name?.trim()) { push('Tên danh mục bắt buộc', 'error'); return }
    setSavingCat(true)
    try {
      if (id) {
        await categoryApi.update(id, { name: name.trim(), description: description?.trim() || '' })
        push('Đã cập nhật danh mục', 'success')
      } else {
        await categoryApi.create({ name: name.trim(), description: description?.trim() || '' })
        push('Đã tạo danh mục mới', 'success')
      }
      setCatFormMode(null)
      fetchCategories()
    } catch (err) {
      push(err?.response?.data?.message || 'Lưu thất bại', 'error')
    } finally {
      setSavingCat(false)
    }
  }

  const handleDeleteCat = async (id) => {
    setDeletingCatId(id)
    try {
      await categoryApi.remove(id)
      push('Đã xóa danh mục', 'success')
      // If the deleted category was selected, clear the product form
      if (form.category) {
        const cat = categories.find(c => c.id === id)
        if (cat && form.category === cat.name) {
          updateField('category', '')
        }
      }
      fetchCategories()
    } catch (err) {
      push(err?.response?.data?.message || 'Xóa thất bại', 'error')
    } finally {
      setDeletingCatId(null)
    }
  }

  const selectCategory = (name) => {
    updateField('category', name)
    setShowCatDropdown(false)
  }

  // --- Product submit ---
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Tên sản phẩm bắt buộc'
    if (!form.variants.length) e.variants = 'Cần ít nhất 1 biến thể'
    form.variants.forEach((v, i) => {
      if (!v.name.trim()) e[`variant_${i}_name`] = 'Tên biến thể bắt buộc'
      if (v.price == null || v.price < 0) e[`variant_${i}_price`] = 'Giá không hợp lệ'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) { push('Vui lòng kiểm tra các trường được đánh dấu', 'error'); return }
    setBusy(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        category: form.category?.trim() || '',
        imageUrl: form.imageUrl?.trim() || '',
        variants: form.variants.map((v) => {
          const orig = v.originalPrice === '' || v.originalPrice == null
            ? null
            : Number(v.originalPrice)
          return {
            sku: (v.sku || '').trim(),
            name: v.name.trim(),
            color: (v.color || '').trim(),
            storage: (v.storage || '').trim(),
            price: Number(v.price) || 0,
            // Send null (not 0) when blank so the backend leaves the field
            // untouched instead of clobbering a real compare-at price with 0.
            originalPrice: Number.isFinite(orig) ? orig : null,
            imageUrl: (v.imageUrl || '').trim(),
            isActive: !!v.isActive,
            plantAttributes: {
              careLevel:    v.plantAttributes?.careLevel    ?? null,
              size:         v.plantAttributes?.size         ?? null,
              humidity:     v.plantAttributes?.humidity     ?? null,
              suitability:  v.plantAttributes?.suitability  ?? null,
            },
          }
        }),
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
      push(err?.response?.data?.message || 'Lưu thất bại', 'error')
    } finally {
      setBusy(false)
    }
  }

  // Filter categories as user types in the text input
  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes((form.category || '').toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 bg-ink-900/50 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-3xl my-8 animate-fade-up"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-ink-200 flex items-center">
          <h2 className="font-display text-xl text-ink-900">
            {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button type="button" onClick={onClose}
            className="ml-auto text-ink-500 hover:text-ink-900 text-xl leading-none" aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Row: name + category + main image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Tên sản phẩm <span className="text-red-600">*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-xs focus:outline-none focus:border-ink-900 ${
                    errors.name ? 'border-red-500' : 'border-ink-300'}`} />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Danh mục — custom dropdown + inline CRUD */}
              <div ref={catDropdownRef} className="relative">
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Danh mục
                </label>

                {/* Input-like trigger */}
                <div
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white flex items-center justify-between cursor-pointer"
                  onClick={() => { setShowCatDropdown(v => !v); setCatFormMode(null) }}
                >
                  <span className={form.category ? 'text-ink-900' : 'text-ink-400'}>
                    {form.category || '— Chọn hoặc tạo danh mục —'}
                  </span>
                  <span className="text-ink-400 text-xs">▾</span>
                </div>

                {/* Dropdown panel */}
                {showCatDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-ink-300 rounded-xs shadow-elevated max-h-64 overflow-y-auto">

                    {/* Create new category */}
                    {catFormMode === 'create' ? (
                      <div className="p-3 border-b border-ink-200">
                        <CategoryForm
                          editing={null}
                          onSave={handleSaveCatForm}
                          onCancel={() => setCatFormMode(null)}
                          saving={savingCat}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setCatFormMode('create'); setShowCatDropdown(true) }}
                        className="w-full px-3 py-2 text-xs text-sage-600 hover:bg-sage-50 flex items-center gap-2 border-b border-ink-100"
                      >
                        <span className="text-base leading-none">+</span>
                        Thêm danh mục mới
                      </button>
                    )}

                    {/* Category list */}
                    {catLoading ? (
                      <div className="p-3 text-xs text-ink-400">Đang tải…</div>
                    ) : filteredCats.length === 0 && !catFormMode ? (
                      <div className="p-3 text-xs text-ink-400">Không có danh mục phù hợp</div>
                    ) : (
                      filteredCats.map((cat) => (
                        <div key={cat.id} className="flex items-center border-b border-ink-50 last:border-0">
                          {catFormMode?.id === cat.id ? (
                            <div className="flex-1 p-2">
                              <CategoryForm
                                editing={cat}
                                onSave={handleSaveCatForm}
                                onCancel={() => setCatFormMode(null)}
                                saving={savingCat}
                              />
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => selectCategory(cat.name)}
                                className={`flex-1 px-3 py-2 text-sm text-left hover:bg-ivory-50 ${
                                  form.category === cat.name ? 'font-semibold text-ink-900 bg-ivory-50' : 'text-ink-700'
                                }`}
                              >
                                {cat.name}
                              </button>
                              <button
                                type="button"
                                onClick={() => setCatFormMode(cat)}
                                className="px-2 py-2 text-[10px] text-ink-400 hover:text-ink-900 border-l border-ink-100"
                                title="Sửa"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCat(cat.id)}
                                disabled={deletingCatId === cat.id}
                                className="px-2 py-2 text-[10px] text-red-400 hover:text-red-600 border-l border-ink-100 disabled:opacity-40"
                                title="Xóa"
                              >
                                {deletingCatId === cat.id ? '…' : '×'}
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Mô tả
                </label>
                <textarea value={form.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900 resize-y" />
              </div>
            </div>

            {/* Ảnh chính */}
            <div>
              <ImageField
                label="Ảnh chính"
                value={form.imageUrl}
                onChange={(url) => updateField('imageUrl', url)}
              />
            </div>
          </div>

          {/* Biến thể */}
          <div className="border-t border-ink-200 pt-4">
            <div className="flex items-center mb-3">
              <h3 className="font-display text-lg text-ink-900">Biến thể</h3>
              <span className="ml-2 text-xs text-ink-500 font-mono">{form.variants.length} dòng</span>
              <button type="button" onClick={addVariant}
                className="ml-auto px-3 py-1.5 text-xs border border-sage-600 text-sage-600 hover:bg-sage-600 hover:text-white rounded-xs transition-colors">
                + Thêm biến thể
              </button>
            </div>

            <div className="space-y-2">
              {form.variants.map((v, idx) => (
                <div key={idx} className="border border-ink-200 rounded-xs p-3 bg-ivory-50">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-mono text-ink-500">#{idx + 1}</span>
                    {form.variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)}
                        className="ml-auto text-xs text-red-600 hover:text-red-700">
                        Xóa biến thể
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 md:col-span-2">
                      <input type="text" placeholder="SKU *" value={v.sku || ''}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs font-mono focus:outline-none focus:border-ink-900" />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <input type="text" placeholder="Tên biến thể *"
                        value={v.name}
                        onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-xs focus:outline-none focus:border-ink-900 ${
                          errors[`variant_${idx}_name`] ? 'border-red-500' : 'border-ink-300'}`} />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input type="text" placeholder="Màu" value={v.color || ''}
                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900" />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input type="number" placeholder="Giá *" min="0" step="1000"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-xs font-mono text-right focus:outline-none focus:border-ink-900 ${
                          errors[`variant_${idx}_price`] ? 'border-red-500' : 'border-ink-300'}`} />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <ImageField label="Ảnh biến thể" value={v.imageUrl}
                        onChange={(url) => updateVariant(idx, 'imageUrl', url)} />
                    </div>

                    {/* Second row: storage + originalPrice + active toggle */}
                    <div className="col-span-12 md:col-span-2">
                      <input type="text" placeholder="Dung lượng" value={v.storage || ''}
                        onChange={(e) => updateVariant(idx, 'storage', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900" />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <input type="number" placeholder="Giá gốc (so sánh)" min="0" step="1000"
                        value={v.originalPrice ?? ''}
                        onChange={(e) => updateVariant(idx, 'originalPrice', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-ink-300 rounded-xs font-mono text-right focus:outline-none focus:border-ink-900" />
                    </div>
                    <div className="col-span-12 md:col-span-8 flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer">
                        <input type="checkbox" checked={!!v.isActive}
                          onChange={(e) => updateVariant(idx, 'isActive', e.target.checked)}
                          className="cursor-pointer" />
                        Đang bán
                      </label>
                      <span className="text-[10px] text-ink-400">
                        (Để trống "Giá gốc" nếu không muốn hiển thị % giảm.)
                      </span>
                    </div>
                  </div>

                  {/* Per-variant plant attributes — 4 compact 1–5 sliders */}
                  <div className="mt-3 pt-3 border-t border-ink-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Leaf className="w-3 h-3 text-brand-600" strokeWidth={1.5} />
                      <span className="text-[10px] tracking-widest uppercase text-ink-600 font-semibold">
                        Thông số cây trồng của biến thể này
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {/* Care Level */}
                      <div className="bg-white border border-ink-200 rounded-xs p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-brand-600" strokeWidth={1.5} />
                          <span className="text-[10px] uppercase tracking-wider text-ink-600 font-semibold">Dễ chăm sóc</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n} type="button"
                              onClick={() => updateVariant(idx, 'plantAttributes', {
                                ...(v.plantAttributes || {}),
                                careLevel: v.plantAttributes?.careLevel === n ? null : n,
                              })}
                              className={`flex-1 h-6 rounded-xs border text-[10px] font-semibold transition-colors ${
                                v.plantAttributes?.careLevel === n
                                  ? 'bg-brand-500 border-brand-500 text-white'
                                  : 'bg-white border-ink-300 text-ink-700 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Size */}
                      <div className="bg-white border border-ink-200 rounded-xs p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Ruler className="w-3 h-3 text-brand-600" strokeWidth={1.5} />
                          <span className="text-[10px] uppercase tracking-wider text-ink-600 font-semibold">Kích thước</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n} type="button"
                              onClick={() => updateVariant(idx, 'plantAttributes', {
                                ...(v.plantAttributes || {}),
                                size: v.plantAttributes?.size === n ? null : n,
                              })}
                              className={`flex-1 h-6 rounded-xs border text-[10px] font-semibold transition-colors ${
                                v.plantAttributes?.size === n
                                  ? 'bg-brand-500 border-brand-500 text-white'
                                  : 'bg-white border-ink-300 text-ink-700 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Humidity */}
                      <div className="bg-white border border-ink-200 rounded-xs p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Droplets className="w-3 h-3 text-brand-600" strokeWidth={1.5} />
                          <span className="text-[10px] uppercase tracking-wider text-ink-600 font-semibold">Độ ẩm</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n} type="button"
                              onClick={() => updateVariant(idx, 'plantAttributes', {
                                ...(v.plantAttributes || {}),
                                humidity: v.plantAttributes?.humidity === n ? null : n,
                              })}
                              className={`flex-1 h-6 rounded-xs border text-[10px] font-semibold transition-colors ${
                                v.plantAttributes?.humidity === n
                                  ? 'bg-brand-500 border-brand-500 text-white'
                                  : 'bg-white border-ink-300 text-ink-700 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Suitability */}
                      <div className="bg-white border border-ink-200 rounded-xs p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Sun className="w-3 h-3 text-brand-600" strokeWidth={1.5} />
                          <span className="text-[10px] uppercase tracking-wider text-ink-600 font-semibold">Phù hợp</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n} type="button"
                              onClick={() => updateVariant(idx, 'plantAttributes', {
                                ...(v.plantAttributes || {}),
                                suitability: v.plantAttributes?.suitability === n ? null : n,
                              })}
                              className={`flex-1 h-6 rounded-xs border text-[10px] font-semibold transition-colors ${
                                v.plantAttributes?.suitability === n
                                  ? 'bg-brand-500 border-brand-500 text-white'
                                  : 'bg-white border-ink-300 text-ink-700 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-ink-200 flex justify-end gap-2 bg-ivory-50">
          <button type="button" onClick={onClose} disabled={busy}
            className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-100 rounded-xs transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button type="submit" disabled={busy}
            className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors disabled:opacity-50">
            {busy ? 'Đang lưu…' : product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  )
}
