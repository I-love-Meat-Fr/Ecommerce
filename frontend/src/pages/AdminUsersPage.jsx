import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import UserTable from '../components/admin/UserTable'
import UserFormModal from '../components/admin/UserFormModal'
import ToastHost from '../components/admin/Toast'
import { useAuthStore } from '../store/authStore'

export default function AdminUsersPage() {
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const { user: currentUser } = useAuthStore()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user) => {
    if (user === null) return openCreate()
    setEditing(user)
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
      <UserTable onEdit={openEdit} refreshSignal={refreshSignal} />
      <UserFormModal
        open={formOpen}
        user={editing}
        currentAdminId={currentUser?.id}
        onClose={closeForm}
        onSaved={onSaved}
      />
      <ToastHost />
    </AdminLayout>
  )
}