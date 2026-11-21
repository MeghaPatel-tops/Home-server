const { PayoutRequest, ProviderLedgerEntry, Provider } = require('../models');
const { BadRequestError, NotFoundError } = require('../core/errors');
const { PAYOUT_STATUS, LEDGER_ENTRY_TYPE } = require('../core/constants');
const config = require('../config/env');

class PayoutService {
  async getProviderLedgerAndBalance(providerId) {
    const provider = await Provider.findById(providerId);
    if (!provider) throw new NotFoundError('Provider not found');

    const ledger = await ProviderLedgerEntry.find({ providerId })
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 });

    const payouts = await PayoutRequest.find({ providerId }).sort({ createdAt: -1 });

    return {
      wallet_balance_paise: provider.walletBalancePaise,
      ledger_entries: ledger,
      payout_requests: payouts,
    };
  }

  async requestPayout(providerId, amountPaise) {
    if (amountPaise < config.MINIMUM_PAYOUT_PAISE) {
      throw new BadRequestError(`Minimum payout amount is ₹${config.MINIMUM_PAYOUT_PAISE / 100}`);
    }

    const provider = await Provider.findById(providerId);
    if (!provider) throw new NotFoundError('Provider not found');

    if (provider.walletBalancePaise < amountPaise) {
      throw new BadRequestError('Insufficient wallet balance');
    }

    if (!provider.bankDetails?.accountNumberMasked || !provider.bankDetails?.ifscCode) {
      // Default placeholder if not set
      provider.bankDetails = {
        accountNumberMasked: 'XXXX-XXXX-8921',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
      };
    }

    // Deduct and hold balance
    provider.walletBalancePaise -= amountPaise;
    await provider.save();

    const payout = await PayoutRequest.create({
      providerId,
      amountPaise,
      payoutStatus: PAYOUT_STATUS.PENDING,
      accountNumberMasked: provider.bankDetails.accountNumberMasked,
      ifscCode: provider.bankDetails.ifscCode,
    });

    await ProviderLedgerEntry.create({
      providerId,
      entryType: LEDGER_ENTRY_TYPE.PAYOUT_DEBIT,
      amountPaise: -amountPaise,
      balanceAfterPaise: provider.walletBalancePaise,
      description: `Payout request #${payout._id} submitted`,
    });

    return payout;
  }

  async getAllPayouts() {
    return PayoutRequest.find()
      .populate('providerId', 'businessName bankDetails')
      .sort({ createdAt: -1 });
  }

  async processPayout(payoutId, bankReferenceUtr) {
    const payout = await PayoutRequest.findById(payoutId);
    if (!payout) throw new NotFoundError('Payout request not found');

    payout.payoutStatus = PAYOUT_STATUS.PROCESSED;
    payout.bankReferenceUtr = bankReferenceUtr;
    payout.processedAt = new Date();
    await payout.save();

    return payout;
  }

  async rejectPayout(payoutId, adminNotes) {
    const payout = await PayoutRequest.findById(payoutId);
    if (!payout) throw new NotFoundError('Payout request not found');

    payout.payoutStatus = PAYOUT_STATUS.REJECTED;
    payout.adminNotes = adminNotes;
    await payout.save();

    // Refund back to provider wallet
    const provider = await Provider.findById(payout.providerId);
    if (provider) {
      provider.walletBalancePaise += payout.amountPaise;
      await provider.save();

      await ProviderLedgerEntry.create({
        providerId: provider._id,
        entryType: LEDGER_ENTRY_TYPE.REVERSAL_CREDIT,
        amountPaise: payout.amountPaise,
        balanceAfterPaise: provider.walletBalancePaise,
        description: `Refund for rejected payout #${payout._id}`,
      });
    }

    return payout;
  }
}

module.exports = new PayoutService();
