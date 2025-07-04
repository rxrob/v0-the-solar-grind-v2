-- Enable required PostgreSQL extensions for UUID generation and cryptographic functions
-- Run this script first before creating any tables

-- Enable pgcrypto extension for gen_random_uuid() and other crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable uuid-ossp extension as a fallback for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions are installed
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp');
