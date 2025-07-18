-- Create health reports table
CREATE TABLE IF NOT EXISTS health_reports (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    overall_score INTEGER NOT NULL,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical')),
    metrics JSONB NOT NULL,
    alerts JSONB NOT NULL,
    check_duration INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create system alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_id TEXT UNIQUE NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
    metric TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    details JSONB,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create monitoring configuration table
CREATE TABLE IF NOT EXISTS monitoring_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_config CHECK (id = 1)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_reports_timestamp ON health_reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_reports_status ON health_reports(overall_status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_timestamp ON system_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_metric ON system_alerts(metric);

-- Enable Row Level Security
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on health_reports" ON health_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_alerts" ON system_alerts FOR ALL USING (true);
CREATE POLICY "Allow all operations on monitoring_config" ON monitoring_config FOR ALL USING (true);

-- Insert default monitoring configuration
INSERT INTO monitoring_config (id, settings) VALUES (1, '{
  "enabled": true,
  "check_interval": 60,
  "alert_rules": [
    {
      "id": "db_latency_warning",
      "metric": "database_latency",
      "threshold": 1000,
      "operator": ">",
      "severity": "warning",
      "enabled": true,
      "description": "Database response time exceeds 1 second"
    },
    {
      "id": "db_latency_critical",
      "metric": "database_latency",
      "threshold": 3000,
      "operator": ">",
      "severity": "critical",
      "enabled": true,
      "description": "Database response time exceeds 3 seconds"
    },
    {
      "id": "api_success_warning",
      "metric": "api_success_rate",
      "threshold": 95,
      "operator": "<",
      "severity": "warning",
      "enabled": true,
      "description": "API success rate below 95%"
    },
    {
      "id": "api_success_critical",
      "metric": "api_success_rate",
      "threshold": 80,
      "operator": "<",
      "severity": "critical",
      "enabled": true,
      "description": "API success rate below 80%"
    }
  ],
  "notification_settings": {
    "email_enabled": false,
    "webhook_enabled": false,
    "email_recipients": [],
    "webhook_url": "",
    "critical_only": false
  },
  "retention_days": 30
}') ON CONFLICT (id) DO NOTHING;

-- Create a function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
DECLARE
    retention_days INTEGER;
BEGIN
    -- Get retention setting from config
    SELECT (settings->>'retention_days')::INTEGER INTO retention_days
    FROM monitoring_config WHERE id = 1;
    
    -- Default to 30 days if not configured
    IF retention_days IS NULL THEN
        retention_days := 30;
    END IF;
    
    -- Delete old health reports
    DELETE FROM health_reports 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    -- Delete old resolved alerts (keep unresolved ones)
    DELETE FROM system_alerts 
    WHERE resolved = true 
    AND created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    RAISE NOTICE 'Cleaned up monitoring data older than % days', retention_days;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-monitoring', '0 2 * * *', 'SELECT cleanup_monitoring_data();');

COMMIT;
