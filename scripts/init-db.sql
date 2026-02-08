-- Bravilio Database Initialization
-- This script runs when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for full-text search performance (applied after Prisma migrations)
-- These are safe to run even if tables don't exist yet (they'll be no-ops)
