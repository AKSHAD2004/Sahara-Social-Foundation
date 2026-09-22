// Utility formatters for Samarth Kolhapur / Sahara Social Foundation CRM

export const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return d.toLocaleDateString('en-IN', options);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'active':
    case 'completed':
    case 'delivered':
    case 'paid':
    case 'approved':
    case 'converted':
    case 'resolved':
      return 'badge-success';

    case 'new':
    case 'open':
    case 'interested':
    case 'in progress':
    case 'processing':
    case 'packed':
    case 'shipped':
    case 'contacted':
      return 'badge-info';

    case 'pending':
    case 'pending approval':
    case 'waiting for customer':
    case 'order pending':
    case 'partially paid':
    case 'rescheduled':
      return 'badge-warning';

    case 'cancelled':
    case 'lost':
    case 'rejected':
    case 'not interested':
    case 'failed':
    case 'refunded':
    case 'reversed':
    case 'blocked':
    case 'suspended':
    case 'missed':
      return 'badge-danger';

    default:
      return 'badge-neutral';
  }
};
