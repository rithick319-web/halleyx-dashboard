import React, { useState } from 'react';
import type { Order, OrderFormData } from '../types';
import { useOrders } from '../hooks/useOrders';
import { OrderForm } from './OrderForm';
import { ContextMenu, DeleteConfirm } from './ContextMenu';
import { STATUS_COLORS } from '../utils/constants';

const COLUMNS = [
  { key: 'orderId',      label: 'Order ID',     width: '110px' },
  { key: 'customerName', label: 'Customer',      width: '160px' },
  { key: 'product',      label: 'Product',       width: '200px' },
  { key: 'quantity',     label: 'Qty',           width: '60px'  },
  { key: 'unitPrice',    label: 'Unit Price',    width: '100px' },
  { key: 'totalAmount',  label: 'Total',         width: '110px' },
  { key: 'status',       label: 'Status',        width: '120px' },
  { key: 'createdBy',    label: 'Created By',    width: '170px' },
  { key: 'orderDate',    label: 'Date',          width: '100px' },
];

export const CustomerOrders: React.FC = () => {
  const { orders, loading, error, createOrder, updateOrder, deleteOrder } = useOrders();

  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; order: Order } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (data: OrderFormData) => {
    if (editOrder) {
      await updateOrder(editOrder.id, data);
      showToast('Order updated successfully');
    } else {
      await createOrder(data);
      showToast('Order created successfully');
    }
    setEditOrder(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteOrder(deleteTarget.id);
    showToast('Order deleted', 'error');
    setDeleteTarget(null);
  };

  const handleRowContext = (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, order });
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.createdBy.toLowerCase().includes(q)
    );
  });

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Customer Orders</h1>
          <p style={styles.pageSubtitle}>
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditOrder(null); setShowForm(true); }}
          style={styles.createBtn}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
          Create Order
        </button>
      </div>

      {/* Table Card */}
      <div style={styles.card}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search orders, customers, products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.toolbarRight}>
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          {loading ? (
            <div style={styles.emptyState}>
              <div style={styles.spinner} />
              <p style={{ color: '#9CA3AF', marginTop: '1rem' }}>Loading orders...</p>
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#EF4444', fontWeight: 500 }}>Failed to load orders</p>
              <p style={{ color: '#9CA3AF', fontSize: '13px' }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.4 }}>📋</div>
              <p style={{ fontWeight: 600, color: '#374151', fontSize: '16px' }}>
                {orders.length === 0 ? 'No orders yet' : 'No results found'}
              </p>
              <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '4px 0 1.5rem' }}>
                {orders.length === 0
                  ? 'Click "Create Order" to add your first order'
                  : 'Try adjusting your search'}
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => { setEditOrder(null); setShowForm(true); }}
                  style={{ ...styles.createBtn, padding: '0.5rem 1.25rem', fontSize: '13px' }}
                >
                  + Create Order
                </button>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th key={col.key} style={{ ...styles.th, width: col.width }}>{col.label}</th>
                  ))}
                  <th style={{ ...styles.th, width: '40px' }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const statusColors = STATUS_COLORS[order.status];
                  return (
                    <tr
                      key={order.id}
                      style={{ ...styles.tr, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                      onContextMenu={e => handleRowContext(e, order)}
                    >
                      <td style={styles.td}>
                        <span style={styles.orderIdBadge}>{order.orderId}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                          {order.firstName} {order.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{order.email}</div>
                      </td>
                      <td style={{ ...styles.td, fontSize: '13px', color: '#374151' }}>{order.product}</td>
                      <td style={{ ...styles.td, textAlign: 'center', fontWeight: 500 }}>{order.quantity}</td>
                      <td style={{ ...styles.td, color: '#374151' }}>{fmt(order.unitPrice)}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#111827' }}>{fmt(order.totalAmount)}</td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: 500,
                          background: statusColors.bg, color: statusColors.text,
                        }}>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: statusColors.dot, flexShrink: 0,
                          }} />
                          {order.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '13px', color: '#6B7280' }}>
                        {order.createdBy.replace(/^Mr\. |^Ms\. /, '')}
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#9CA3AF' }}>
                        {fmtDate(order.orderDate)}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={e => handleRowContext(e as unknown as React.MouseEvent, order)}
                          style={styles.moreBtn}
                          title="More options"
                        >⋯</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {(showForm || editOrder) && (
        <OrderForm
          order={editOrder}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditOrder(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          orderId={deleteTarget.orderId}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => { setEditOrder(contextMenu.order); setShowForm(true); }}
          onDelete={() => setDeleteTarget(contextMenu.order)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px',
          fontSize: '14px', fontWeight: 500, zIndex: 9998,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#F9FAFB' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { margin: 0, fontSize: '26px', fontWeight: 700, color: '#111827' },
  pageSubtitle: { margin: '4px 0 0', fontSize: '14px', color: '#9CA3AF' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', overflow: 'hidden' },
  toolbar: {
    padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
  },
  searchWrap: { position: 'relative', flex: 1, maxWidth: '420px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' },
  searchInput: {
    width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem',
    border: '1.5px solid #E5E7EB', borderRadius: '8px',
    fontSize: '14px', color: '#111827', background: '#FAFAFA',
    outline: 'none', boxSizing: 'border-box',
  },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  tableWrap: { overflowX: 'auto' },
  emptyState: {
    padding: '4rem 2rem', textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
  spinner: {
    width: '36px', height: '36px', border: '3px solid #E5E7EB',
    borderTop: '3px solid #10B981', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: {
    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '11px',
    fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase',
    letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6',
    background: '#FAFAFA', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #F9FAFB', transition: 'background 0.1s' },
  td: { padding: '0.85rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' },
  orderIdBadge: {
    padding: '3px 8px', background: '#EEF2FF', color: '#4338CA',
    borderRadius: '6px', fontSize: '12px', fontWeight: 600,
  },
  moreBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '20px', color: '#9CA3AF', padding: '2px 6px',
    borderRadius: '4px', lineHeight: 1,
  },
};
