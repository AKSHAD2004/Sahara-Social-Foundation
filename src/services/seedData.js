// Clean Seed Data for Sahara Social Foundation CRM
// All dummy operational data removed for production readiness
import { galleryPhotos, horizontalVideosData } from '../data/websiteData';

export const initialUsers = [
  {
    id: 'usr_super_admin',
    name: 'Dr. Sharad Patil (Super Admin)',
    email: 'admin@saharasocialfoundation.org',
    role: 'super_admin',
    phone: '8421154090',
    avatar: null,
    department: 'Executive Management',
    status: 'active'
  },
  {
    id: 'usr_emp_akash',
    name: 'Akash Shinde (Senior Counselor)',
    email: 'akash@saharasocialfoundation.org',
    role: 'sales_executive',
    phone: '8421154090',
    avatar: null,
    department: 'Counseling & Sales',
    status: 'active'
  },
  {
    id: 'usr_aff_rahul',
    name: 'Rahul Deshmukh (Partner)',
    email: 'rahul@saharasocialfoundation.org',
    role: 'affiliate',
    phone: '8421154090',
    avatar: null,
    department: 'Affiliate Network',
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
  brandName: 'Sahara Social Foundation',
  tagline: 'मधुमेहमुक्त व व्यसनमुक्त भारत अभियान',
  registrationNo: 'MAH/582/2014/KOP',
  email: 'saharasocialfoundation@gmail.com',
  phone: '+91 84211 54090',
  whatsappNumber: '+91 84211 54090',
  address: 'Sahara Health Care Center, Opp. CPR Hospital, Kolhapur, Maharashtra 416002',
  currency: 'INR',
  commissionCalculationType: 'flat', // 'flat' or 'progressive'
  commissionTrigger: 'delivered_paid', // 'delivered_paid' or 'paid'
  commissionBasis: 'eligible_order_value',
  defaultReferralPrefix: 'SAHARA',
  payoutDayOfMonth: 30,
  taxRate: 5,
  websiteUrl: 'https://sahara-social-foundation.vercel.app'
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
    description: 'Specialized Nutraceutical liquid formulation for blood glucose balance and pancreatic beta-cell rejuvenation.',
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
    description: 'Comprehensive Nutraceutical duo for hyperacidity, acid reflux, chronic gas, bile distress, and digestive cleansing with herbal detox brew.',
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
    description: 'Fast-acting soothing Nutraceutical liquid for hyperacidity, acid reflux (GERD), heartburn, nausea, and bile distress.',
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
    description: 'Master Nutraceutical formulation of 51 therapeutic Himalayan herbs for full-body cellular rejuvenation, stamina, and immune defenses.',
    status: 'active'
  }
];

// Operational Collections (Includes Website Customer Orders)
export const initialCustomers = [
  {
    id: 'CUST-8421154090',
    customerId: 'CUST-8421154090',
    fullName: 'रमेश पाटील (Ramesh Patil)',
    phone: '8421154090',
    mobileNumber: '8421154090',
    whatsappNumber: '8421154090',
    email: 'ramesh.patil@gmail.com',
    address: 'राजारामपुरी, तिसरी गल्ली, कोल्हापूर',
    city: 'कोल्हापूर',
    state: 'Maharashtra',
    pincode: '416008',
    customerStatus: 'Active Buyer',
    leadSource: 'Website Direct',
    createdDate: '2026-08-10T10:30:00.000Z'
  }
];

export const initialLeads = [];
export const initialFollowups = [];

export const initialOrders = [
  {
    id: 'SSF-842101',
    orderId: 'SSF-842101',
    customerId: 'CUST-8421154090',
    customerName: 'रमेश पाटील (Ramesh Patil)',
    customerMobile: '8421154090',
    customerEmail: 'ramesh.patil@gmail.com',
    products: [
      {
        productId: 'prod_combo_antox_dt',
        name: 'Antox D आणि Antox T (मधुमेह नियंत्रण किट)',
        nameMr: 'Antox D आणि Antox T (मधुमेह नियंत्रण किट)',
        nameEn: 'Antox D & Antox T Kit',
        quantity: 1,
        price: 1499,
        total: 1499
      }
    ],
    quantity: 1,
    subtotal: 1499,
    discount: 0,
    tax: 0,
    shipping: 0,
    grandTotal: 1499,
    advancePaid: 1499,
    balanceDue: 0,
    eligibleAmount: 1499,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    source: 'Website Customer Page',
    paymentMethod: 'Online Payment (UPI/Cards)',
    orderDate: '2026-08-10T10:30:00.000Z',
    shippingAddress: 'राजारामपुरी, तिसरी गल्ली, कोल्हापूर, Maharashtra - 416008'
  }
];

export const initialCommissionTransactions = [];
export const initialPayouts = [];
export const initialSupportTickets = [];
export const initialAuditLogs = [];

export const initialHeroSlides = [
  {
    id: 'slide_1',
    image: '/slide-antox-d.jpg',
    fallback: '/hero-slide-1.jpg',
    pillText: 'Antox D + Antox T',
    badgeEn: 'Antox D + Antox T • Diabetes Care',
    badgeMr: 'मधुमेहमुक्त भारत अभियान • Antox D + Antox T',
    titleEn: 'Nutrifeel Antox D & Antox T Herbal Formula',
    titleMr: 'मधुमेहामुळे होणाऱ्या समस्यांमध्ये दिलासा देण्यासाठी लाभदायक',
    displayOrder: 1,
    status: 'active'
  },
  {
    id: 'slide_2',
    image: '/slide-vyasanmukt.jpg',
    fallback: '/slide-vyasanmukt.jpg',
    pillText: 'Antox B-AL-NICO SPRAY + Antox T',
    badgeEn: 'Addiction-Free Campaign • Antox B-AL-NICO + Antox T',
    badgeMr: 'व्यसनमुक्त भारत अभियान • Antox B-AL-NICO + Antox T',
    titleEn: 'Herbal Spray & Tea for Tobacco & Alcohol De-addiction',
    titleMr: 'कोणत्याही प्रकारचे व्यसन सोडवण्यासाठी अत्यंत फायदेशीर',
    displayOrder: 2,
    status: 'active'
  },
  {
    id: 'slide_3',
    image: '/slide-rogmukt-hlk.jpg',
    fallback: '/slide-rogmukt-hlk.jpg',
    pillText: 'Antox HLK + Antox T',
    badgeEn: 'Disease-Free Campaign • Heart, Liver & Kidney Care',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox HLK + Antox T',
    titleEn: 'Arjun & Methi Nutraceutical Formulation for Vital Organs',
    titleMr: 'हार्ट, लिव्हर आणि किडनी संरक्षणासाठी व आरोग्यासाठी फायदेशीर',
    displayOrder: 3,
    status: 'active'
  },
  {
    id: 'slide_4',
    image: '/slide-vednamukt.jpg',
    fallback: '/slide-vednamukt.jpg',
    pillText: 'Antox PN Powder + Oil',
    badgeEn: 'Pain-Free Campaign • Joint, Bone & Spine Care',
    badgeMr: 'वेदनामुक्त भारत अभियान • Antox PN Powder + Oil',
    titleEn: 'Marine Collagen & Herbal Oil for Joint and Back Relief',
    titleMr: 'सर्व प्रकारच्या सांधेदुखी व मणक्याच्या त्रासापासून आराम मिळवण्यात फायदेशीर',
    displayOrder: 4,
    status: 'active'
  },
  {
    id: 'slide_5',
    image: '/slide-rogmukt-bacid.jpg',
    fallback: '/slide-rogmukt-bacid.jpg',
    pillText: 'Antox B-Acid + Antox T',
    badgeEn: 'Disease-Free Campaign • Acidity & Digestion Care',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox B-Acid + Antox T',
    titleEn: 'Electro-Homeopathic & Herbal Formula for Hyperacidity Relief',
    titleMr: 'ॲसिडिटी (आम्लपित्त) व पचन विकार नियंत्रित करण्यासाठी लाभदायक',
    displayOrder: 5,
    status: 'active'
  },
  {
    id: 'slide_6',
    image: '/slide-rogmukt-antox-x.jpg',
    fallback: '/slide-rogmukt-antox-x.jpg',
    pillText: 'Antox X + Antox T',
    badgeEn: 'Disease-Free Campaign • Vitality & Men Strength',
    badgeMr: 'रोगमुक्त भारत अभियान • Antox X + Antox T',
    titleEn: 'Safed Musali & Botanical Extracts for Energy & Vitality',
    titleMr: 'पुरुषांच्या लैंगिक समस्या व अशक्तपणा दूर करण्यासाठी लाभदायक',
    displayOrder: 6,
    status: 'active'
  },
  {
    id: 'slide_7',
    image: '/slide-antox-amrut.jpg',
    fallback: '/hero-slide-2.jpg',
    pillText: 'Antox Amrut 51 + Antox T',
    badgeEn: 'Pre-Clinically Tested • Sharir Shuddhi Panchakarma',
    badgeMr: 'शरीरशुद्धी पंचकर्म • Antox Amrut 51 + Antox T',
    titleEn: 'Detoxification & Essential Nutrition for Complete Body Health',
    titleMr: 'शरीरशुद्धी + पोषक तत्व = आरोग्यदायी निरोगी शरीर',
    displayOrder: 7,
    status: 'active'
  }
];

export const initialGalleryPhotos = galleryPhotos;
export const initialVideos = horizontalVideosData;

export const initialReviews = [
  {
    id: 'rev-01',
    rating: 5,
    name: 'Gary Miller',
    date: 'October 3, 2026',
    status: 'approved',
    isApproved: true,
    review: 'bannersI am not offering SEO or Pay Per Click Advertising services.\n\nThis is something entirely different.\n\nLet me demonstrate how it works and you’ll be pleasantly surprised by the results.\n\nSimply send us your desired keywords or fill online quote form on our website, and I’ll send you minimum traffic amount that ... Show more'
  },
  {
    id: 'rev-02',
    rating: 5,
    name: 'Sukumar',
    date: 'December 13, 2025',
    status: 'approved',
    isApproved: true,
    review: 'जबरदस्त फॉर्म्युला आहे शुगर साठी'
  },
  {
    id: 'rev-03',
    rating: 5,
    name: 'दिनकर नलवडे (Dinkar Nalvade)',
    date: 'December 13, 2025',
    status: 'approved',
    isApproved: true,
    review: 'माझी शुगर लेव्हल आता पूर्णपणे नियंत्रणात आहे. Antox D आणि T ने खूप चांगला परिणाम मिळाला. धन्यवाद सहारा सोशल फाऊंडेशन!'
  },
  {
    id: 'rev-04',
    rating: 5,
    name: 'सौ. वंदना मोरे (Vandana More)',
    date: 'December 10, 2025',
    status: 'approved',
    isApproved: true,
    review: '१० वर्षांचे तंबाखूचे व्यसन Antox B-AL-NICO स्प्रे मुळे बंद झाले. घरात पुन्हा आनंदाचे वातावरण निर्माण झाले आहे.'
  },
  {
    id: 'rev-05',
    rating: 5,
    name: 'दिलीपराव कुलकर्णी (Diliprao Kulkarni)',
    date: 'November 28, 2025',
    status: 'approved',
    isApproved: true,
    review: 'गुडघेदुखी आणि सांधेदुखीवर Antox PN पावडर अत्यंत प्रभावी ठरली. आता विनासायास चालता येते.'
  },
  {
    id: 'rev-06',
    rating: 5,
    name: 'सचिन गायकवाड (Sachin Gaikwad)',
    date: 'November 15, 2025',
    status: 'approved',
    isApproved: true,
    review: 'पित्त, छातीतील जळजळ आणि अपचनावर Antox-B Acid ने तात्काळ आराम दिला. १ आठवड्यात गुण आला.'
  },
  {
    id: 'rev-07',
    rating: 5,
    name: 'महेश पाटील (Mahesh Patil)',
    date: 'October 22, 2025',
    status: 'approved',
    isApproved: true,
    review: 'खूप उत्तम आयुर्वेदिक औषधे आहेत. फोनवर समुपदेशकांनी आहाराचे पथ्य व्यवस्थित समजावून सांगितले.'
  },
  {
    id: 'rev-08',
    rating: 5,
    name: 'Ramesh Shinde',
    date: 'October 18, 2025',
    status: 'approved',
    isApproved: true,
    review: 'Fasting sugar dropped from 220 to 110 after 40 days course. Best natural ayurvedic formula.'
  },
  {
    id: 'rev-09',
    rating: 5,
    name: 'अशोक देसाई (Ashok Desai)',
    date: 'September 30, 2025',
    status: 'approved',
    isApproved: true,
    review: 'पार्सल वेळेवर मिळाले आणि पॅकिंग खूप सुरक्षित होते. औषधाचा गुण अप्रतिम आहे.'
  },
  {
    id: 'rev-10',
    rating: 5,
    name: 'सुरेश कांबळे (Suresh Kamble)',
    date: 'September 14, 2025',
    status: 'approved',
    isApproved: true,
    review: 'Antox-HLK घेतल्यापासून रक्तदाब आणि कोलेस्टेरॉल नियंत्रणात आले आहे. अत्यंत विश्वासार्ह संस्था.'
  },
  {
    id: 'rev-11',
    rating: 5,
    name: 'Sunita Joshi',
    date: 'August 29, 2025',
    status: 'approved',
    isApproved: true,
    review: 'Very effective products. The doctors and counseling staff guide you personally over phone call.'
  },
  {
    id: 'rev-12',
    rating: 5,
    name: 'आनंदराव मोहिते (Anandrao Mohite)',
    date: 'August 12, 2025',
    status: 'approved',
    isApproved: true,
    review: 'व्यसनमुक्ती स्प्रे खूप चांगला आहे, कोणतीही जबरदस्ती न करता व्यसन सुटले.'
  },
  {
    id: 'rev-13',
    rating: 5,
    name: 'Dr. P. K. Sawant',
    date: 'July 25, 2025',
    status: 'approved',
    isApproved: true,
    review: 'Sugar control is 100% genuine with Antox D and T tea. Highly recommend to everyone.'
  },
  {
    id: 'rev-14',
    rating: 5,
    name: 'प्रभाकर खोत (Prabhakar Khot)',
    date: 'July 10, 2025',
    status: 'approved',
    isApproved: true,
    review: 'सांध्यांमधील कटकट आवाज आणि सूज Antox PN ऑईलने कमी झाली.'
  },
  {
    id: 'rev-15',
    rating: 5,
    name: 'Vikas Bhosale',
    date: 'June 22, 2025',
    status: 'approved',
    isApproved: true,
    review: 'Original genuine formulas. Prompt delivery in Kolhapur district.'
  },
  {
    id: 'rev-16',
    rating: 5,
    name: 'तानाजी चव्हाण (Tanaji Chavan)',
    date: 'June 05, 2025',
    status: 'approved',
    isApproved: true,
    review: 'सहारा सोशल फाऊंडेशनचे काम समाजोपयोगी आहे. औषधांनी आम्हाला नवा विश्वास दिला.'
  }
];



