-- Codebasics Assess Database Schema
-- Migration: 001_initial_schema
-- Description: Create all initial tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    profile_image VARCHAR(500),
    auth_provider VARCHAR(50) DEFAULT 'email', -- 'google', 'linkedin', 'apple', 'email'
    auth_provider_id VARCHAR(255),
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);

-- =============================================
-- CAREER ASSESSMENT TABLES
-- =============================================

-- Career Questions (12 questions used for all 3 tests)
CREATE TABLE IF NOT EXISTS career_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_no INTEGER NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    category VARCHAR(100),
    option_type VARCHAR(50) NOT NULL, -- 'agreement_scale' or 'frequency_scale'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_career_questions_serial ON career_questions(serial_no);
CREATE INDEX idx_career_questions_active ON career_questions(is_active);

-- Career Question Options (5 options per question)
CREATE TABLE IF NOT EXISTS career_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES career_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(100) NOT NULL,
    option_order INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_career_options_question ON career_question_options(question_id);

-- Role-specific Weights (DA, DS, DE weights per question)
CREATE TABLE IF NOT EXISTS career_role_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES career_questions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL, -- 'da', 'ds', 'de'
    weight DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(question_id, role)
);

CREATE INDEX idx_career_weights_question ON career_role_weights(question_id);
CREATE INDEX idx_career_weights_role ON career_role_weights(role);

-- Career Test Attempts (stores user test submissions)
CREATE TABLE IF NOT EXISTS career_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_tested VARCHAR(10) NOT NULL, -- 'da', 'ds', 'de'
    answers JSONB NOT NULL,
    raw_weighted_score DECIMAL(10,4),
    suitability_percentage INTEGER,
    percentile_rank INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_career_attempts_user ON career_test_attempts(user_id);
CREATE INDEX idx_career_attempts_role ON career_test_attempts(role_tested);
CREATE INDEX idx_career_attempts_completed ON career_test_attempts(completed_at);

-- =============================================
-- SKILL TEST TABLES
-- =============================================

-- Skill Tests (Python, SQL, etc.)
CREATE TABLE IF NOT EXISTS skill_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_questions INTEGER DEFAULT 20,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skill_tests_category ON skill_tests(category);
CREATE INDEX idx_skill_tests_active ON skill_tests(is_active);

-- Skill Questions (MCQs)
CREATE TABLE IF NOT EXISTS skill_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES skill_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
    explanation TEXT,
    topic VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skill_questions_test ON skill_questions(test_id);
CREATE INDEX idx_skill_questions_topic ON skill_questions(topic);
CREATE INDEX idx_skill_questions_difficulty ON skill_questions(difficulty);
CREATE INDEX idx_skill_questions_active ON skill_questions(is_active);

-- Skill Test Attempts
CREATE TABLE IF NOT EXISTS skill_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES skill_tests(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score_percentage INTEGER,
    correct_count INTEGER,
    total_questions INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skill_attempts_user ON skill_test_attempts(user_id);
CREATE INDEX idx_skill_attempts_test ON skill_test_attempts(test_id);

-- =============================================
-- GAMIFICATION TABLES
-- =============================================

-- Badges
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    criteria TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Badges (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- Weekly Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_leaderboard_week ON leaderboard_weekly(week_start);
CREATE INDEX idx_leaderboard_xp ON leaderboard_weekly(total_xp DESC);

-- =============================================
-- AUDIT & TRACKING TABLES
-- =============================================

-- User Activity Log (for analytics)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_activity_created ON user_activity_log(created_at);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
