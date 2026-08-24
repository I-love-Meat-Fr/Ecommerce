import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import ProductTable from '../components/admin/ProductTable'
import ProductFormModal from '../components/admin/ProductFormModal'
import CategoryManager from '../components/admin/CategoryManager'
import ToastHost from '../components/admin/Toast'

export default function AdminProductsPage() {
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [activeTab, setActiveTab] = useState('products')

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    if (product === null) return openCreate()
    setEditing(product)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const onSaved = () => {
    setRefreshSignal((n) => n + 1)
  }

  return (
    <AdminLayout>
      {/* Tab navigation */}
      <div className="flex items-center border-b border-ink-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Danh mục
        </button>
      </div>

      {activeTab === 'products' ? (
        <ProductTable onEdit={openEdit} refreshSignal={refreshSignal} onCreate={openCreate} />
      ) : (
        <CategoryManager />
      )}

      <ProductFormModal
        open={formOpen}
        product={editing}
        onClose={closeForm}
        onSaved={onSaved}
      />
      <ToastHost />
    </AdminLayout>
  )
}
