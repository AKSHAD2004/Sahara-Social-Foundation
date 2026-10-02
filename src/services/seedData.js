// Clean Seed Data for Samarth Kolhapur / Sahara Social Foundation CRM
// All dummy operational data removed for production readiness

export const initialUsers = [
  {
    id: 'usr_super_admin',
    name: 'Dr. Sharad Patil (Super Admin)',
    email: 'admin@samarthkolhapur.com',
    role: 'super_admin',
    phone: '9423827429',
    avatar: null,
    department: 'Executive Management',
    status: 'active'
  }
];

export const initialCommissionSlabs = [
  { id: 'slab_1', name: 'Slab 1 (Bronze)', minAmount: 0, maxAmount: 50000, ratePercentage: 2 },
  { id: 'slab_2', name: 'Slab 2 (Silver)', minAmount: 50001, maxAmount: 100000, ratePercentage: 4 },
  { id: 'slab_3', name: 'Slab 3 (Gold)', minAmount: 100001, maxAmount: 200000, ratePercentage: 6 },
  { id: 'slab_4', name: 'Slab 4 (Platinum)', minAmount: 200001, maxAmount: 500000, ratePercentage: 8 },
  { id: 'slab_5', name: 'Slab 5 (Diamond)', minAmount: 500001, maxAmount: null, ratePercentage: 10 }
];

export const initialSettings = {
  companyName: 'Sahara Social Foundation (सहारा सोशल फाऊंडेशन)',
  brandName: 'Samarth Kolhapur',
  tagline: 'मधुमेहमुक्त व व्यसनमुक्त भारत अभियान',
  registrationNo: 'MAH/582/2014/KOP',
  email: 'info@samarthkolhapur.com',
  phone: '+91 77450 66707',
  whatsappNumber: '+91 77450 66707',
  address: 'Samarth Health Care & Research Center, Opp. CPR Hospital, Kolhapur, Maharashtra 416002',
  currency: 'INR',
  commissionCalculationType: 'flat', // 'flat' or 'progressive'
  commissionTrigger: 'delivered_paid', // 'delivered_paid' or 'paid'
  commissionBasis: 'eligible_order_value',
  defaultReferralPrefix: 'SAHARA',
  payoutDayOfMonth: 30,
  taxRate: 5,
  websiteUrl: 'https://samarthkolhapur.com'
};

export const initialProducts = [
  // 1. OFFICIAL COMBO PACKS (₹3200)
  {
    id: 'prod_antox_d',
    name: 'Antox D & Antox T (Diabetes Support Kit)',
    sku: 'SK-DIA-01',
    category: 'Diabetes',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
    description: 'Specialized Ayurvedic herbal supplement formulation for blood sugar support, glucose balance, and overall vitality as part of Madhumehmukta Bharat Abhiyan.',
    status: 'active'
  },
  {
    id: 'prod_antox_hlk',
    name: 'Antox HLK & Antox T (Heart, Liver, Kidney Kit)',
    sku: 'SK-ORG-02',
    category: 'Heart Liver Kidney',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-hlk-t.jpg',
    description: 'Comprehensive natural organ detoxifier and revitalizer supporting cardiac performance, liver enzyme balance, and kidney filtration wellness.',
    status: 'active'
  },
  {
    id: 'prod_antox_x',
    name: 'Antox X & Antox T (Addiction Recovery Kit)',
    sku: 'SK-ADD-03',
    category: 'Addiction',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
    description: 'Natural herbal formula designed to reduce cravings, cleanse toxins, calm nervous anxiety, and restore vitality during Vyasanmukta Bharat Abhiyan initiatives.',
    status: 'active'
  },
  {
    id: 'prod_antox_pn',
    name: 'Antox PN Powder & PN Oil (Joint & Bone Care Kit)',
    sku: 'SK-BON-04',
    category: 'Bones',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-pn-kit.jpg',
    description: 'Therapeutic joint flexibility and pain soothing duo with anti-inflammatory herbs and traditional cold-pressed herbal oil for external massage.',
    status: 'active'
  },

  // 2. OFFICIAL SINGLE PRODUCTS (₹1600)
  {
    id: 'prod_antox_d_single',
    name: 'Antox D (Diabetes Support Formula - 300ml)',
    sku: 'SK-DIA-S01',
    category: 'Diabetes',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
    description: 'Single bottle of authentic Antox D Ayurvedic formula for blood sugar regulation and pancreatic vitality.',
    status: 'active'
  },
  {
    id: 'prod_antox_hlk_single',
    name: 'Antox HLK (Heart, Liver, Kidney Formula - 300ml)',
    sku: 'SK-ORG-S02',
    category: 'Heart Liver Kidney',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-hlk-t.jpg',
    description: 'Single bottle of Antox HLK vital organ protective and rejuvenating Ayurvedic tonic.',
    status: 'active'
  },
  {
    id: 'prod_antox_t_single',
    name: 'Antox T (Nutrifeel Herbal Detox Tea - 60 Tea Bags)',
    sku: 'SK-TEA-S03',
    category: 'Diabetes',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
    description: 'Single box of authentic Antox T detoxifying herbal brew tea bags for metabolism and organ cleansing.',
    status: 'active'
  },
  {
    id: 'prod_antox_x_single',
    name: 'Antox X (Addiction Recovery Formula - 300ml)',
    sku: 'SK-ADD-S04',
    category: 'Addiction',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-b-al-nico.jpg',
    description: 'Single bottle of Antox X herbal formula to calm urge cravings and rebuild nervous resilience.',
    status: 'active'
  },
  {
    id: 'prod_antox_pn_single',
    name: 'Antox PN (Joint & Bone Pain Relief Oil - 100ml)',
    sku: 'SK-BON-S05',
    category: 'Bones',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-pn-kit.jpg',
    description: 'Single bottle of Antox PN Ayurvedic joint and muscular therapeutic massage oil.',
    status: 'active'
  }
];

// Operational Collections (Clean Production Slate)
export const initialCustomers = [];
export const initialLeads = [];
export const initialFollowups = [];
export const initialOrders = [];
export const initialCommissionTransactions = [];
export const initialPayouts = [];
export const initialSupportTickets = [];
export const initialAuditLogs = [];
