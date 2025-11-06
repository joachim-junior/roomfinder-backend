const { prisma } = require("./database");

class SettingsService {
  constructor() {
    this.DEFAULT_HOLDING_DAYS = 3;
    this.KEY_PAYOUT_HOLDING_DAYS = "PAYOUT_HOLDING_DAYS";
  }

  async getPayoutHoldingDays() {
    try {
      const row = await prisma.appSetting.findUnique({
        where: { key: this.KEY_PAYOUT_HOLDING_DAYS },
      });
      if (!row) return this.DEFAULT_HOLDING_DAYS;
      const n = parseInt(row.value, 10);
      return Number.isFinite(n) && n > 0 ? n : this.DEFAULT_HOLDING_DAYS;
    } catch (e) {
      return this.DEFAULT_HOLDING_DAYS;
    }
  }

  async setPayoutHoldingDays(days) {
    const n = parseInt(days, 10);
    if (!Number.isFinite(n) || n < 0 || n > 60) {
      throw new Error("Invalid holding days. Use 0-60.");
    }
    const value = String(n);
    return prisma.appSetting.upsert({
      where: { key: this.KEY_PAYOUT_HOLDING_DAYS },
      create: { key: this.KEY_PAYOUT_HOLDING_DAYS, value },
      update: { value },
    });
  }
}

module.exports = new SettingsService();
