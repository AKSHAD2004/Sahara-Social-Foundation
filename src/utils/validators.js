// Validators for Samarth Kolhapur CRM

export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = ('' + phone).replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
};

export const isValidUPI = (upi) => {
  if (!upi) return false;
  const re = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return re.test(upi.trim());
};

export const isValidPAN = (pan) => {
  if (!pan) return true; // optional
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan.trim().toUpperCase());
};

/**
 * Validates whether commission slab ranges are sorted, continuous, non-overlapping, and positive.
 * Slabs format: [{ id, name, minAmount, maxAmount, ratePercentage }]
 */
export const validateCommissionSlabs = (slabs = []) => {
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { valid: false, error: 'At least one commission slab is required.' };
  }

  // Sort by minAmount
  const sorted = [...slabs].sort((a, b) => Number(a.minAmount) - Number(b.minAmount));

  for (let i = 0; i < sorted.length; i++) {
    const min = Number(sorted[i].minAmount);
    const max = sorted[i].maxAmount === null || sorted[i].maxAmount === '' || sorted[i].maxAmount === undefined 
      ? Infinity 
      : Number(sorted[i].maxAmount);
    const rate = Number(sorted[i].ratePercentage);

    if (isNaN(min) || min < 0) {
      return { valid: false, error: `Slab #${i + 1} has an invalid minimum amount.` };
    }
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return { valid: false, error: `Slab #${i + 1} has an invalid percentage rate (0% - 100%).` };
    }
    if (max !== Infinity && max <= min) {
      return { valid: false, error: `Slab #${i + 1}: Max amount (${max}) must be greater than Min amount (${min}).` };
    }

    // Check overlap with next slab
    if (i < sorted.length - 1) {
      const nextMin = Number(sorted[i + 1].minAmount);
      if (max >= nextMin) {
        return {
          valid: false,
          error: `Overlap detected between Slab #${i + 1} (up to ${max}) and Slab #${i + 2} (starts at ${nextMin}).`
        };
      }
    }
  }

  return { valid: true, sortedSlabs: sorted };
};
