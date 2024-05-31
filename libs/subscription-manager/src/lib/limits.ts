const BASE_PLAN = {
  LINKS_COUNT: 5,
  TRACKED_CLICKS: 250,
  FEATURES: {
    UTM_BUILDER: true,
    PASSWORD_PROTECTION: false,
    QR_CODES: false,
    CUSTOM_SHORT_KEY: false,
  },
};

const PRO_PLAN = {
  ...BASE_PLAN,
  LINKS_COUNT: 500,
  TRACKED_CLICKS: 20000,
  FEATURES: {
    ...BASE_PLAN.FEATURES,
    PASSWORD_PROTECTION: true,
    QR_CODES: true,
  },
  MONTHLY_PRICE: 9,
  YEARLY_PRICE: 90,
};

const BUSINESS_PLAN = {
  ...PRO_PLAN,
  LINKS_COUNT: 2000,
  TRACKED_CLICKS: 100000,
  FEATURES: {
    ...PRO_PLAN.FEATURES,
    CUSTOM_SHORT_KEY: true,
  },
  MONTHLY_PRICE: 30,
  YEARLY_PRICE: 300,
};

export const PLAN_LEVELS = {
  FREE: BASE_PLAN,
  PRO: PRO_PLAN,
  BUSINESS: BUSINESS_PLAN,
};
