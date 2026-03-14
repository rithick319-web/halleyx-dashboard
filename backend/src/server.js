const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (replace with DB later)
let orders = [];
let orderCounter = 1000;

// GET all orders
app.get('/api/orders', (req, res) => {
  const { dateRange } = req.query;
  let filtered = [...orders];

  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (dateRange === '90d') cutoff.setDate(now.getDate() - 90);
    filtered = filtered.filter(o => new Date(o.orderDate) >= cutoff);
  }

  res.json({ success: true, data: filtered, total: filtered.length });
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// POST create order
app.post('/api/orders', (req, res) => {
  const data = req.body;
  const newOrder = {
    id: uuidv4(),
    orderId: `ORD-${++orderCounter}`,
    orderDate: new Date().toISOString(),
    // Customer Info
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    streetAddress: data.streetAddress,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    // Order Info
    product: data.product,
    quantity: Number(data.quantity),
    unitPrice: Number(data.unitPrice),
    totalAmount: Number(data.quantity) * Number(data.unitPrice),
    status: data.status || 'Pending',
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// PUT update order
app.put('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  const data = req.body;
  orders[idx] = {
    ...orders[idx],
    ...data,
    totalAmount: Number(data.quantity) * Number(data.unitPrice),
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: orders[idx] });
});

// DELETE order
app.delete('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  orders.splice(idx, 1);
  res.json({ success: true, message: 'Order deleted successfully' });
});

// GET aggregated stats for dashboard
app.get('/api/orders/stats/summary', (req, res) => {
  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
    avgOrderValue: orders.length ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0,
    totalQuantity: orders.reduce((s, o) => s + o.quantity, 0),
    byStatus: orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}),
    byProduct: orders.reduce((acc, o) => { acc[o.product] = (acc[o.product] || 0) + o.totalAmount; return acc; }, {}),
    byCreatedBy: orders.reduce((acc, o) => { acc[o.createdBy] = (acc[o.createdBy] || 0) + 1; return acc; }, {}),
  };
  res.json({ success: true, data: summary });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Halleyx API running on port ${PORT}`));
