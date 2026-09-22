// Product Catalog & Inventory Management for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit, Trash2, CheckCircle2, 
  XCircle, Percent, AlertCircle, RotateCcw, Sparkles, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import { initialProducts } from '../../../services/seedData';
import CrmModal from '../../../components/crm/CrmModal';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Diabetes',
    mrp: 3000,
    price: 2400,
    sellingPrice: 2400,
    stock: 50,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    const unsub = dbService.subscribe('products', (prods) => {
      if (!prods || prods.length === 0) {
        // Automatically populate with initial official products if empty
        dbService.setCollection('products', initialProducts);
        setProducts(initialProducts);
      } else {
        setProducts(prods);
      }
    });
    return unsub;
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));

    const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleRestoreCatalog = async () => {
    if (window.confirm('Restore all standard Sahara Social Foundation Ayurvedic products to the catalog?')) {
      setIsRestoring(true);
      try {
        await dbService.setCollection('products', initialProducts);
        alert('Official product catalog successfully loaded and synced!');
      } catch (err) {
        console.error('Error restoring catalog:', err);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SK-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Diabetes',
      mrp: 3000,
      price: 2400,
      sellingPrice: 2400,
      stock: 50,
      commissionEligible: true,
      commissionType: 'standard',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      description: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      await dbService.update('products', editingProduct.id, {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.price),
        stock: Number(formData.stock)
      });
    } else {
      await dbService.add('products', {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.price),
        stock: Number(formData.stock)
      });
    }

    setShowModal(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      await dbService.delete('products', id);
    }
  };

  const handleToggleCommission = async (prod) => {
    await dbService.update('products', prod.id, {
      commissionEligible: !prod.commissionEligible
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Package size={24} style={{ color: '#1b4d3e' }} /> Product Management & Inventory
          </h1>
          <div className="crm-page-subtitle">
            Ayurvedic health formulations, pricing, stock levels, and commission eligibility ({products.length} products)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            className="crm-btn crm-btn-secondary" 
            onClick={handleRestoreCatalog}
            disabled={isRestoring}
            title="Reload standard Sahara Social Foundation product catalog"
          >
            <RotateCcw size={15} className={isRestoring ? 'spin' : ''} /> 
            {isRestoring ? 'Restoring...' : 'Restore Official Products'}
          </button>
          <button className="crm-btn crm-btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search products by name, SKU, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU & Category</th>
                <th>MRP / Price</th>
                <th>Stock</th>
                <th>Commission Eligible</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                          alt={prod.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                          }}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        />
                        <div>
                          <strong style={{ color: '#1e293b' }}>{prod.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{prod.sku}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{prod.category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1b4d3e' }}>{formatCurrency(prod.price)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        MRP {formatCurrency(prod.mrp)}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: prod.stock <= 0 ? '#ef4444' : prod.stock < 20 ? '#f59e0b' : '#10b981' }}>
                        {prod.stock} units
                      </strong>
                    </td>
                    <td>
                      <button
                        className={`crm-btn crm-btn-sm ${prod.commissionEligible !== false ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleToggleCommission(prod)}
                      >
                        {prod.commissionEligible !== false ? '✓ Eligible' : '✕ Ineligible'}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${prod.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {prod.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="crm-btn crm-btn-secondary crm-btn-sm"
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit Product"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          className="crm-icon-btn"
                          style={{ width: '28px', height: '28px', color: '#ef4444' }}
                          onClick={() => handleDeleteProduct(prod.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Package size={48} style={{ color: '#94a3b8', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '1.05rem' }}>
                        {products.length === 0 ? 'No Products in Catalog' : 'No matching products found'}
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', margin: 0 }}>
                        {products.length === 0
                          ? 'Load the official Sahara Social Foundation Ayurvedic product catalog with 1 click.'
                          : 'Try changing your search term or category filter.'}
                      </p>
                      {products.length === 0 && (
                        <button 
                          className="crm-btn crm-btn-primary"
                          onClick={handleRestoreCatalog}
                          style={{ marginTop: '0.5rem' }}
                        >
                          <Sparkles size={16} /> Load Official Product Catalog
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      <CrmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct}>
          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Product Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">SKU Code</label>
              <input
                type="text"
                className="crm-input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Category</label>
              <select
                className="crm-form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Diabetes">Diabetes</option>
                <option value="Panchakarm">Panchakarm</option>
                <option value="Heart Liver Kidney">Heart Liver Kidney</option>
                <option value="Bones">Bones / Joints</option>
                <option value="Addiction">Addiction Recovery</option>
                <option value="Acidity">Acidity & Gut</option>
                <option value="Sexual Health">Vitality & Wellness</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Selling Price (₹) *</label>
              <input
                type="number"
                className="crm-input"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">MRP (₹)</label>
              <input
                type="number"
                className="crm-input"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Current Stock Count</label>
              <input
                type="number"
                className="crm-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Image URL</label>
            <input
              type="text"
              className="crm-input"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Description & Usage</label>
            <textarea
              className="crm-textarea"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Save Product</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
