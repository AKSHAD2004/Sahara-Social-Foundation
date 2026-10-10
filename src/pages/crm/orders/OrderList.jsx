// Complete Order Management Module for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Eye, Truck, 
  CreditCard, CheckCircle2, AlertTriangle, ArrowRight, Check, RotateCcw, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService, getDeletedSet } from '../../../services/db';
import { isFirebaseConfigured, db as firestoreDb, collection, onSnapshot } from '../../../services/firebase';
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
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
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

  const handleRefreshFirebase = async () => {
    setIsSyncing(true);
    setSyncNotice('');
    try {
      const refreshed = await dbService.refreshFromFirebase('orders');
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        setOrders(refreshed);
        setSyncNotice(`✓ Synced ${refreshed.length} orders live from Cloud Firestore!`);
      } else {
        setSyncNotice(`✓ Firebase connected. Orders are up to date.`);
      }
      setTimeout(() => setSyncNotice(''), 4500);
    } catch (e) {
      setSyncNotice('Sync note: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial fetch from Cloud Firestore with auto-upload of any pending local orders
    dbService.refreshFromFirebase('orders').then((refreshed) => {
      if (Array.isArray(refreshed)) {
        const deletedIds = getDeletedSet('orders');
        setOrders(refreshed.filter((o) => !deletedIds.has(String(o.id || '')) && !deletedIds.has(String(o.orderId || ''))));
      }
    }).catch(() => {});

    // Direct Real-time Cloud Firestore subscription for instantaneous cross-device sync
    let unsubFirestoreOrders = () => {};
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const colRef = collection(firestoreDb, 'orders');
        unsubFirestoreOrders = onSnapshot(colRef, (snapshot) => {
          const deletedIds = getDeletedSet('orders');
          const liveOrders = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((o) => !deletedIds.has(String(o.id || '')) && !deletedIds.has(String(o.orderId || '')));

          liveOrders.sort((a, b) => {
            const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
            const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
            return dateB - dateA;
          });
          setOrders(liveOrders);
        }, (err) => {
          console.warn('Direct Firestore orders listener note:', err.message);
        });
      } catch (err) {
        console.warn('Direct Firestore listener setup note:', err.message);
      }
    }

    // Active subscription to reactive store as fallback & local store sync
    const unsubOrders = dbService.subscribe('orders', (currentOrders) => {
      const deletedIds = getDeletedSet('orders');
      if (Array.isArray(currentOrders)) {
        setOrders(currentOrders.filter((o) => !deletedIds.has(String(o.id || '')) && !deletedIds.has(String(o.orderId || ''))));
      }
    });

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

    // Mobile background sync heartbeat (polls every 15s) and visibility handler for mobile browsers
    const heartbeatTimer = setInterval(() => {
      dbService.refreshFromFirebase('orders').then((refreshed) => {
        if (Array.isArray(refreshed) && refreshed.length > 0) {
          setOrders(refreshed);
        }
      }).catch(() => {});
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        dbService.refreshFromFirebase('orders').then((refreshed) => {
          if (Array.isArray(refreshed) && refreshed.length > 0) {
            setOrders(refreshed);
          }
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      unsubFirestoreOrders();
      unsubOrders();
      unsubCust();
      unsubProd();
      unsubUsers();
      clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const isWebsiteOrder = (o) => {
    const src = String(o.source || '').toLowerCase();
    const idStr = String(o.id || o.orderId || '');
    return src.includes('website') || idStr.startsWith('ORD-') || idStr.startsWith('SSF-');
  };

  const filteredOrders = orders
    .filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerMobile && String(o.customerMobile).includes(q)) ||
        (o.customerPhone && String(o.customerPhone).includes(q)) ||
        (o.phone && String(o.phone).includes(q));

      const matchOrderStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
      const matchPaymentStatus = paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;
      const isWeb = isWebsiteOrder(o);
      const matchSource = sourceFilter === 'ALL' || (sourceFilter === 'WEBSITE' ? isWeb : !isWeb);

      return matchSearch && matchOrderStatus && matchPaymentStatus && matchSource;
    })
    .sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
      const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
      return dateB - dateA;
    });

  const websiteOrdersCount = orders.filter((o) => isWebsiteOrder(o)).length;
  const totalRevenue = orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const pendingDeliveryCount = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderForm.customerName || !newOrderForm.productId) return;

    const prod = products.find((p) => p.id === newOrderForm.productId);
    const prodPrice = prod ? prod.price : 2800;
    const subtotal = prodPrice * Number(newOrderForm.quantity);
    const grandTotal = subtotal;
    const genOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await dbService.add('orders', {
      id: genOrderId,
      orderId: genOrderId,
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
    const orderTitle = order.orderId || order.id;
    if (window.confirm(`Are you sure you want to permanently delete Order #${orderTitle} for "${order.customerName}"? This action cannot be undone.`)) {
      const targetId = order.id || order.orderId;
      const targetOrderId = order.orderId || order.id;

      // Instantly remove from local component view so UI updates immediately
      setOrders((prev) => prev.filter((o) => 
        String(o.id) !== String(targetId) && 
        String(o.orderId) !== String(targetOrderId) &&
        String(o.id) !== String(targetOrderId) &&
        String(o.orderId) !== String(targetId)
      ));

      if (selectedOrder?.id === order.id || selectedOrder?.orderId === order.orderId) {
        setSelectedOrder(null);
      }

      await dbService.delete('orders', targetId);
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
            Synchronized orders from website and phone consultations ({orders.length} total orders, {websiteOrdersCount} from website)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            className="crm-btn crm-btn-secondary"
            onClick={handleRefreshFirebase}
            disabled={isSyncing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            title="Fetch latest orders live from Cloud Firestore"
          >
            <RotateCcw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Firebase'}</span>
          </button>
          <ExportButton data={filteredOrders} columns={csvColumns} filename="Sahara_Orders" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      {syncNotice && (
        <div style={{
          backgroundColor: '#e2faea',
          border: '1.5px solid #159B32',
          color: '#006B2D',
          padding: '0.65rem 1.15rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,107,45,0.08)'
        }}>
          <CheckCircle2 size={18} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Top Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div className="crm-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #1b4d3e' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>{orders.length}</div>
        </div>
        <div className="crm-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #006B2D' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>🌐 Website Online Orders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#006B2D', marginTop: '0.2rem' }}>{websiteOrdersCount}</div>
        </div>
        <div className="crm-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Paid Order Volume</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="crm-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active / Pending Delivery</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#854d0e', marginTop: '0.2rem' }}>{pendingDeliveryCount}</div>
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
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Order Channels</option>
              <option value="WEBSITE">🌐 Website Online Orders</option>
              <option value="OFFLINE">📞 Direct / Phone Orders</option>
            </select>

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
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.orderId}</div>
                      {isWebsiteOrder(order) && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.68rem', 
                          backgroundColor: '#e2faea', 
                          color: '#006B2D', 
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px', 
                          fontWeight: 700, 
                          marginTop: '0.25rem' 
                        }}>
                          🌐 Website Order
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerMobile || order.customerPhone || order.phone}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      {(order.products || order.items || []).map((p, idx) => (
                        <div key={idx} style={{ fontSize: '0.82rem' }}>
                          • {p.name || p.nameMr || p.nameEn || p.title || 'Nutraceutical Product'} × {p.quantity || 1}
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
                {(selectedOrder.products || selectedOrder.items || []).map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name || p.nameMr || p.nameEn || p.title || 'Nutraceutical Product'}</td>
                    <td>{formatCurrency(p.price || 0)}</td>
                    <td>{p.quantity || 1}</td>
                    <td><strong>{formatCurrency(p.total || ((p.price || 0) * (p.quantity || 1)))}</strong></td>
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
