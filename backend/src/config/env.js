require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  APP_ORIGIN: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:8000'),

  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/homeserve'),

  JWT_ACCESS_SECRET: z.string().min(16).default('homeserve_jwt_access_secret_super_secure_key_12345'),
  JWT_REFRESH_SECRET: z.string().min(16).default('homeserve_jwt_refresh_secret_super_secure_key_67890'),
  ACCESS_TOKEN_EXPIRE: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRE_DAYS: z.string().transform(Number).default('7'),

  OTP_HMAC_SECRET: z.string().min(16).default('homeserve_otp_hmac_secret_key_abcdef_98765'),
  OTP_EXPIRE_MINUTES: z.string().transform(Number).default('10'),
  OTP_RESEND_COOLDOWN_SECONDS: z.string().transform(Number).default('60'),
  OTP_MAX_ATTEMPTS: z.string().transform(Number).default('3'),
  OTP_LOCKOUT_MINUTES: z.string().transform(Number).default('15'),

  RAZORPAY_KEY_ID: z.string().default('rzp_test_exampleKey123456'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_exampleSecret123456'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('webhook_secret_example123456'),

  STORAGE_BUCKET_NAME: z.string().default('homeserve-private'),
  STORAGE_REGION: z.string().default('ap-south-1'),

  DEFAULT_PLATFORM_COMMISSION_PERCENT: z.string().transform(Number).default('15'),
  GST_PERCENT: z.string().transform(Number).default('18'),
  MINIMUM_PAYOUT_PAISE: z.string().transform(Number).default('50000'),
  PROVIDER_ACCEPTANCE_SLA_MINUTES: z.string().transform(Number).default('15'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
