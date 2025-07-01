-- Clean up existing database objects
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
DROP TRIGGER IF EXISTS update_solar_calculations_updated_at ON solar_calculations;

DROP INDEX IF EXISTS idx_solar_calculations_user_id;
DROP INDEX IF EXISTS idx_solar_calculations_user_email;
DROP INDEX IF EXISTS idx_solar_calculations_created_at;
DROP INDEX IF EXISTS idx_user_projects_user_id;
DROP INDEX IF EXISTS idx_user_projects_created_at;
DROP INDEX IF EXISTS idx_user_projects_status;
DROP INDEX IF EXISTS idx_user_projects_customer_email;

DROP TABLE IF EXISTS solar_calculations CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column();

-- Clean slate for fresh setup
