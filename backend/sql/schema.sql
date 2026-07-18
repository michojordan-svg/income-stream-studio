-- Income Autopilot — PostgreSQL schema
-- Run once: psql $DATABASE_URL -f sql/schema.sql

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username      VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preferences   JSONB DEFAULT '{}',
  api_keys      JSONB DEFAULT '{}'
);

-- Content Library
CREATE TABLE IF NOT EXISTS content_library (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type        VARCHAR(50)  NOT NULL,
  niche               VARCHAR(100) NOT NULL,
  title               VARCHAR(500) NOT NULL,
  description         TEXT,
  image_url           VARCHAR(1000),
  video_url           VARCHAR(1000),
  script_text         TEXT,
  status              VARCHAR(50)  NOT NULL DEFAULT 'draft',
  scheduled_dates     TIMESTAMP[],
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at        TIMESTAMP,
  tags                TEXT[],
  performance_metrics JSONB DEFAULT '{"views":0,"clicks":0,"conversions":0,"revenue":0}',
  affiliate_link      VARCHAR(1000)
);

-- Affiliate Links
CREATE TABLE IF NOT EXISTS affiliate_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url      VARCHAR(2000) NOT NULL,
  shortened_url     VARCHAR(500)  NOT NULL,
  shortener_service VARCHAR(50),
  niche             VARCHAR(100)  NOT NULL,
  product_name      VARCHAR(500)  NOT NULL,
  affiliate_network VARCHAR(100),
  commission_rate   DECIMAL(5,2)  NOT NULL DEFAULT 0,
  tracking_id       VARCHAR(500),
  clicks            INTEGER       DEFAULT 0,
  conversions       INTEGER       DEFAULT 0,
  revenue           DECIMAL(10,2) DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_click_at     TIMESTAMP,
  status            VARCHAR(50)   DEFAULT 'active',
  metadata          JSONB DEFAULT '{}'
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type       VARCHAR(100) NOT NULL,
  content_id       UUID REFERENCES content_library(id),
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  platform         VARCHAR(100),
  metric_value     DECIMAL(10,2),
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  event_date       DATE
);

-- Digital Products
CREATE TABLE IF NOT EXISTS digital_products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 VARCHAR(500)  NOT NULL,
  description          TEXT,
  price                DECIMAL(10,2) NOT NULL,
  niche                VARCHAR(100)  NOT NULL,
  product_type         VARCHAR(50),
  gumroad_product_id   VARCHAR(500),
  gumroad_url          VARCHAR(1000),
  file_url             VARCHAR(1000),
  thumbnail_url        VARCHAR(1000),
  sales_count          INTEGER       DEFAULT 0,
  revenue              DECIMAL(10,2) DEFAULT 0,
  promotion_content_ids UUID[],
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status               VARCHAR(50) DEFAULT 'draft',
  metadata             JSONB DEFAULT '{}'
);

-- Scheduled Posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id       UUID NOT NULL REFERENCES content_library(id),
  platform         VARCHAR(100) NOT NULL,
  scheduled_time   TIMESTAMP NOT NULL,
  execution_status VARCHAR(50) DEFAULT 'pending',
  platform_post_id VARCHAR(500),
  error_message    TEXT,
  retry_count      INTEGER DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at      TIMESTAMP
);

-- Niche Configs
CREATE TABLE IF NOT EXISTS niche_configs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  niche_name        VARCHAR(100) NOT NULL,
  description       TEXT,
  target_audience   TEXT,
  keywords          TEXT[],
  posting_frequency INTEGER DEFAULT 5,
  status            VARCHAR(50) DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Connections
CREATE TABLE IF NOT EXISTS platform_connections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_name     VARCHAR(100) NOT NULL,
  access_token      VARCHAR(1000),
  refresh_token     VARCHAR(1000),
  account_id        VARCHAR(500),
  account_name      VARCHAR(500),
  connection_status VARCHAR(50) DEFAULT 'connected',
  connected_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_refreshed    TIMESTAMP,
  metadata          JSONB DEFAULT '{}',
  UNIQUE (user_id, platform_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_content_user_id          ON content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_status           ON content_library(status);
CREATE INDEX IF NOT EXISTS idx_content_niche            ON content_library(niche);
CREATE INDEX IF NOT EXISTS idx_affiliate_user_id        ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id        ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_date     ON analytics_events(event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type     ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_products_user_id         ON digital_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status   ON scheduled_posts(execution_status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time     ON scheduled_posts(scheduled_time);
