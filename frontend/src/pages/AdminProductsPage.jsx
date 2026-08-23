import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import ProductTable from '../components/admin/ProductTable'
import ProductFormModal from '../components/admin/ProductFormModal'
import ToastHost, { push } from '../components/admin/Toast'

export default function AdminProductsPage() {
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

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
      <ProductTable onEdit={openEdit} refreshSignal={refreshSignal} />
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