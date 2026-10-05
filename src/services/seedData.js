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
  // 1st: Antox D single product
  {
    id: 'prod_antox_d',
    name: 'ANTOX-D',
    sku: 'NF-DIA-04',
    category: 'Diabetes',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/antox-d-new-266x400.png',
    description: 'Specialized Ayurvedic liquid formulation for blood glucose balance and pancreatic beta-cell rejuvenation.',
    status: 'active'
  },

  // 2nd: Antox T single product
  {
    id: 'prod_antox_t',
    name: 'ANTOX – T',
    sku: 'NF-TEA-02',
    category: 'Vitality',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/t-ew-419x400.png',
    description: 'Premium box of 60 herbal tea dip bags for systemic body purification, arterial health, and metabolic balance.',
    status: 'active'
  },

  // 3rd: b al nico spray single product
  {
    id: 'prod_spray_b_ai_nico',
    name: 'SPRAY-B-AI NICO',
    sku: 'NF-ADD-03',
    category: 'Addiction',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/spray-new-266x400.png',
    description: 'Fast-acting sublingual herbal spray to curb cravings for tobacco, gutkha, cigarettes, and alcohol instantly.',
    status: 'active'
  },

  // 4th: Antox X single product
  {
    id: 'prod_antox_x',
    name: 'ANTOX- X',
    sku: 'NF-VIT-07',
    category: 'Vitality',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/x-new-266x400.png',
    description: 'Potent herbal blend of 10 vital rasayanas for physical stamina, reducing fatigue, and boosting vigor.',
    status: 'active'
  },

  // 5th: 1 Antox D 1 Antox T combo kit
  {
    id: 'prod_antox_d_combo',
    name: '1 ANTOX-D & 1 ANTOX-T (Diabetes Support Kit)',
    sku: 'NF-COMBO-01',
    category: 'Diabetes',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/antox-d-new-266x400.png',
    description: 'Complete dual-action combo: 1 ANTOX-D liquid bottle + 1 ANTOX-T detox tea for optimal blood glucose balance.',
    status: 'active'
  },

  // 6th: 2 Antox D 1 Antox T combo kit
  {
    id: 'prod_antox_2d_1t_combo',
    name: '2 ANTOX-D & 1 ANTOX-T (Intensive Diabetes Kit)',
    sku: 'NF-COMBO-08',
    category: 'Diabetes',
    mrp: 6000,
    price: 4800,
    sellingPrice: 4800,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/antox-d-new-266x400.png',
    description: 'Complete intensive 60-day regimen: 2 ANTOX-D liquid bottles + 1 ANTOX-T detox tea box for long-term blood glucose regulation.',
    status: 'active'
  },

  // Other Combos
  {
    id: 'prod_spray_nico_combo',
    name: 'SPRAY-B-AI NICO & ANTOX-T (De-Addiction Support Kit)',
    sku: 'NF-COMBO-07',
    category: 'Addiction',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/spray-new-266x400.png',
    description: 'Dual de-addiction recovery combo: SPRAY-B-AI NICO craving controller + ANTOX-T systemic detox tea to eliminate tobacco & alcohol urges.',
    status: 'active'
  },
  {
    id: 'prod_antox_pn_combo',
    name: 'ANTOX -PN POWDER & ANTOX – PN OIL (Joint Care Kit)',
    sku: 'NF-COMBO-05',
    category: 'Bones',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/pn-new-266x400.png',
    description: 'Therapeutic joint flexibility and pain soothing duo with internal cartilage powder and external cold-pressed herbal massage oil.',
    status: 'active'
  },
  {
    id: 'prod_antox_hlk_combo',
    name: 'ANTOX-HLK & ANTOX-T (Heart, Liver, Kidney Kit)',
    sku: 'NF-COMBO-02',
    category: 'Heart Liver Kidney',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/hlk-new-266x400.png',
    description: 'Comprehensive natural organ detoxifier and revitalizer supporting cardiac performance, liver enzyme balance, and kidney filtration wellness.',
    status: 'active'
  },
  {
    id: 'prod_antox_b_acid_combo',
    name: 'ANTOX-B ACID & ANTOX-T (Acidity & Digestion Kit)',
    sku: 'NF-COMBO-03',
    category: 'Acidity',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/b-acid-new-266x400.png',
    description: 'Comprehensive Ayurvedic duo for hyperacidity, acid reflux, chronic gas, bile distress, and digestive cleansing with herbal detox brew.',
    status: 'active'
  },
  {
    id: 'prod_antox_amrut_51_combo',
    name: 'ANTOX – AMRUT 51 & ANTOX-T (Immunity & Vitality Kit)',
    sku: 'NF-COMBO-04',
    category: 'Vitality',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/amrut-new-266x400.png',
    description: 'Premium blend of 51 therapeutic Himalayan herbs paired with herbal detox tea for full-body rejuvenation, stamina, and cellular immunity.',
    status: 'active'
  },
  {
    id: 'prod_antox_x_combo',
    name: 'ANTOX- X & ANTOX-T (Vitality & Energy Kit)',
    sku: 'NF-COMBO-06',
    category: 'Vitality',
    mrp: 4000,
    price: 3200,
    sellingPrice: 3200,
    isCombo: true,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/x-new-266x400.png',
    description: 'Dual revitalization kit combining 10 rasayana energy herbs with detoxifying herbal brew tea.',
    status: 'active'
  },

  // Other Single Products
  {
    id: 'prod_antox_pn_oil',
    name: 'ANTOX – PN OIL',
    sku: 'NF-PN-OIL-01',
    category: 'Bones',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/oil-new-266x400.png',
    description: 'Traditional cold-pressed herbal joint massage oil for knees, back, cervical stiffness, and joint flexibility.',
    status: 'active'
  },
  {
    id: 'prod_antox_pn_powder',
    name: 'ANTOX -PN POWDER',
    sku: 'NF-BON-05',
    category: 'Bones',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/pn-new-266x400.png',
    description: 'Therapeutic herbal powder formulation to nourish cartilage, balance Vata Dosha, and ease joint inflammation.',
    status: 'active'
  },
  {
    id: 'prod_antox_hlk',
    name: 'ANTOX-HLK',
    sku: 'NF-ORG-06',
    category: 'Heart Liver Kidney',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/hlk-new-266x400.png',
    description: 'Tri-organ tonic supporting heart muscle strength, liver detox (fatty liver), and renal kidney filtration.',
    status: 'active'
  },
  {
    id: 'prod_antox_b_acid',
    name: 'ANTOX-B ACID',
    sku: 'NF-ACD-08',
    category: 'Acidity',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/b-acid-new-266x400.png',
    description: 'Fast-acting soothing Ayurvedic liquid for hyperacidity, acid reflux (GERD), heartburn, nausea, and bile distress.',
    status: 'active'
  },
  {
    id: 'prod_antox_amrut_51',
    name: 'ANTOX – AMRUT 51',
    sku: 'NF-AMR-09',
    category: 'Vitality',
    mrp: 2000,
    price: 1600,
    sellingPrice: 1600,
    isCombo: false,
    stock: 100,
    commissionEligible: true,
    commissionType: 'standard',
    image: 'https://nutrifeel.org/wp-content/uploads/amrut-new-266x400.png',
    description: 'Master Ayurvedic formulation of 51 therapeutic Himalayan herbs for full-body cellular rejuvenation, stamina, and immune defenses.',
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
