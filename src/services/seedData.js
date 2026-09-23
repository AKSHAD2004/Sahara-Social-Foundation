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
  phone: '+91 94238 27429',
  whatsappNumber: '+91 94238 27429',
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
  {
    id: 'prod_antox_d',
    name: 'Antox D & Antox T (Diabetes Support Kit)',
    sku: 'SK-DIA-01',
    category: 'Diabetes',
    mrp: 3500,
    price: 2800,
    sellingPrice: 2800,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    description: 'Specialized Ayurvedic herbal supplement formulation for blood sugar support, glucose balance, and overall vitality as part of Madhumehmukta Bharat Abhiyan.',
    status: 'active'
  },
  {
    id: 'prod_antox_hlk',
    name: 'Antox HLK (Heart, Liver, Kidney Formula)',
    sku: 'SK-ORG-02',
    category: 'Heart Liver Kidney',
    mrp: 3200,
    price: 2600,
    sellingPrice: 2600,
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
    mrp: 4200,
    price: 3400,
    sellingPrice: 3400,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    description: 'Natural herbal formula designed to reduce cravings, cleanse toxins, calm nervous anxiety, and restore vitality during Vyasanmukta Bharat Abhiyan initiatives.',
    status: 'active'
  },
  {
    id: 'prod_antox_pn',
    name: 'Antox PN Powder & PN Oil (Joint & Bone Care)',
    sku: 'SK-BON-04',
    category: 'Bones',
    mrp: 2900,
    price: 2350,
    sellingPrice: 2350,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: '/antox-pn-kit.jpg',
    description: 'Therapeutic joint flexibility and pain soothing duo with anti-inflammatory herbs and traditional cold-pressed herbal oil for external massage.',
    status: 'active'
  },
  {
    id: 'prod_panchakarm_detox',
    name: 'Samarth Panchakarm Detox Elixir',
    sku: 'SK-DET-05',
    category: 'Panchakarm',
    mrp: 2200,
    price: 1750,
    sellingPrice: 1750,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&auto=format&fit=crop&q=80',
    description: 'Deep cellular cleansing botanical blend assisting gut rejuvenation, metabolic activation, and elimination of accumulated body toxins.',
    status: 'active'
  },
  {
    id: 'prod_acidity_care',
    name: 'Pitta Shamak & Acidity Relief Churna',
    sku: 'SK-ACD-06',
    category: 'Acidity',
    mrp: 1500,
    price: 1150,
    sellingPrice: 1150,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&auto=format&fit=crop&q=80',
    description: 'Fast-acting cooling herbal preparation for hyperacidity, GERD, gas relief, and digestive fire balance.',
    status: 'active'
  },
  {
    id: 'prod_vitality_gold',
    name: 'Rasayan Vitality Gold Capsule',
    sku: 'SK-VIT-07',
    category: 'Sexual Health',
    mrp: 3800,
    price: 2950,
    sellingPrice: 2950,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
    description: 'Premium Ashwagandha, Shilajit, and Swarna Bhasma fortified stamina, endurance, and hormonal vitality booster.',
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
