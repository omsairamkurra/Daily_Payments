-- OSRK Payments - Complete Database Migration
-- Run these statements in Supabase SQL Editor

-- =============================================
-- EXISTING MIGRATIONS (already applied)
-- =============================================

-- Investment table: add frequency, SIP fields, goal link
ALTER TABLE investments
  ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS is_sip BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sip_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS next_sip_date DATE,
  ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL;

-- Recurring payments: add goal link and reminder tracking
ALTER TABLE recurring_payments
  ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;

-- =============================================
-- NEW TABLES
-- =============================================

-- User settings (extended)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  notification_email TEXT,
  currency TEXT DEFAULT 'INR',
  locale TEXT DEFAULT 'en-IN',
  theme TEXT DEFAULT 'light',
  monthly_budget_alert_threshold INTEGER DEFAULT 80,
  spending_alert_enabled BOOLEAN DEFAULT true,
  weekly_summary_enabled BOOLEAN DEFAULT false,
  display_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own settings" ON user_settings;
CREATE POLICY "Users manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- If user_settings already exists, add new columns
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-IN',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS monthly_budget_alert_threshold INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS spending_alert_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS weekly_summary_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';

-- Income entries
CREATE TABLE IF NOT EXISTS income_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  frequency TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own income entries" ON income_entries;
CREATE POLICY "Users manage own income entries" ON income_entries FOR ALL USING (auth.uid() = user_id);

-- Spending alerts
CREATE TABLE IF NOT EXISTS spending_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  related_category TEXT,
  related_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE spending_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own alerts" ON spending_alerts;
CREATE POLICY "Users manage own alerts" ON spending_alerts FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  category TEXT,
  provider TEXT,
  start_date DATE,
  next_renewal_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_used_date DATE,
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own subscriptions" ON subscriptions;
CREATE POLICY "Users manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Tax deductions
CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  financial_year TEXT NOT NULL,
  section TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  proof_note TEXT,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tax deductions" ON tax_deductions;
CREATE POLICY "Users manage own tax deductions" ON tax_deductions FOR ALL USING (auth.uid() = user_id);

-- Goal milestones
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE NOT NULL,
  milestone_type INTEGER NOT NULL CHECK (milestone_type IN (25, 50, 75, 100)),
  achieved_at TIMESTAMPTZ DEFAULT now(),
  is_celebrated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, milestone_type)
);
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own milestones" ON goal_milestones;
CREATE POLICY "Users manage own milestones" ON goal_milestones FOR ALL USING (auth.uid() = user_id);

-- Spending insights
CREATE TABLE IF NOT EXISTS spending_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  period TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE spending_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own insights" ON spending_insights;
CREATE POLICY "Users manage own insights" ON spending_insights FOR ALL USING (auth.uid() = user_id);

-- Net worth snapshots
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  total_assets NUMERIC NOT NULL DEFAULT 0,
  total_liabilities NUMERIC NOT NULL DEFAULT 0,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own net worth snapshots" ON net_worth_snapshots;
CREATE POLICY "Users manage own net worth snapshots" ON net_worth_snapshots FOR ALL USING (auth.uid() = user_id);

-- Manual assets (real estate, vehicles, jewelry, etc.)
CREATE TABLE IF NOT EXISTS manual_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE manual_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own manual assets" ON manual_assets;
CREATE POLICY "Users manage own manual assets" ON manual_assets FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_income_entries_user_date ON income_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_unread ON spending_alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_user_fy ON tax_deductions(user_id, financial_year);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_spending_insights_user ON spending_insights(user_id, is_dismissed);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user ON net_worth_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_manual_assets_user ON manual_assets(user_id);
