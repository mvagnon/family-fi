ALTER TABLE "space"
  ADD COLUMN "currency_code" TEXT NOT NULL DEFAULT 'EUR';

ALTER TABLE "space"
  ADD CONSTRAINT "space_currency_code_check"
  CHECK (
    "currency_code" IN (
      'EUR',
      'USD',
      'JPY',
      'GBP',
      'CHF',
      'CAD',
      'AUD',
      'NZD',
      'CNY',
      'HKD',
      'SGD',
      'KRW',
      'INR',
      'BRL',
      'MXN'
    )
  );
