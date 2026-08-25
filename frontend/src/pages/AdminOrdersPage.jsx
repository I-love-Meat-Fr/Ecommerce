import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import OrderTable from '../components/admin/OrderTable'
import OrderDetailDrawer from '../components/admin/OrderDetailDrawer'
import ToastHost from '../components/admin/Toast'

export default function AdminOrdersPage() {
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const onViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const onCloseDrawer = () => {
    setSelectedOrder(null)
  }

  const onUpdated = () => {
    setRefreshSignal((n) => n + 1)
    setSelectedOrder(null)
  }

  return (
    <AdminLayout>
      <OrderTable
        refreshSignal={refreshSignal}
        onViewOrder={onViewOrder}
      />

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={onCloseDrawer}
          onUpdated={onUpdated}
        />
      )}
      <ToastHost />
    </AdminLayout>
  )
}
