// Complete Order Management Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Eye, Truck, 
  CreditCard, CheckCircle2, AlertTriangle, ArrowRight, Check, RotateCcw, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newOrderForm, setNewOrderForm] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    productId: '',
    quantity: 1,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'UPI',
    assignedEmployee: '',
    assignedAffiliate: '',
    shippingAddress: ''
  });

  useEffect(() => {
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubProd = dbService.subscribe('products', setProducts);
    const unsubUsers = dbService.subscribe('users', (users) => {
      const activeEmployees = users.filter((u) => u.role !== 'affiliate');
      const activeAffiliates = users.filter((u) => u.role === 'affiliate');
      setEmployees(activeEmployees);
      setAffiliates(activeAffiliates);
      if (activeEmployees.length > 0) {
        setNewOrderForm((prev) => ({
          ...prev,
          assignedEmployee: prev.assignedEmployee || activeEmployees[0].id
        }));
      }
    });

    return () => {
      unsubOrders();
      unsubCust();
      unsubProd();
      unsubUsers();
    };
  }, []);

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerMobile && o.customerMobile.includes(q));

    const matchOrderStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
    const matchPaymentStatus = paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;

    return matchSearch && matchOrderStatus && matchPaymentStatus;
  });

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderForm.customerName || !newOrderForm.productId) return;

    const prod = products.find((p) => p.id === newOrderForm.productId);
    const prodPrice = prod ? prod.price : 2800;
    const subtotal = prodPrice * Number(newOrderForm.quantity);
    const grandTotal = subtotal;

    const newOrder = await dbService.add('orders', {
      orderId: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: newOrderForm.customerId || `cust_${Date.now()}`,
      customerName: newOrderForm.customerName,
      customerMobile: newOrderForm.customerMobile,
      products: [
        {
          productId: prod?.id,
          name: prod?.name || 'Ayurvedic Supplement Kit',
          quantity: Number(newOrderForm.quantity),
          price: prodPrice,
          total: subtotal
        }
      ],
      quantity: Number(newOrderForm.quantity),
      subtotal,
      discount: 0,
      tax: 0,
      shipping: 0,
      grandTotal,
      eligibleAmount: prod?.commissionEligible !== false ? grandTotal : 0,
      paymentStatus: newOrderForm.paymentStatus,
      orderStatus: newOrderForm.orderStatus,
      paymentMethod: newOrderForm.paymentMethod,
      assignedEmployee: newOrderForm.assignedEmployee || employees[0]?.id || '',
      assignedAffiliate: newOrderForm.assignedAffiliate || '',
      employeeName: employees.find((e) => e.id === newOrderForm.assignedEmployee)?.name || employees[0]?.name || '',
      affiliateName: affiliates.find((a) => a.id === newOrderForm.assignedAffiliate)?.name || '',
      commissionStatus: newOrderForm.orderStatus === 'Delivered' && newOrderForm.paymentStatus === 'Paid' ? 'Generated' : 'Pending',
      orderDate: new Date().toISOString(),
      deliveredDate: newOrderForm.orderStatus === 'Delivered' ? new Date().toISOString() : null,
      shippingAddress: newOrderForm.shippingAddress || 'Kolhapur, Maharashtra'
    });

    setShowAddModal(false);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const isDelivered = newStatus === 'Delivered';
    await dbService.update('orders', orderId, {
      orderStatus: newStatus,
      deliveredDate: isDelivered ? new Date().toISOString() : null
    });
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    await dbService.update('orders', orderId, {
      paymentStatus: newStatus
    });
  };

  const handleCustomerSelect = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setNewOrderForm({
        ...newOrderForm,
        customerId: cust.id,
        customerName: cust.fullName,
        customerMobile: cust.mobileNumber,
        shippingAddress: `${cust.address || ''}, ${cust.city || ''}, ${cust.state || ''}`,
        assignedEmployee: cust.assignedEmployee || newOrderForm.assignedEmployee,
        assignedAffiliate: cust.assignedAffiliate || ''
      });
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to permanently delete Order #${order.orderId || order.id} for "${order.customerName}"? This action cannot be undone.`)) {
      await dbService.delete('orders', order.id);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    }
  };

  const csvColumns = [
    { header: 'Order ID', key: 'orderId' },
    { header: 'Customer', key: 'customerName' },
    { header: 'Grand Total', key: 'grandTotal' },
    { header: 'Payment Status', key: 'paymentStatus' },
    { header: 'Order Status', key: 'orderStatus' },
    { header: 'Payment Method', key: 'paymentMethod' },
    { header: 'Order Date', key: 'orderDate' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <ShoppingBag size={24} style={{ color: '#1b4d3e' }} /> Order Management
          </h1>
          <div className="crm-page-subtitle">
            Synchronized orders from website and phone consultations ({orders.length} total orders)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredOrders} columns={csvColumns} filename="Sahara_Orders" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="ALL">All Order Statuses</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="crm-select"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products & Quantity</th>
                <th>Total Value</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerMobile}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      {order.products?.map((p, idx) => (
                        <div key={idx} style={{ fontSize: '0.82rem' }}>
                          • {p.name} × {p.quantity}
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong style={{ color: '#1b4d3e' }}>{formatCurrency(order.grandTotal)}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.paymentMethod}</div>
                    </td>
                    <td>
                      <select
                        className="crm-select"
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="crm-select"
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          className="crm-btn crm-btn-secondary crm-btn-sm"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Details & Invoice"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          className="crm-icon-btn"
                          style={{
                            width: '30px',
                            height: '30px',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            backgroundColor: '#fff'
                          }}
                          onClick={() => handleDeleteOrder(order)}
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <CrmModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Invoice & Summary: ${selectedOrder.orderId}`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Customer</span>
              <div style={{ fontWeight: 700 }}>{selectedOrder.customerName}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedOrder.shippingAddress}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Payment & Mode</span>
              <div style={{ fontWeight: 700 }}>
                {selectedOrder.paymentStatus} via {selectedOrder.paymentMethod}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1b4d3e', fontWeight: 600 }}>
                Grand Total: {formatCurrency(selectedOrder.grandTotal)}
              </div>
            </div>
          </div>

          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Items Ordered:</h4>
          <div className="crm-table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products?.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.quantity}</td>
                    <td><strong>{formatCurrency(p.total || p.price * p.quantity)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="crm-btn crm-btn-danger crm-btn-sm" 
              onClick={() => handleDeleteOrder(selectedOrder)}
              style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
              title="Delete Order"
            >
              <Trash2 size={14} /> Delete Order
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="crm-btn crm-btn-secondary" onClick={() => window.print()}>Print Invoice</button>
              <button className="crm-btn crm-btn-primary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </CrmModal>
      )}

      {/* Create Order Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Order"
        size="lg"
      >
        <form onSubmit={handleCreateOrder}>
          <div className="crm-form-group">
            <label className="crm-form-label">Select Customer</label>
            <select
              className="crm-form-select"
              value={newOrderForm.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">-- Choose Existing Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerId} - {c.mobileNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Customer Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={newOrderForm.customerName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                value={newOrderForm.customerMobile}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerMobile: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Select Product *</label>
              <select
                className="crm-form-select"
                required
                value={newOrderForm.productId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: e.target.value })}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="crm-input"
                value={newOrderForm.quantity}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Payment Method</label>
              <select
                className="crm-form-select"
                value={newOrderForm.paymentMethod}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Cash">Cash at Center</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Order Status</label>
              <select
                className="crm-form-select"
                value={newOrderForm.orderStatus}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, orderStatus: e.target.value })}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Executive / Counselor</label>
              <select
                className="crm-form-select"
                value={newOrderForm.assignedEmployee}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedEmployee: e.target.value })}
              >
                <option value="">-- Choose Member --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Affiliate Partner (Optional)</label>
              <select
                className="crm-form-select"
                value={newOrderForm.assignedAffiliate}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedAffiliate: e.target.value })}
              >
                <option value="">-- None --</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.referralCode || 'Affiliate'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Delivery Address</label>
            <input
              type="text"
              className="crm-input"
              value={newOrderForm.shippingAddress}
              onChange={(e) => setNewOrderForm({ ...newOrderForm, shippingAddress: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Create Order</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
