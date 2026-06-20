-- ============================================================
-- DocBridge Database Schema
-- PostgreSQL 15
-- Database: docbridge_db
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','caregiver','admin')),
    blood_group VARCHAR(10),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    known_allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('spouse','child','parent','sibling','grandparent','grandchild','other')),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    blood_group VARCHAR(10),
    known_allergies TEXT[],
    chronic_conditions TEXT[],
    avatar_url TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_family_members_primary_user_id ON family_members(primary_user_id);

-- ============================================================
-- CONSULTATIONS
-- ============================================================
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    doctor_name VARCHAR(200),
    doctor_specialty VARCHAR(100),
    hospital_clinic VARCHAR(200),
    consultation_date DATE NOT NULL,
    consultation_time TIME,
    chief_complaint TEXT,
    diagnosis TEXT,
    diagnosis_simplified TEXT,
    doctor_notes TEXT,
    follow_up_date DATE,
    follow_up_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled','completed','cancelled','missed')),
    is_teleconsultation BOOLEAN NOT NULL DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    ai_explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_consultation_date ON consultations(consultation_date DESC);
CREATE INDEX idx_consultations_status ON consultations(status);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration_days INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    purpose TEXT,
    purpose_simplified TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    refill_needed BOOLEAN NOT NULL DEFAULT FALSE,
    refill_date DATE,
    prescribing_doctor VARCHAR(200),
    pharmacy_notes TEXT,
    ai_explanation TEXT,
    side_effect_warnings TEXT[],
    food_interactions TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_is_active ON prescriptions(is_active);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);

-- ============================================================
-- SIDE EFFECTS LOG
-- ============================================================
CREATE TABLE side_effects_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    effect_description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild','moderate','severe')),
    onset_date DATE NOT NULL,
    resolved_date DATE,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    action_taken TEXT,
    doctor_notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_side_effects_log_user_id ON side_effects_log(user_id);
CREATE INDEX idx_side_effects_log_prescription_id ON side_effects_log(prescription_id);

-- ============================================================
-- MEDICINE REMINDERS
-- ============================================================
CREATE TABLE medicine_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    medicine_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    reminder_times TEXT[] NOT NULL,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notification_method VARCHAR(20) NOT NULL DEFAULT 'in_app',
    last_triggered_at TIMESTAMPTZ,
    snooze_minutes INTEGER DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_medicine_reminders_user_id ON medicine_reminders(user_id);
CREATE INDEX idx_medicine_reminders_is_active ON medicine_reminders(is_active);

-- ============================================================
-- FOLLOWUP REMINDERS
-- ============================================================
CREATE TABLE followup_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    reminder_type VARCHAR(50) NOT NULL DEFAULT 'followup' CHECK (reminder_type IN ('followup','test','vaccination','checkup','refill','other')),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notification_method VARCHAR(20) NOT NULL DEFAULT 'in_app',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_followup_reminders_user_id ON followup_reminders(user_id);
CREATE INDEX idx_followup_reminders_reminder_date ON followup_reminders(reminder_date ASC);
CREATE INDEX idx_followup_reminders_is_completed ON followup_reminders(is_completed);

-- ============================================================
-- LAB REPORTS
-- ============================================================
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    report_name VARCHAR(300) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    lab_name VARCHAR(200),
    report_date DATE NOT NULL,
    ordered_by_doctor VARCHAR(200),
    results JSONB NOT NULL DEFAULT '[]',
    flagged_values JSONB DEFAULT '[]',
    overall_interpretation TEXT,
    overall_interpretation_simplified TEXT,
    ai_explanation TEXT,
    file_url TEXT,
    raw_text TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'final' CHECK (status IN ('pending','preliminary','final','corrected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX idx_lab_reports_report_date ON lab_reports(report_date DESC);
CREATE INDEX idx_lab_reports_report_type ON lab_reports(report_type);

-- ============================================================
-- SYMPTOMS
-- ============================================================
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    symptom_name VARCHAR(200) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    onset_date DATE NOT NULL,
    onset_time TIME,
    duration_hours INTEGER,
    is_ongoing BOOLEAN NOT NULL DEFAULT TRUE,
    resolved_date DATE,
    body_location VARCHAR(100),
    triggers TEXT,
    relieved_by TEXT,
    associated_symptoms TEXT[],
    notes TEXT,
    ai_insight TEXT,
    related_consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_onset_date ON symptoms(onset_date DESC);
CREATE INDEX idx_symptoms_is_ongoing ON symptoms(is_ongoing);

-- ============================================================
-- CHAT HISTORY
-- ============================================================
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    tokens_used INTEGER,
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    feedback VARCHAR(20) CHECK (feedback IN ('helpful','not_helpful','flagged')),
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at DESC);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_side_effects_log_updated_at BEFORE UPDATE ON side_effects_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicine_reminders_updated_at BEFORE UPDATE ON medicine_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_followup_reminders_updated_at BEFORE UPDATE ON followup_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
