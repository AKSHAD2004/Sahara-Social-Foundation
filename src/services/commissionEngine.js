// Configurable Slab-Based Commission Engine for Samarth Kolhapur / Sahara Social Foundation
import { validateCommissionSlabs } from '../utils/validators';

/**
 * Calculates commission for a given sales amount based on active slabs and calculation mode.
 * 
 * @param {number} salesAmount - The eligible sales value
 * @param {Array} slabs - Active commission slabs [{ id, name, minAmount, maxAmount, ratePercentage }]
 * @param {string} calculationType - 'flat' or 'progressive'
 * @param {number} referenceVolume - Total cumulative sales volume used to determine qualifying slab tier
 * @returns {Object} Calculation result with breakdown, applied rate/slabs, and total commission
 */
export function calculateCommission(salesAmount = 0, slabs = [], calculationType = 'flat', referenceVolume = 0) {
  const amount = Math.max(0, Number(salesAmount) || 0);
  const evalVolume = Math.max(amount, Number(referenceVolume) || 0);

  if (!Array.isArray(slabs) || slabs.length === 0 || amount === 0) {
    return {
      totalCommission: 0,
      appliedRate: 0,
      appliedSlabName: 'None',
      calculationType,
      breakdown: [],
      eligibleAmount: amount
    };
  }

  // Sort slabs by minAmount ascending
  const sortedSlabs = [...slabs].sort((a, b) => Number(a.minAmount) - Number(b.minAmount));

  if (calculationType === 'progressive') {
    // Progressive (tiered) calculation: portion by portion
    let remainingAmount = amount;
    let totalCommission = 0;
    const breakdown = [];

    for (const slab of sortedSlabs) {
      const min = Number(slab.minAmount);
      const max = slab.maxAmount !== null && slab.maxAmount !== undefined && slab.maxAmount !== ''
        ? Number(slab.maxAmount)
        : Infinity;
      const rate = Number(slab.ratePercentage) || 0;

      if (evalVolume >= min) {
        // Calculate amount falling in this tier
        const tierCapacity = max === Infinity ? remainingAmount : max - min;
        const amountInTier = Math.min(remainingAmount, tierCapacity > 0 ? tierCapacity : remainingAmount);

        if (amountInTier > 0) {
          const tierCommission = (amountInTier * rate) / 100;
          totalCommission += tierCommission;
          breakdown.push({
            slabId: slab.id,
            slabName: slab.name,
            minAmount: min,
            maxAmount: max,
            ratePercentage: rate,
            taxableInTier: amountInTier,
            tierCommission: Math.round(tierCommission * 100) / 100
          });
          remainingAmount -= amountInTier;
        }
      }

      if (remainingAmount <= 0) break;
    }

    // If progressive produced 0 but volume reached base slab
    if (totalCommission === 0 && sortedSlabs.length > 0 && evalVolume >= Number(sortedSlabs[0].minAmount)) {
      const baseRate = Number(sortedSlabs[0].ratePercentage) || 0;
      totalCommission = (amount * baseRate) / 100;
    }

    const effectiveRate = amount > 0 ? (totalCommission / amount) * 100 : 0;

    return {
      totalCommission: Math.round(totalCommission),
      appliedRate: Math.round(effectiveRate * 100) / 100,
      appliedSlabName: 'Progressive Tiered',
      calculationType: 'progressive',
      breakdown,
      eligibleAmount: amount
    };
  } else {
    // Flat Slab calculation: Whole amount multiplied by the single highest matching slab for the sales volume
    let applicableSlab = null;

    for (const slab of sortedSlabs) {
      const min = Number(slab.minAmount);
      const max = slab.maxAmount !== null && slab.maxAmount !== undefined && slab.maxAmount !== ''
        ? Number(slab.maxAmount)
        : Infinity;

      if (evalVolume >= min && (max === Infinity || evalVolume <= max)) {
        applicableSlab = slab;
        break;
      }
    }

    // If volume exceeded all maximums, assign highest slab
    if (!applicableSlab && sortedSlabs.length > 0) {
      if (evalVolume >= Number(sortedSlabs[0].minAmount)) {
        applicableSlab = sortedSlabs[sortedSlabs.length - 1];
      } else {
        applicableSlab = sortedSlabs[0];
      }
    }

    const rate = applicableSlab ? Number(applicableSlab.ratePercentage) : 0;
    const totalCommission = Math.round((amount * rate) / 100);

    return {
      totalCommission,
      appliedRate: rate,
      appliedSlabName: applicableSlab ? applicableSlab.name : 'Standard',
      calculationType: 'flat',
      breakdown: [
        {
          slabId: applicableSlab?.id,
          slabName: applicableSlab?.name,
          minAmount: applicableSlab?.minAmount,
          maxAmount: applicableSlab?.maxAmount,
          ratePercentage: rate,
          taxableInTier: amount,
          tierCommission: totalCommission
        }
      ],
      eligibleAmount: amount
    };
  }
}

/**
 * Checks whether an order meets commission generation criteria (Delivered & Paid or Paid depending on settings).
 */
export function isOrderCommissionEligible(order, settings = {}) {
  if (!order) return false;
  const orderStatus = (order.orderStatus || '').toLowerCase();
  const paymentStatus = (order.paymentStatus || '').toLowerCase();

  // Exclude cancelled or refunded orders
  if (orderStatus === 'cancelled' || paymentStatus === 'refunded') {
    return false;
  }

  const trigger = (typeof settings === 'object' && settings?.commissionTrigger) ? settings.commissionTrigger : 'paid';
  const isDelivered = orderStatus === 'delivered';
  const isPaid = paymentStatus === 'paid';

  if (trigger === 'delivered_paid') {
    return isDelivered && isPaid;
  }
  
  // By default, any paid order or delivered order generates commission
  return isPaid || isDelivered;
}

/**
 * Generates commission transaction payloads for an order, snapshotting rates and preserving history.
 */
export function buildCommissionTransactions(order, slabs = [], settings = {}, referenceVolume = 0) {
  const transactions = [];
  if (!isOrderCommissionEligible(order, settings)) return transactions;

  const eligibleAmount = Number(order.eligibleAmount !== undefined ? order.eligibleAmount : order.grandTotal || 0);
  const calculationType = typeof settings === 'string' ? settings : (settings?.commissionCalculationType || 'flat');

  // 1. Affiliate Commission
  if (order.assignedAffiliate) {
    const calc = calculateCommission(eligibleAmount, slabs, calculationType, referenceVolume);
    if (calc.totalCommission > 0 || calc.appliedRate > 0) {
      transactions.push({
        id: `ctx_aff_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        transactionId: `CTX-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        orderId: order.id,
        orderRef: order.orderId || order.id,
        beneficiaryType: 'affiliate',
        beneficiaryId: order.assignedAffiliate,
        beneficiaryName: order.affiliateName || 'Affiliate Partner',
        saleAmount: Number(order.grandTotal || 0),
        eligibleAmount: eligibleAmount,
        slabApplied: calc.appliedSlabName,
        slabRate: calc.appliedRate,
        commissionAmount: calc.totalCommission,
        calculationType: calc.calculationType,
        status: 'Pending Approval',
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date().toISOString(),
        payoutId: null
      });
    }
  }

  // 2. Sales Employee Commission
  if (order.assignedEmployee) {
    const calc = calculateCommission(eligibleAmount, slabs, calculationType, referenceVolume);
    if (calc.totalCommission > 0 || calc.appliedRate > 0) {
      transactions.push({
        id: `ctx_emp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        transactionId: `CTX-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        orderId: order.id,
        orderRef: order.orderId || order.id,
        beneficiaryType: 'employee',
        beneficiaryId: order.assignedEmployee,
        beneficiaryName: order.employeeName || 'Sales Employee',
        saleAmount: Number(order.grandTotal || 0),
        eligibleAmount: eligibleAmount,
        slabApplied: calc.appliedSlabName,
        slabRate: calc.appliedRate,
        commissionAmount: calc.totalCommission,
        calculationType: calc.calculationType,
        status: 'Pending Approval',
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date().toISOString(),
        payoutId: null
      });
    }
  }

  return transactions;
}

/**
 * Creates commission reversal transaction when an order is cancelled or refunded after delivery.
 */
export function buildCommissionReversal(originalTransaction, reason = 'Order Refunded/Cancelled') {
  return {
    id: `ctx_rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    transactionId: `REV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    orderId: originalTransaction.orderId,
    orderRef: originalTransaction.orderRef,
    beneficiaryType: originalTransaction.beneficiaryType,
    beneficiaryId: originalTransaction.beneficiaryId,
    beneficiaryName: originalTransaction.beneficiaryName,
    saleAmount: -Math.abs(originalTransaction.saleAmount),
    eligibleAmount: -Math.abs(originalTransaction.eligibleAmount),
    slabApplied: `Reversal (${originalTransaction.slabApplied})`,
    slabRate: originalTransaction.slabRate,
    commissionAmount: -Math.abs(originalTransaction.commissionAmount),
    calculationType: originalTransaction.calculationType,
    status: 'Reversed',
    approvedBy: 'System',
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    reversalReason: reason,
    originalTransactionId: originalTransaction.id,
    payoutId: null
  };
}
