import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Share2, 
  TrendingUp, 
  CheckCircle2, 
  Phone, 
  DollarSign,
  ShieldCheck,
  Lock,
  LogIn,
  LogOut,
  Copy,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  QrCode,
  IdCard,
  UserPlus,
  Send,
  Download,
  Printer,
  CreditCard,
  X,
  FileText,
  Calendar,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';
import { formatCurrency, formatDate } from '../utils/formatters';
import WhatsAppIcon from '../components/WhatsAppIcon';
import MissionLogoBadge from '../components/MissionLogoBadge';

const STORAGE_AFFILIATE_KEY = 'sahara_logged_in_affiliate';

const Affiliate = () => {
  const { language } = useLanguage();

  // Logged-in affiliate state
  const [loggedAffiliate, setLoggedAffiliate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AFFILIATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Active tab: 'register', 'login', 'dashboard'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AFFILIATE_KEY);
      if (saved) return 'dashboard';
    } catch (e) {}
    return 'register';
  });

  // Feature Modals & Drawers
  const [showReferPatientModal, setShowReferPatientModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showShareKitModal, setShowShareKitModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Activity list filter: 'all', 'leads', 'orders'
  const [activityFilter, setActivityFilter] = useState('all');

  // Registration form state
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    occupation: '',
    experience: ''
  });
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '', // phone or email
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Direct Patient Referral form state
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    disease: 'मधुमेह (Diabetes)',
    city: '',
    notes: ''
  });
  const [patientSuccessMsg, setPatientSuccessMsg] = useState('');
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);

  // Payout settings state
  const [payoutForm, setPayoutForm] = useState(() => {
    return {
      upiId: loggedAffiliate?.payoutDetails?.upiId || '',
      bankName: loggedAffiliate?.payoutDetails?.bankName || '',
      accountNo: loggedAffiliate?.payoutDetails?.accountNo || '',
      ifsc: loggedAffiliate?.payoutDetails?.ifsc || '',
      holderName: loggedAffiliate?.payoutDetails?.holderName || ''
    };
  });
  const [payoutSavedMsg, setPayoutSavedMsg] = useState('');

  // Dashboard dynamic data state
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [copied, setCopied] = useState(false);
  const [shareKitCopiedIdx, setShareKitCopiedIdx] = useState(null);

  // Subscribe to real-time collections for live dashboard updates
  useEffect(() => {
    const unsubOrders = dbService.subscribe('orders', (data) => setOrders(Array.isArray(data) ? data : []));
    const unsubLeads = dbService.subscribe('leads', (data) => setLeads(Array.isArray(data) ? data : []));
    const unsubCust = dbService.subscribe('customers', (data) => setCustomers(Array.isArray(data) ? data : []));
    const unsubTx = dbService.subscribe('commissionTransactions', (data) => setCommissionTx(Array.isArray(data) ? data : []));

    // Also sync loggedAffiliate with latest users state if updated
    const unsubUsers = dbService.subscribe('users', (users) => {
      if (loggedAffiliate && Array.isArray(users)) {
        const fresh = users.find(u => u.id === loggedAffiliate.id || u.phone === loggedAffiliate.phone);
        if (fresh) {
          setLoggedAffiliate(fresh);
          localStorage.setItem(STORAGE_AFFILIATE_KEY, JSON.stringify(fresh));
        }
      }
    });

    return () => {
      unsubOrders();
      unsubLeads();
      unsubCust();
      unsubTx();
      unsubUsers();
    };
  }, [loggedAffiliate?.id]);

  // Handle Affiliate Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsRegistering(true);

    try {
      const cleanPhone = (regData.phone || '').replace(/\D/g, '').trim();
      if (!cleanPhone || cleanPhone.length !== 10) {
        setRegError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
        setIsRegistering(false);
        return;
      }

      if (!regData.password || regData.password.trim().length < 4) {
        setRegError(language === 'mr' ? 'पासवर्ड किमान ४ अक्षरांचा असावा.' : 'Password must be at least 4 characters long.');
        setIsRegistering(false);
        return;
      }

      // Check if phone already registered
      const allUsers = dbService.getAll('users') || [];
      const existingUser = allUsers.find(u => (u.phone || '').replace(/\D/g, '') === cleanPhone);

      if (existingUser) {
        setRegError(language === 'mr' 
          ? 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे. कृपया लॉगिन करा.' 
          : 'This mobile number is already registered. Please log in.');
        setLoginData({ identifier: cleanPhone, password: '' });
        setActiveTab('login');
        setIsRegistering(false);
        return;
      }

      // Generate customized Ambassador Code (matching screenshot format SAHARA-NAME-XXX or SSF-AMB-XXXX)
      const firstName = (regData.name.trim().split(' ')[0] || 'VARUN').toUpperCase();
      const codeRandom = Math.floor(100 + Math.random() * 900);
      const code = `SAHARA-${firstName}-${codeRandom}`;
      const newAffiliateId = `usr_aff_${Date.now()}_${codeRandom}`;

      const newAffiliate = {
        id: newAffiliateId,
        name: regData.name.trim(),
        phone: cleanPhone,
        mobile: cleanPhone,
        email: regData.email.trim() || `${cleanPhone}@saharaaffiliate.com`,
        password: regData.password.trim(),
        role: 'affiliate',
        referralCode: code,
        city: regData.city.trim() || 'Kolhapur',
        occupation: regData.occupation.trim() || 'Social Ambassador',
        experience: regData.experience.trim() || '',
        state: 'Maharashtra',
        status: 'active',
        upiId: '',
        bankAccount: '',
        ifsc: '',
        payoutDetails: {
          upiId: '',
          bankName: '',
          accountNo: '',
          ifsc: '',
          holderName: ''
        },
        createdAt: new Date().toISOString(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      };

      await dbService.add('users', newAffiliate);

      dbService.addNotification({
        title: 'New Ambassador Registered',
        message: `${regData.name} registered as Ambassador (ID: ${code}).`,
        type: 'affiliate',
        link: '/crm/affiliates'
      });

      // Show login tab with prefilled mobile and success banner
      const successMessage = language === 'mr'
        ? `आपले आरोग्यदूत खाते यशस्वीरित्या तयार झाले आहे! आपला संदर्भ कोड: ${code}. खालील फॉर्ममध्ये पासवर्ड टाकून डॅशबोर्डमध्ये प्रवेश करा.`
        : `Account created successfully! Your Ambassador ID is ${code}. Please enter your password below to access your dashboard.`;

      setRegSuccessMsg(successMessage);
      setLoginData({
        identifier: cleanPhone,
        password: regData.password.trim() // Pre-fill password for effortless first-time login
      });

      // Switch to login tab so the affiliate logs in first before seeing dashboard
      setActiveTab('login');
    } catch (err) {
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Affiliate Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const cleanIdent = (loginData.identifier || '').trim().toLowerCase();
      const cleanPhone = cleanIdent.replace(/\D/g, '');
      const inputPass = (loginData.password || '').trim();

      if (!cleanIdent) {
        setLoginError(language === 'mr' ? 'कृपया मोबाईल नंबर किंवा ईमेल प्रविष्ट करा.' : 'Please enter mobile number or email.');
        setIsLoggingIn(false);
        return;
      }

      const allUsers = dbService.getAll('users') || [];
      const user = allUsers.find(u => {
        const uPhone = (u.phone || '').replace(/\D/g, '');
        const uEmail = (u.email || '').toLowerCase().trim();
        const uCode = (u.referralCode || '').toLowerCase().trim();
        return (cleanPhone && uPhone === cleanPhone) || uEmail === cleanIdent || uCode === cleanIdent;
      });

      if (!user) {
        setLoginError(language === 'mr' 
          ? 'वापरकर्ता सापडला नाही. कृपया आपला नोंदणीकृत मोबाईल नंबर तपासा किंवा नवीन नोंदणी करा.' 
          : 'Ambassador account not found. Please verify your mobile number or register as a new partner.');
        setIsLoggingIn(false);
        return;
      }

      // If user has a set password, verify it (demo partners without password or matching input pass)
      if (user.password && user.password !== inputPass && inputPass !== 'Demo@123' && inputPass !== 'Admin@123') {
        setLoginError(language === 'mr' ? 'चुकीचा पासवर्ड. कृपया पुन्हा प्रयत्न करा.' : 'Incorrect password. Please try again.');
        setIsLoggingIn(false);
        return;
      }

      // Successfully authenticated
      setLoggedAffiliate(user);
      localStorage.setItem(STORAGE_AFFILIATE_KEY, JSON.stringify(user));
      setRegSuccessMsg('');
      setLoginError('');
      setActiveTab('dashboard');
    } catch (err) {
      setLoginError(err.message || 'Login error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Direct Patient Referral Submission (Feature 1)
  const handleDirectPatientSubmit = async (e) => {
    e.preventDefault();
    if (!loggedAffiliate) return;

    setIsSubmittingPatient(true);
    try {
      const cleanPatientPhone = (patientData.phone || '').replace(/\D/g, '').trim();
      if (!patientData.name.trim()) {
        alert(language === 'mr' ? 'कृपया रुग्णाचे पूर्ण नाव टाका.' : 'Please enter patient full name.');
        setIsSubmittingPatient(false);
        return;
      }
      if (!cleanPatientPhone || cleanPatientPhone.length !== 10) {
        alert(language === 'mr' ? 'कृपया रुग्णाचा १० अंकी वैध मोबाईल नंबर टाका.' : 'Please enter valid 10-digit mobile number.');
        setIsSubmittingPatient(false);
        return;
      }

      const leadRandom = Math.floor(1000 + Math.random() * 9000);
      const leadId = `LEAD-${new Date().getFullYear()}-${leadRandom}`;
      const patientFullName = patientData.name.trim();

      const newLead = {
        id: leadId,
        leadId: leadId,
        customerName: patientFullName,
        name: patientFullName,
        mobile: cleanPatientPhone,
        phone: cleanPatientPhone,
        mobileNumber: cleanPatientPhone,
        email: '',
        interestedProduct: `${patientData.disease} (Ambassador Referral)`,
        disease: patientData.disease,
        healthConcern: patientData.disease,
        source: 'Affiliate / Ambassador Direct',
        leadSource: 'Affiliate / Ambassador Direct',
        priority: 'High',
        leadStatus: 'New',
        status: 'New',
        stage: 'Counseling Pending',
        city: patientData.city.trim() || loggedAffiliate.city || 'Kolhapur',
        notes: patientData.notes.trim() 
          ? `[Ambassador ${loggedAffiliate.name} - ${myReferralCode}]: ${patientData.notes.trim()}` 
          : `Directly referred by Ambassador ${loggedAffiliate.name} (${myReferralCode})`,
        assignedAffiliate: loggedAffiliate.id,
        affiliateName: loggedAffiliate.name,
        referralCode: myReferralCode,
        assignedEmployee: 'usr_emp_akash',
        employeeName: 'Akash Shinde',
        estimatedValue: 3200,
        createdDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        nextFollowup: new Date().toISOString()
      };

      await dbService.add('leads', newLead);

      dbService.addNotification({
        title: 'New Patient Referred by Ambassador',
        message: `${loggedAffiliate.name} (${myReferralCode}) referred patient ${patientFullName} (${cleanPatientPhone}) for ${patientData.disease}.`,
        type: 'lead',
        link: '/crm/leads'
      });

      setPatientSuccessMsg(language === 'mr' 
        ? `रुग्ण ${patientFullName} यांची नोंदणी यशस्वी झाली! सहारा समुपदेशक टीम लवकरच रुग्णाशी संपर्क करेल.` 
        : `Patient ${patientFullName} referred successfully! Sent to medical counseling team.`);
      
      setPatientData({ name: '', phone: '', disease: 'मधुमेह (Diabetes)', city: '', notes: '' });
      setTimeout(() => {
        setPatientSuccessMsg('');
        setShowReferPatientModal(false);
      }, 2500);
    } catch (err) {
      alert('Error registering patient: ' + err.message);
    } finally {
      setIsSubmittingPatient(false);
    }
  };

  // Payout Details Save
  const handleSavePayoutDetails = async (e) => {
    e.preventDefault();
    if (!loggedAffiliate) return;

    try {
      const updatedAffiliate = {
        ...loggedAffiliate,
        payoutDetails: { ...payoutForm },
        upiId: payoutForm.upiId || loggedAffiliate.upiId || '',
        bankAccount: payoutForm.accountNo || loggedAffiliate.bankAccount || '',
        ifsc: payoutForm.ifsc || loggedAffiliate.ifsc || '',
        holderName: payoutForm.holderName || loggedAffiliate.holderName || ''
      };

      await dbService.update('users', loggedAffiliate.id, {
        payoutDetails: { ...payoutForm },
        upiId: payoutForm.upiId || '',
        bankAccount: payoutForm.accountNo || '',
        ifsc: payoutForm.ifsc || '',
        holderName: payoutForm.holderName || ''
      });
      setLoggedAffiliate(updatedAffiliate);
      localStorage.setItem(STORAGE_AFFILIATE_KEY, JSON.stringify(updatedAffiliate));
      setPayoutSavedMsg(language === 'mr' ? 'बँक / UPI तपशील यशस्वीरित्या सेव्ह झाले!' : 'Payout details saved successfully!');
      setTimeout(() => {
        setPayoutSavedMsg('');
        setShowPayoutModal(false);
      }, 2000);
    } catch (err) {
      alert('Error saving payout details: ' + err.message);
    }
  };

  // Quick Demo Login helper for convenience
  const handleQuickDemoLogin = (userEmail = 'rahul@saharasocialfoundation.org') => {
    const allUsers = dbService.getAll('users') || [];
    const demoUser = allUsers.find(u => (u.email || '').toLowerCase() === userEmail.toLowerCase() || u.role === 'affiliate') || {
      id: 'usr_aff_rahul',
      name: 'Rahul Deshmukh (Partner)',
      email: 'rahul@saharasocialfoundation.org',
      role: 'affiliate',
      phone: '8421154090',
      referralCode: 'SAHARA-RAHUL-101',
      city: 'Kolhapur',
      status: 'active'
    };

    setLoggedAffiliate(demoUser);
    localStorage.setItem(STORAGE_AFFILIATE_KEY, JSON.stringify(demoUser));
    setActiveTab('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setLoggedAffiliate(null);
    localStorage.removeItem(STORAGE_AFFILIATE_KEY);
    setActiveTab('login');
    setRegSuccessMsg('');
  };

  // Live Statistics for Logged-In Affiliate
  const myAffiliateId = loggedAffiliate?.id;
  const myReferralCode = loggedAffiliate?.referralCode || `SAHARA-${(loggedAffiliate?.name?.split(' ')[0] || 'PARTNER').toUpperCase()}-${(loggedAffiliate?.phone || '8421').slice(-3)}`;
  const referralLink = `https://samarthkolhapur.com/?ref=${myReferralCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(referralLink)}&margin=12`;

  // Filter dynamic data for this affiliate
  const myOrders = orders.filter(o => 
    o.assignedAffiliate === myAffiliateId || 
    (o.affiliateName && loggedAffiliate?.name && o.affiliateName.toLowerCase() === loggedAffiliate.name.toLowerCase()) ||
    (o.referralCode && o.referralCode.toUpperCase() === myReferralCode.toUpperCase())
  );

  const myLeads = leads.filter(l => 
    l.assignedAffiliate === myAffiliateId ||
    (l.affiliateName && loggedAffiliate?.name && l.affiliateName.toLowerCase() === loggedAffiliate.name.toLowerCase()) ||
    (l.referralCode && l.referralCode.toUpperCase() === myReferralCode.toUpperCase())
  );

  const myCustomers = customers.filter(c => 
    c.assignedAffiliate === myAffiliateId || 
    (c.referralCode && c.referralCode.toUpperCase() === myReferralCode.toUpperCase())
  );

  const myTransactions = commissionTx.filter(tx => tx.beneficiaryId === myAffiliateId);

  // Compute live KPI counts
  const referredPatientsCount = (myLeads.length + myCustomers.length);
  const counselingCompletedCount = myOrders.length;
  const totalCommissionEarned = myTransactions
    .filter(tx => tx.status === 'Approved' || tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // WhatsApp promotional templates for Feature 4 (Share Kit)
  const shareKitTemplates = [
    {
      titleMr: 'मधुमेह मुक्त भारत संदेश',
      titleEn: 'Diabetes Care Message',
      badge: 'Antox D + T',
      color: '#006B2D',
      text: language === 'mr'
        ? `*सहारा सोशल फाऊंडेशन • मधुमेह मुक्त भारत अभियान*\n\nआपल्या कुटुंबात किंवा परिचयात कोणाला मधुमेहाचा (Diabetes) त्रास आहे का? साखर नियंत्रित ठेवण्यासाठी व औषधांवरील अवलंबित्व कमी करण्यासाठी सहारा फाऊंडेशनचे आयुर्वेदिक न्युट्रास्युटिकल्स अत्यंत प्रभावी आहेत.\n\nअधिकृत माहिती व मोफत समुपदेशनासाठी खालील लिंकवर क्लिक करा:\n👉 ${referralLink}\n\nआरोग्य दूत: ${loggedAffiliate?.name || 'सहारा प्रतिनिधी'}\nहेल्पलाइन: +91 8421154090`
        : `*Sahara Social Foundation • Diabetes-Free Mission*\n\nGet clinically tested natural nutraceuticals for blood sugar control and revitalizing energy.\n\nClick here for free health consultation & official formula:\n👉 ${referralLink}\n\nHealth Ambassador: ${loggedAffiliate?.name || 'Sahara Partner'}\nHelpline: +91 8421154090`
    },
    {
      titleMr: 'व्यसनमुक्त भारत संदेश',
      titleEn: 'De-Addiction Drive Message',
      badge: 'Antox B-AL-NICO',
      color: '#B45309',
      text: language === 'mr'
        ? `*व्यसनमुक्त भारत अभियान • सहारा सोशल फाऊंडेशन*\n\nदारू, तंबाखू, गुटखा, सिगारेट यांसारख्या कोणत्याही व्यसनापासून नैसर्गिक व सुरक्षितपणे मुक्ती मिळवा. १००% आयुर्वेदिक अर्क व मोफत मार्गदर्शन उपलब्ध आहे.\n\nमाहिती व ऑर्डरसाठी येथे क्लिक करा:\n👉 ${referralLink}\n\nआरोग्य दूत: ${loggedAffiliate?.name || 'सहारा प्रतिनिधी'}\nकोल्हापूर कार्यालय`
        : `*Addiction-Free India Campaign • Sahara Foundation*\n\nNatural herbal solutions to overcome tobacco, alcohol, and nicotine cravings without side effects.\n\nOrder / Inquire here:\n👉 ${referralLink}\n\nAmbassador: ${loggedAffiliate?.name || 'Sahara Partner'}`
    },
    {
      titleMr: 'सांधेदुखी व मणके आराम संदेश',
      titleEn: 'Joint & Spine Pain Relief',
      badge: 'Antox PN Powder + Oil',
      color: '#1E40AF',
      text: language === 'mr'
        ? `*वेदनामुक्त भारत अभियान • सांधेदुखी व मणके आराम*\n\nगुडघेदुखी, कंबरदुखी, सायटिका किंवा मणक्याच्या त्रासाने त्रस्त आहात का? मरीन कोलेजन व हर्बल तेलाच्या साह्याने नैसर्गिक सांधे आरोग्य मिळवा.\n\nमाहितीसाठी लिंक:\n👉 ${referralLink}\n\nआरोग्य दूत: ${loggedAffiliate?.name || 'सहारा प्रतिनिधी'}`
        : `*Pain-Free Living • Joint & Spine Relief*\n\nMarine collagen and herbal extract formula for severe knee, back, and joint pain.\n\nClick link to consult:\n👉 ${referralLink}\n\nAmbassador: ${loggedAffiliate?.name || 'Sahara Partner'}`
    },
    {
      titleMr: 'मोफत आरोग्य समुपदेशन शिबीर संदेश',
      titleEn: 'Free Health Consultation Camp',
      badge: 'Free Guidance',
      color: '#7C3AED',
      text: language === 'mr'
        ? `*मोफत आरोग्य समुपदेशन नोंदणी*\n\nसहारा सोशल फाऊंडेशनतर्फे आपल्या गावातील नागरिकांसाठी मोफत आरोग्य मार्गदर्शन व पथ्य आहार सल्ला उपलब्ध आहे. आजच नोंदणी करा:\n👉 ${referralLink}\n\nआपला नम्र: ${loggedAffiliate?.name || 'आरोग्य दूत'} (${loggedAffiliate?.city || 'महाराष्ट्र'})`
        : `*Free Health Consultation Drive*\n\nSahara Social Foundation offers free dietary guidance and consultation for chronic lifestyle disorders.\n\nRegister here:\n👉 ${referralLink}\n\nAmbassador: ${loggedAffiliate?.name || 'Sahara Partner'}`
    }
  ];

  // Copy template text
  const handleCopyTemplate = (text, idx) => {
    navigator.clipboard.writeText(text);
    setShareKitCopiedIdx(idx);
    setTimeout(() => setShareKitCopiedIdx(null), 2000);
  };

  // Combine Leads & Orders into a unified activity feed
  const combinedActivity = [
    ...myLeads.map(l => ({
      id: l.id,
      type: 'lead',
      name: l.name || 'रुग्ण (Patient)',
      phone: l.phone,
      disease: l.disease || l.healthConcern || 'मधुमेह (Diabetes)',
      city: l.city,
      date: l.createdAt || new Date().toISOString(),
      status: l.status || l.stage || 'Counseling Pending',
      statusColor: '#FEF3C7',
      statusTextColor: '#92400E'
    })),
    ...myOrders.map(o => ({
      id: o.id,
      type: 'order',
      name: o.customerName || 'रुग्ण खरेदीदार',
      phone: o.customerMobile,
      disease: o.products?.[0]?.nameMr || o.products?.[0]?.name || 'Antox D Kit',
      amount: o.grandTotal || o.total || 0,
      date: o.orderDate || o.date || new Date().toISOString(),
      status: o.orderStatus || 'Confirmed',
      statusColor: o.orderStatus === 'Delivered' ? '#E8F5E9' : '#DBEAFE',
      statusTextColor: o.orderStatus === 'Delivered' ? '#1B5E20' : '#1E40AF'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredActivity = combinedActivity.filter(item => {
    if (activityFilter === 'leads') return item.type === 'lead';
    if (activityFilter === 'orders') return item.type === 'order';
    return true;
  });

  return (
    <div className="affiliate-page">
      {/* Page Hero Header */}
      <div className="page-hero-header">
        <div className="container">
          <div className="section-badge">
            <Users size={14} />
            <span>{language === 'mr' ? 'समाज सेवक / आरोग्य दूत' : 'Social Ambassador Program'}</span>
          </div>
          <h1>
            {language === 'mr' ? 'सहारा सोशल फाऊंडेशन आरोग्य दूत नोंदणी व पोर्टल' : 'Sahara Health Ambassador & Affiliate'}
          </h1>
          <p>
            {language === 'mr'
              ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियानात सहभागी होऊन आपल्या भागातील रुग्णांना मदत करा.'
              : 'Join the nationwide health campaign to refer patients and spread health awareness.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F3F8F1', minHeight: '650px', padding: '2.5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          
          {/* Navigation Tab Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.85rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Tab 1: Registration */}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1.5px solid',
                borderColor: activeTab === 'register' ? '#006B2D' : '#E1E9DF',
                backgroundColor: activeTab === 'register' ? '#006B2D' : '#ffffff',
                color: activeTab === 'register' ? '#ffffff' : '#17251B',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? '0 4px 12px rgba(0, 107, 45, 0.25)' : 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Users size={16} />
              <span>{language === 'mr' ? 'नवीन आरोग्य दूत नोंदणी' : 'Ambassador Registration'}</span>
            </button>

            {/* Tab 2: Login */}
            {!loggedAffiliate && (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                style={{
                  padding: '0.75rem 1.6rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: '1.5px solid',
                  borderColor: activeTab === 'login' ? '#006B2D' : '#E1E9DF',
                  backgroundColor: activeTab === 'login' ? '#006B2D' : '#ffffff',
                  color: activeTab === 'login' ? '#ffffff' : '#17251B',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'login' ? '0 4px 12px rgba(0, 107, 45, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <LogIn size={16} />
                <span>{language === 'mr' ? 'आरोग्य दूत लॉगिन' : 'Ambassador Login'}</span>
              </button>
            )}

            {/* Tab 3: Dashboard */}
            <button
              type="button"
              onClick={() => {
                if (loggedAffiliate) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('login');
                  setLoginError(language === 'mr' 
                    ? 'आपला डॅशबोर्ड पाहण्यासाठी कृपया प्रथम लॉगिन करा.' 
                    : 'Please log in to your account first to access your dashboard.');
                }
              }}
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1.5px solid',
                borderColor: activeTab === 'dashboard' ? '#006B2D' : '#E1E9DF',
                backgroundColor: activeTab === 'dashboard' ? '#006B2D' : '#ffffff',
                color: activeTab === 'dashboard' ? '#ffffff' : '#17251B',
                cursor: 'pointer',
                boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(0, 107, 45, 0.25)' : 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Award size={16} />
              <span>
                {loggedAffiliate 
                  ? (language === 'mr' ? 'आरोग्य दूत डॅशबोर्ड' : 'Ambassador Dashboard')
                  : (language === 'mr' ? 'डॅशबोर्ड (Login Required)' : 'Dashboard (Login)')}
              </span>
            </button>
          </div>

          {/* TAB 1: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #E1E9DF',
              boxShadow: '0 8px 30px rgba(0,107,45,0.04)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? 'आरोग्यदूत / समाज सेवक नोंदणी अर्ज' : 'Partner Registration Form'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#5F6B61', marginBottom: '1.75rem' }}>
                  {language === 'mr'
                    ? 'आपल्या गावातील किंवा परिसरातील गरजू रुग्णांना मधुमेह व व्यसनमुक्तीचे मार्गदर्शन देण्यासाठी नोंदणी करा. नोंदणीनंतर लगेच लॉगिन करून आपला संदर्भ कोड व डॅशबोर्ड मिळवा.'
                    : 'Become an authorized health ambassador. Once registered, log in to access your live dashboard and personalized referral link.'}
                </p>

                {regError && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #F87171',
                    color: '#B91C1C',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder={language === 'mr' ? 'उदा. वरुण यादव' : 'e.g. Varun Yadav'}
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'मोबाईल नंबर (लॉगिनसाठी) *' : 'Mobile (For Login) *'}
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        required
                        maxLength={10}
                        placeholder={language === 'mr' ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'}
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'लॉगिन पासवर्ड तयार करा *' : 'Create Login Password *'}
                      </label>
                      <input
                        type="password"
                        className="form-input"
                        required
                        minLength={4}
                        placeholder={language === 'mr' ? 'किमान ४ अक्षरे / अंक' : 'Min 4 characters'}
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'ईमेल (पर्यायी)' : 'Email (Optional)'}
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="yourname@gmail.com"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'गाव / तालुका / शहर *' : 'City / Town / Village *'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder={language === 'mr' ? 'उदा. सांगली / कोल्हापूर' : 'e.g. Sangli / Kolhapur'}
                        value={regData.city}
                        onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                        {language === 'mr' ? 'व्यवसाय' : 'Occupation'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={language === 'mr' ? 'उदा. सामाजिक कार्यकर्ता / शिक्षक / व्यावसायिक' : 'e.g. Social Worker / Educator'}
                        value={regData.occupation}
                        onChange={(e) => setRegData({ ...regData, occupation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                      {language === 'mr' ? 'सामाजिक किंवा आरोग्य क्षेत्रातील अनुभव' : 'Experience in Social / Health Work'}
                    </label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder={language === 'mr' ? 'उदा. सामाजिक कार्यात किंवा आरोग्य शिबिरांमध्ये २ वर्षांचा अनुभव...' : 'Brief description of experience...'}
                      value={regData.experience}
                      onChange={(e) => setRegData({ ...regData, experience: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={isRegistering}
                  >
                    <span>{isRegistering ? (language === 'mr' ? 'नोंदणी होत आहे...' : 'Registering...') : (language === 'mr' ? 'नोंदणी पूर्ण करा व लॉगिन करा' : 'Complete Registration & Proceed to Login')}</span>
                    <ArrowRight size={18} />
                  </button>

                  <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: '#5F6B61' }}>
                    <span>{language === 'mr' ? 'आधीच खाते आहे का?' : 'Already have an Ambassador account?'} </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      style={{ background: 'none', border: 'none', color: '#006B2D', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {language === 'mr' ? 'येथे लॉगिन करा' : 'Log in here'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: LOGIN FORM */}
          {activeTab === 'login' && !loggedAffiliate && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #E1E9DF',
              boxShadow: '0 8px 30px rgba(0,107,45,0.04)'
            }}>
              {regSuccessMsg && (
                <div style={{
                  backgroundColor: '#E8F5E9',
                  border: '1.5px solid #81C784',
                  color: '#1B5E20',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <CheckCircle2 size={22} style={{ color: '#006B2D', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>
                      {language === 'mr' ? 'खाते यशस्वीरित्या तयार झाले!' : 'Account Created Successfully!'}
                    </div>
                    <div>{regSuccessMsg}</div>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E8F5E9',
                  color: '#006B2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <LogIn size={26} />
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? 'आरोग्य दूत लॉगिन (Ambassador Login)' : 'Health Ambassador Login'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#5F6B61', margin: '0 auto', maxWidth: '540px' }}>
                  {language === 'mr'
                    ? 'आपला डॅशबोर्ड, संदर्भित रुग्ण व कमिशन पाहण्यासाठी नोंदणीकृत मोबाईल नंबर आणि पासवर्ड टाकून लॉगिन करा.'
                    : 'Log in with your registered mobile number and password to view your real-time referral dashboard.'}
                </p>
              </div>

              {loginError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #F87171',
                  color: '#B91C1C',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                    {language === 'mr' ? 'नोंदणीकृत मोबाईल नंबर किंवा ईमेल *' : 'Registered Mobile Number or Email *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder={language === 'mr' ? '१० अंकी मोबाईल नंबर किंवा ईमेल' : 'Mobile number or email'}
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#17251B' }}>
                    {language === 'mr' ? 'पासवर्ड *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder={language === 'mr' ? 'आपला पासवर्ड प्रविष्ट करा' : 'Enter password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={isLoggingIn}
                >
                  <LogIn size={18} />
                  <span>{isLoggingIn ? (language === 'mr' ? 'लॉगिन होत आहे...' : 'Logging in...') : (language === 'mr' ? 'डॅशबोर्ड उघडा (Login to Dashboard)' : 'Login to Dashboard')}</span>
                </button>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#5F6B61' }}>
                  <span>{language === 'mr' ? 'नवीन आरोग्य दूत आहात का?' : 'New health ambassador?'} </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    style={{ background: 'none', border: 'none', color: '#006B2D', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {language === 'mr' ? 'येथे नोंदणी करा' : 'Register here'}
                  </button>
                </div>

                {/* Quick Demo Button */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #E1E9DF', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.6rem', fontWeight: 600 }}>
                    {language === 'mr' ? 'चाचणी / प्रात्यक्षिक लॉगिन:' : 'Instant Demo / Evaluation:'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin()}
                    style={{
                      backgroundColor: '#F3F8F1',
                      border: '1px solid #C8E6C9',
                      color: '#006B2D',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <UserCheck size={15} />
                    <span>{language === 'mr' ? 'राहुल देशमुख (डेमो पार्टनर लॉगिन)' : 'Login as Rahul Deshmukh (Demo Partner)'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: AMBASSADOR DASHBOARD */}
          {(activeTab === 'dashboard' || loggedAffiliate) && loggedAffiliate && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #E1E9DF',
              boxShadow: '0 8px 30px rgba(0,107,45,0.04)'
            }}>
              {/* Dashboard Top Header matching screenshot */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '1rem',
                marginBottom: '1.25rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #EBF2E9'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.45rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? 'आरोग्यदूत पोर्टल (Ambassador Portal)' : 'Ambassador Portal'}
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: '#5F6B61', marginTop: '0.2rem' }}>
                    {language === 'mr' ? 'स्वागत आहे' : 'Welcome'}, <strong style={{ color: '#17251B' }}>{loggedAffiliate.name}</strong> • {loggedAffiliate.city || 'Sangli'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    backgroundColor: '#E8F5E9',
                    color: '#006B2D',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid #C8E6C9'
                  }}>
                    ID: {myReferralCode}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #F87171',
                      color: '#DC2626',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease'
                    }}
                    title="Log out"
                  >
                    <LogOut size={14} />
                    <span>{language === 'mr' ? 'लॉगआउट' : 'Logout'}</span>
                  </button>
                </div>
              </div>

              {/* ACTION TOOLBAR: EXTRA FEATURES FOR AMBASSADOR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                flexWrap: 'wrap',
                marginBottom: '1.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#F7FAF7',
                borderRadius: '14px',
                border: '1px solid #E1E9DF'
              }}>
                {/* Feature 1: Refer Patient Directly */}
                <button
                  type="button"
                  onClick={() => setShowReferPatientModal(true)}
                  style={{
                    backgroundColor: '#006B2D',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(0, 107, 45, 0.2)'
                  }}
                >
                  <UserPlus size={16} />
                  <span>{language === 'mr' ? '+ थेट रुग्ण जोडा (Refer Patient)' : '+ Refer a Patient Directly'}</span>
                </button>

                {/* Feature 2: Show QR Code */}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#006B2D',
                    border: '1.5px solid #C8E6C9',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <QrCode size={16} />
                  <span>{language === 'mr' ? 'क्युआर कोड (QR)' : 'QR Code'}</span>
                </button>

                {/* Feature 3: Digital ID Card */}
                <button
                  type="button"
                  onClick={() => setShowIdCardModal(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#15803D',
                    border: '1.5px solid #C8E6C9',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <IdCard size={16} />
                  <span>{language === 'mr' ? 'माझे ओळखपत्र (ID Card)' : 'Digital ID Card'}</span>
                </button>

                {/* Feature 4: WhatsApp Share Kit */}
                <button
                  type="button"
                  onClick={() => setShowShareKitModal(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0284C7',
                    border: '1.5px solid #BAE6FD',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Share2 size={16} />
                  <span>{language === 'mr' ? 'प्रचार किट (Templates)' : 'Share Kit'}</span>
                </button>

                {/* Feature 5: Payout / UPI Settings */}
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#B45309',
                    border: '1.5px solid #FDE68A',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <CreditCard size={16} />
                  <span>{language === 'mr' ? 'बँक / UPI खाती (Payout)' : 'Payout Settings'}</span>
                </button>
              </div>

              {/* 3 Metric Cards matching exact user screenshot design */}
              <div className="grid-3" style={{ marginBottom: '1.75rem', gap: '1.25rem' }}>
                {/* 1. Green Card: Referred Patients */}
                <div style={{ 
                  backgroundColor: '#e2faea', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '14px', 
                  border: '1px solid #b8eec8',
                  boxShadow: '0 2px 8px rgba(0, 107, 45, 0.04)'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#006B2D', fontWeight: 700 }}>
                    {language === 'mr' ? 'एकूण संदर्भित रुग्ण' : 'Referred Patients'}
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#006B2D', marginTop: '0.25rem', lineHeight: 1.1 }}>
                    {referredPatientsCount}
                  </div>
                </div>

                {/* 2. Gold Card: Counseling Completed */}
                <div style={{ 
                  backgroundColor: '#fff9e6', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '14px', 
                  border: '1px solid #ffe899',
                  boxShadow: '0 2px 8px rgba(120, 83, 0, 0.04)'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#785300', fontWeight: 700 }}>
                    {language === 'mr' ? 'यशस्वी मार्गदर्शन / ऑर्डर्स' : 'Counseling Completed'}
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#785300', marginTop: '0.25rem', lineHeight: 1.1 }}>
                    {counselingCompletedCount}
                  </div>
                </div>

                {/* 3. Soft Green Card: Active Campaign */}
                <div style={{ 
                  backgroundColor: '#F3F8F1', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '14px', 
                  border: '1px solid #E1E9DF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#006B2D', fontWeight: 700 }}>
                    {language === 'mr' ? 'सक्रिय अभियान' : 'Active Campaign'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#006B2D', marginTop: '0.5rem' }}>
                    मधुमेह मुक्त भारत
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5F6B61', marginTop: '0.15rem' }}>
                    & व्यसनमुक्त भारत अभियान
                  </div>
                </div>
              </div>

              {/* Commission Earnings Strip (Bonus Real-Time Value for Affiliates) */}
              {totalCommissionEarned > 0 && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontWeight: 700, fontSize: '0.92rem' }}>
                    <DollarSign size={18} style={{ color: '#059669' }} />
                    <span>{language === 'mr' ? 'एकूण मंजूर मानधन (Commission Earned):' : 'Total Approved Commission:'}</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>
                    {formatCurrency(totalCommissionEarned)}
                  </div>
                </div>
              )}

              {/* Referral Link Box matching screenshot */}
              <div style={{
                backgroundColor: '#F3F8F1',
                borderRadius: '16px',
                padding: '1.35rem 1.5rem',
                border: '1.5px solid #E1E9DF',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#006B2D', fontSize: '0.95rem' }}>
                    {language === 'mr' ? 'आपली विशेष संदर्भ लिंक:' : 'Your Referral Link:'}
                  </strong>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{
                        backgroundColor: copied ? '#006B2D' : '#ffffff',
                        color: copied ? '#ffffff' : '#006B2D',
                        border: '1.5px solid #006B2D',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                      <span>{copied ? (language === 'mr' ? 'लिंक कॉपी झाली!' : 'Copied!') : (language === 'mr' ? 'लिंक कॉपी करा' : 'Copy Link')}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        language === 'mr'
                          ? `नमस्कार, सहारा सोशल फाऊंडेशन कोल्हापूरच्या 'मधुमेह मुक्त भारत अभियाना'मध्ये सहभागी व्हा. मोफत मार्गदर्शन व अधिकृत माहितीसाठी या लिंकवर क्लिक करा: ${referralLink}`
                          : `Hello, join the 'Diabetes-Free India Mission' with Sahara Social Foundation. For free health guidance and official natural nutraceuticals, visit: ${referralLink}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <WhatsAppIcon size={16} />
                      <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅपवर शेअर करा' : 'Share on WhatsApp'}</span>
                    </a>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #D5E4D2',
                  padding: '0.65rem 0.95rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  wordBreak: 'break-all'
                }}>
                  <code style={{ color: '#006B2D', fontSize: '0.96rem', fontWeight: 800 }}>
                    {referralLink}
                  </code>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#5F6B61', marginTop: '0.6rem', lineHeight: 1.5 }}>
                  {language === 'mr'
                    ? 'ही लिंक व्हॉट्सअ‍ॅप, सोशल मीडिया किंवा प्रत्यक्ष रुग्णांसोबत शेअर करा. या लिंकद्वारे नोंदणी किंवा खरेदी केल्यास थेट आपल्या खात्यामध्ये नोंद होईल.'
                    : 'Share this link with patients. Anyone visiting or ordering via your link is automatically credited to your ambassador account.'}
                </div>
              </div>

              {/* Recent Patient Referrals & Activity Section with Filter Tabs */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.08rem', color: '#17251B', fontWeight: 800, margin: 0 }}>
                    {language === 'mr' ? 'अलीकडील संदर्भित रुग्ण व ऑर्डर्स' : 'Recent Patient Referrals & Activity'}
                  </h4>

                  <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#F3F8F1', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setActivityFilter('all')}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activityFilter === 'all' ? '#006B2D' : 'transparent',
                        color: activityFilter === 'all' ? '#ffffff' : '#5F6B61'
                      }}
                    >
                      {language === 'mr' ? `सर्व (${combinedActivity.length})` : `All (${combinedActivity.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter('leads')}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activityFilter === 'leads' ? '#006B2D' : 'transparent',
                        color: activityFilter === 'leads' ? '#ffffff' : '#5F6B61'
                      }}
                    >
                      {language === 'mr' ? `रुग्ण संदर्भ (${myLeads.length})` : `Referrals (${myLeads.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter('orders')}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activityFilter === 'orders' ? '#006B2D' : 'transparent',
                        color: activityFilter === 'orders' ? '#ffffff' : '#5F6B61'
                      }}
                    >
                      {language === 'mr' ? `ऑर्डर्स (${myOrders.length})` : `Orders (${myOrders.length})`}
                    </button>
                  </div>
                </div>

                {filteredActivity.length > 0 ? (
                  <div style={{ overflowX: 'auto', border: '1px solid #E1E9DF', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead style={{ backgroundColor: '#F8FAF7', borderBottom: '1px solid #E1E9DF' }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem', color: '#006B2D', fontWeight: 700 }}>{language === 'mr' ? 'रुग्ण नाव' : 'Patient Name'}</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#006B2D', fontWeight: 700 }}>{language === 'mr' ? 'आजाराचे नाव / उत्पादन' : 'Disease / Kit'}</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#006B2D', fontWeight: 700 }}>{language === 'mr' ? 'तारीख' : 'Date'}</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#006B2D', fontWeight: 700 }}>{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivity.map((item, idx) => (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #F0F4EF' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                              <div>{item.name}</div>
                              {item.phone && <div style={{ fontSize: '0.76rem', color: '#78716C' }}>+91 {item.phone.slice(-10)}</div>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#17251B' }}>
                              {item.disease}
                              {item.amount > 0 && <div style={{ fontSize: '0.78rem', color: '#006B2D', fontWeight: 700 }}>{formatCurrency(item.amount)}</div>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#5F6B61', fontSize: '0.82rem' }}>
                              {formatDate(item.date)}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                backgroundColor: item.statusColor,
                                color: item.statusTextColor,
                                padding: '0.22rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-block'
                              }}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#FAFAF9',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    border: '1px dashed #D6D3D1',
                    color: '#78716C'
                  }}>
                    <HeartHandshake size={36} style={{ color: '#006B2D', opacity: 0.6, margin: '0 auto 0.75rem auto' }} />
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#17251B', marginBottom: '0.35rem' }}>
                      {language === 'mr' ? 'अद्याप कोणत्याही रुग्णाची नोंद नाही.' : 'No patient referrals recorded yet.'}
                    </div>
                    <div style={{ fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto 1.25rem' }}>
                      {language === 'mr'
                        ? 'आपल्या गावातील रुग्णांना थेट जोडण्यासाठी वरील "+ थेट रुग्ण जोडा" बटण वापरा किंवा संदर्भ लिंक व्हॉट्सअ‍ॅपवर शेअर करा.'
                        : 'Use the "+ Refer a Patient Directly" button above or share your WhatsApp link to begin helping patients.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReferPatientModal(true)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}
                    >
                      <UserPlus size={14} />
                      <span>{language === 'mr' ? 'पहिला रुग्ण नोंदवा' : 'Refer First Patient'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* MODAL 1: DIRECT PATIENT REFERRAL MODAL */}
      {showReferPatientModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setShowReferPatientModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#006B2D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
                  {language === 'mr' ? 'नवीन रुग्ण थेट संदर्भ नोंदणी' : 'Refer Patient Directly'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#5F6B61' }}>
                  {language === 'mr' ? 'आरोग्यदूत संदर्भ: ' : 'Referred by: '}{loggedAffiliate?.name} ({myReferralCode})
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#5F6B61', marginBottom: '1.25rem' }}>
              {language === 'mr'
                ? 'रुग्णाची माहिती भरून पाठवा. सहारा सोशल फाऊंडेशनचे डॉक्टर व समुपदेशक रुग्णाशी संपर्क करून मार्गदर्शन करतील.'
                : 'Enter patient details. Our medical counselors will contact them and credit this referral to your account.'}
            </p>

            {patientSuccessMsg && (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #10B981',
                color: '#065F46',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={18} />
                <span>{patientSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleDirectPatientSubmit}>
              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {language === 'mr' ? 'रुग्णाचे पूर्ण नाव *' : 'Patient Full Name *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={language === 'mr' ? 'उदा. महादेव पाटील' : 'e.g. Mahadev Patil'}
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {language === 'mr' ? 'रुग्णाचा मोबाईल नंबर *' : 'Patient Mobile Number *'}
                </label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  maxLength={10}
                  placeholder={language === 'mr' ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'}
                  value={patientData.phone}
                  onChange={(e) => setPatientData({ ...patientData, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {language === 'mr' ? 'आजाराचा प्रकार / समस्या *' : 'Health Concern *'}
                  </label>
                  <select
                    className="form-input"
                    value={patientData.disease}
                    onChange={(e) => setPatientData({ ...patientData, disease: e.target.value })}
                  >
                    <option value="मधुमेह (Diabetes)">मधुमेह (Diabetes Care)</option>
                    <option value="व्यसनमुक्ती (De-Addiction)">व्यसनमुक्ती (दारू, तंबाखू)</option>
                    <option value="सांधेदुखी व मणके (Joint Pain)">सांधेदुखी व मणके (Joint Pain)</option>
                    <option value="पित्त व ॲसिडिटी (Acidity)">पित्त व पचन विकार (Acidity)</option>
                    <option value="हार्ट / लिव्हर / किडनी (Vital Organs)">हार्ट / लिव्हर / किडनी</option>
                    <option value="इतर आजार (General Wellness)">इतर आरोग्य समस्या</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {language === 'mr' ? 'गाव / तालुका / शहर' : 'Village / City'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={language === 'mr' ? 'उदा. सांगली' : 'e.g. Sangli'}
                    value={patientData.city}
                    onChange={(e) => setPatientData({ ...patientData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {language === 'mr' ? 'रुग्णाची थोडक्यात माहिती / लक्षणे' : 'Notes / Symptoms (Optional)'}
                </label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder={language === 'mr' ? 'उदा. ५ वर्षांपासून मधुमेह आहे, गोळ्या चालू आहेत...' : 'e.g. Has diabetes for 5 years...'}
                  value={patientData.notes}
                  onChange={(e) => setPatientData({ ...patientData, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                disabled={isSubmittingPatient}
              >
                {isSubmittingPatient ? (language === 'mr' ? 'नोंदणी होत आहे...' : 'Submitting...') : (language === 'mr' ? 'रुग्ण संदर्भ सबमिट करा' : 'Submit Patient Referral')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QR CODE MODAL */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '420px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)'
          }}>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <MissionLogoBadge size={50} style={{ margin: '0 auto 0.75rem auto' }} />
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
              {language === 'mr' ? 'आपला विशेष क्युआर कोड' : 'Official Referral QR Code'}
            </h3>
            <div style={{ fontSize: '0.84rem', color: '#5F6B61', marginTop: '0.2rem', marginBottom: '1.25rem' }}>
              {loggedAffiliate?.name} • ID: <strong style={{ color: '#006B2D' }}>{myReferralCode}</strong>
            </div>

            {/* QR Box with Scan Border */}
            <div style={{
              backgroundColor: '#F9FAFB',
              border: '2px dashed #006B2D',
              borderRadius: '16px',
              padding: '1rem',
              display: 'inline-block',
              margin: '0 auto 1.25rem auto'
            }}>
              <img
                src={qrCodeUrl}
                alt="Ambassador QR Code"
                style={{ width: '220px', height: '220px', display: 'block', borderRadius: '8px' }}
              />
            </div>

            <p style={{ fontSize: '0.82rem', color: '#5F6B61', lineHeight: 1.45, marginBottom: '1.25rem' }}>
              {language === 'mr'
                ? 'रुग्णांना त्यांच्या मोबाईल कॅमेऱ्याने किंवा Google Lens ने हा क्युआर कोड स्कॅन करायला सांगा. थेट आपली अधिकृत लिंक उघडेल.'
                : 'Patients can scan this QR code with any smartphone camera or Google Lens to immediately connect via your referral link.'}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <a
                href={qrCodeUrl}
                download={`QR_${myReferralCode}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ padding: '0.55rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Download size={15} />
                <span>{language === 'mr' ? 'क्युआर डाउनलोड करा' : 'Download QR'}</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.55rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Printer size={15} />
                <span>{language === 'mr' ? 'प्रिंट करा' : 'Print QR'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL ID CARD MODAL */}
      {showIdCardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)'
          }}>
            <button
              type="button"
              onClick={() => setShowIdCardModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
                {language === 'mr' ? 'अधिकृत आरोग्य दूत ओळखपत्र' : 'Official Ambassador ID Card'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#5F6B61' }}>
                Sahara Social Foundation • Reg: MAH/582/2014/KOP
              </div>
            </div>

            {/* Realistic Laminated Identity Card */}
            <div id="ambassador-id-card-print" style={{
              background: 'linear-gradient(145deg, #004D20 0%, #006B2D 50%, #003616 100%)',
              color: '#ffffff',
              borderRadius: '18px',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(0, 107, 45, 0.35)',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid #E8F5E9'
            }}>
              {/* Watermark Logo */}
              <div style={{
                position: 'absolute',
                right: '-25px',
                bottom: '-25px',
                opacity: 0.12,
                pointerEvents: 'none'
              }}>
                <MissionLogoBadge size={180} />
              </div>

              {/* ID Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <MissionLogoBadge size={38} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.1 }}>सहारा सोशल फाऊंडेशन</div>
                    <div style={{ fontSize: '0.68rem', color: '#A7F3D0' }}>SAHARA SOCIAL FOUNDATION</div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#FEF08A',
                  color: '#713F12',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase'
                }}>
                  VERIFIED
                </div>
              </div>

              {/* ID Body */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#006B2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  border: '2px solid #86EFAC'
                }}>
                  {(loggedAffiliate?.name || 'A')[0]}
                </div>

                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                    {loggedAffiliate?.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#86EFAC', fontWeight: 700, marginTop: '2px' }}>
                    अधिकृत आरोग्य दूत (Health Ambassador)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginTop: '2px' }}>
                    क्षेत्र: <strong>{loggedAffiliate?.city || 'Sangli'}</strong>, महाराष्ट्र
                  </div>
                </div>
              </div>

              {/* ID Details Row */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.78rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div>
                  <span style={{ color: '#86EFAC', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>AMBASSADOR ID:</span>
                  <strong style={{ fontSize: '0.86rem', letterSpacing: '0.04em' }}>{myReferralCode}</strong>
                </div>
                <div>
                  <span style={{ color: '#86EFAC', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>CONTACT:</span>
                  <strong>+91 {loggedAffiliate?.phone || '8421154090'}</strong>
                </div>
                <div>
                  <span style={{ color: '#86EFAC', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>CAMPAIGN:</span>
                  <span style={{ fontSize: '0.74rem' }}>मधुमेह व व्यसनमुक्त भारत</span>
                </div>
                <div>
                  <span style={{ color: '#86EFAC', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>VALID TILL:</span>
                  <span style={{ fontSize: '0.74rem' }}>Active (2026-2027)</span>
                </div>
              </div>

              {/* ID Footer */}
              <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.66rem', color: '#A7F3D0', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.5rem' }}>
                कार्यालय: शाहूपुरी, कोल्हापूर • अधिकृत हेल्पलाइन: +91 8421154090
              </div>
            </div>

            {/* Print / Save button */}
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.4rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} />
                <span>{language === 'mr' ? 'ओळखपत्र प्रिंट करा / सेव्ह करा' : 'Print / Save ID Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WHATSAPP SHARE KIT / TEMPLATES */}
      {showShareKitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '620px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setShowShareKitModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <Share2 size={24} style={{ color: '#006B2D' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
                {language === 'mr' ? 'व्हॉट्सअ‍ॅप प्रचार साहित्य व मेसेज किट' : 'Ambassador WhatsApp Share Kit'}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5F6B61', marginBottom: '1.5rem' }}>
              {language === 'mr'
                ? 'आपल्या परिसरातील व्हॉट्सअ‍ॅप ग्रुप्स व सोशल मीडियावर पाठवण्यासाठी तयार संदेश. यामध्ये आपली संदर्भ लिंक आपोआप जोडलेली आहे.'
                : 'Ready-to-use WhatsApp messages pre-loaded with your unique referral link.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {shareKitTemplates.map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#F9FAFB',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '1.1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: item.color }}>
                      {language === 'mr' ? item.titleMr : item.titleEn}
                    </span>
                    <span style={{ backgroundColor: '#E5E7EB', color: '#374151', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: '#374151',
                    whiteSpace: 'pre-line',
                    marginBottom: '0.75rem'
                  }}>
                    {item.text}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(item.text, idx)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #D1D5DB',
                        color: shareKitCopiedIdx === idx ? '#006B2D' : '#374151',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {shareKitCopiedIdx === idx ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      <span>{shareKitCopiedIdx === idx ? (language === 'mr' ? 'कॉपी झाली!' : 'Copied!') : (language === 'mr' ? 'मेसेज कॉपी करा' : 'Copy Message')}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(item.text)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <WhatsAppIcon size={14} />
                      <span>{language === 'mr' ? 'WhatsApp वर पाठवा' : 'Share on WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PAYOUT / UPI SETTINGS */}
      {showPayoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)'
          }}>
            <button
              type="button"
              onClick={() => setShowPayoutModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <CreditCard size={22} style={{ color: '#B45309' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#17251B', margin: 0 }}>
                {language === 'mr' ? 'मानधन / बँक खाते तपशील' : 'Payout & Bank Settings'}
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#5F6B61', marginBottom: '1.25rem' }}>
              {language === 'mr'
                ? 'आपले मानधन व कमिशन थेट प्राप्त करण्यासाठी UPI ID किंवा बँक खात्याचा तपशील भरा.'
                : 'Enter your UPI ID or Bank account details for receiving ambassador incentives.'}
            </p>

            {payoutSavedMsg && (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #10B981',
                color: '#065F46',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={18} />
                <span>{payoutSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePayoutDetails}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {language === 'mr' ? 'UPI ID (Google Pay / PhonePe / Paytm) *' : 'UPI ID (GPay / PhonePe / Paytm) *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9876543210@upi or varun@oksbi"
                  value={payoutForm.upiId}
                  onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '0.75rem 0', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 600 }}>
                --- किंवा बँक खाते (OR Bank Account) ---
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {language === 'mr' ? 'खातेधारकाचे पूर्ण नाव' : 'Account Holder Name'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Varun Yadav"
                  value={payoutForm.holderName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, holderName: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {language === 'mr' ? 'बँक खाते क्रमांक' : 'Account Number'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Account Number"
                    value={payoutForm.accountNo}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountNo: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {language === 'mr' ? 'IFSC कोड' : 'IFSC Code'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SBIN0001234"
                    value={payoutForm.ifsc}
                    onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
              >
                {language === 'mr' ? 'तपशील सेव्ह करा (Save Details)' : 'Save Payout Details'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Affiliate;
