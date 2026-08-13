-- ============================================================
-- Organization
-- ============================================================
INSERT INTO organizations (id, name, segment, config) VALUES
('supra', 'Supra Multi-Specialty Hospital', 'hospital', 
 '{"derivability_threshold": 0.7, "max_candidate_set": 50, "token_budget": 4000}');

-- ============================================================
-- 15-Level Hierarchy
-- ============================================================
INSERT INTO hierarchy_levels (id, org_id, level_number, level_name, department, parent_ids, zone) VALUES
('HL-01', 'supra', 1, 'Hospital', NULL, '{}', 1),
('HL-03-CLIN', 'supra', 3, 'Clinical Division', NULL, '{"HL-01"}', 1),
('HL-03-ADMIN', 'supra', 3, 'Administrative Division', NULL, '{"HL-01"}', 1),
('HL-05-ORTHO', 'supra', 5, 'Orthopaedics Department', 'ortho', '{"HL-03-CLIN"}', 1),
('HL-05-MED', 'supra', 5, 'General Medicine Department', 'medicine', '{"HL-03-CLIN"}', 1),
('HL-05-CARDIO', 'supra', 5, 'Cardiology Department', 'cardiology', '{"HL-03-CLIN"}', 1),
('HL-05-PAEDS', 'supra', 5, 'Paediatrics Department', 'paediatrics', '{"HL-03-CLIN"}', 1),
('HL-05-SURG', 'supra', 5, 'Surgery Department', 'surgery', '{"HL-03-CLIN"}', 1),
('HL-05-ICU', 'supra', 5, 'ICU Department', 'icu', '{"HL-03-CLIN"}', 1),
('HL-08-ORTHO-GEN', 'supra', 8, 'Ortho General', 'ortho', '{"HL-05-ORTHO"}', 1),
('HL-08-ORTHO-TKR', 'supra', 8, 'Ortho TKR Unit', 'ortho', '{"HL-05-ORTHO"}', 1),
('HL-08-MED-GEN', 'supra', 8, 'Medicine General', 'medicine', '{"HL-05-MED"}', 1),
('HL-08-CARDIO-CCU', 'supra', 8, 'Cardiac Care Unit', 'cardiology', '{"HL-05-CARDIO"}', 1),
('HL-10-ORTHO-W', 'supra', 10, 'Ortho Ward', 'ortho', '{"HL-08-ORTHO-GEN"}', 1),
('HL-10-MED-W', 'supra', 10, 'Medicine Ward', 'medicine', '{"HL-08-MED-GEN"}', 1),
('HL-10-PAEDS-W', 'supra', 10, 'Paediatrics Ward', 'paediatrics', '{"HL-05-PAEDS"}', 1),
('HL-12-RAJAN', 'supra', 12, 'Patient: Rajan', 'ortho', '{"HL-10-ORTHO-W"}', 1),
('HL-12-PADMA', 'supra', 12, 'Patient: Padma', 'medicine', '{"HL-10-MED-W"}', 1),
('HL-08-POST-TKR', 'supra', 8, 'Post-TKR Protocol Area', 'ortho', '{"HL-05-ORTHO", "HL-05-SURG"}', 1),
('HL-GLOBAL', 'supra', 3, 'Global Constraints', NULL, '{"HL-01"}', 2);

-- ============================================================
-- 7 Users
-- ============================================================
INSERT INTO users (id, org_id, name, role, department, ceiling_level, write_ceiling, compliance_clearance) VALUES
('U-PRIYA',  'supra', 'Nurse Priya',       'VIEWER',  'ortho',     10, NULL, '{}'),
('U-VIKRAM', 'supra', 'Dr. Vikram (HOD)',   'HOD',     'ortho',      4, 4,    '{}'),
('U-ANANYA', 'supra', 'Dr. Ananya',         'EDITOR',  'medicine',   8, 8,    '{}'),
('U-SHARMA', 'supra', 'Dr. Sharma (HOD)',   'HOD',     'medicine',   4, 4,    '{}'),
('U-RAVI',   'supra', 'Pharmacist Ravi',    'VIEWER',  'pharmacy',  12, NULL, '{}'),
('U-SUNITA', 'supra', 'Dr. Sunita (QA)',    'QUALITY', 'quality',    6, 8,    '{"MNPI"}'),
('U-SURESH', 'supra', 'Admin Suresh',       'ADMIN',   'admin',      1, 1,    '{"MNPI", "PHI", "CONFIDENTIAL"}');

-- ============================================================
-- Knowledge Nodes (Compact 20-node version matching your setup.ts)
-- ============================================================
INSERT INTO knowledge_nodes (id, org_id, hierarchy_level_id, type, title, content, importance, zone, status, derivability_score, compliance_tags, department) VALUES

('N-G01', 'supra', 'HL-GLOBAL', 'CONSTRAINT', 'Warfarin-NSAID Interaction',
 'CRITICAL: Never prescribe NSAIDs to patients on Warfarin.', 0.98, 2, 'ACTIVE', 0.15, '{}', NULL),
('N-G02', 'supra', 'HL-GLOBAL', 'CONSTRAINT', 'Penicillin Allergy Cross-Reactivity',
 'Patients with penicillin allergy: use azithromycin.', 0.95, 2, 'ACTIVE', 0.20, '{}', NULL),
('N-G03', 'supra', 'HL-GLOBAL', 'CONSTRAINT', 'Blood Transfusion Two-Person Verification',
 'ALL transfusions require two-person verification.', 0.97, 2, 'ACTIVE', 0.10, '{}', NULL),
('N-G04', 'supra', 'HL-GLOBAL', 'CONSTRAINT', 'Hand Hygiene 5-Moment Compliance',
 'WHO 5-moment hand hygiene compliance is mandatory.', 0.90, 2, 'ACTIVE', 0.75, '{}', NULL),
('N-G05', 'supra', 'HL-GLOBAL', 'ANTI_PATTERN', 'Verbal Orders Without Documentation',
 'NEVER accept verbal orders for medication changes.', 0.92, 2, 'ACTIVE', 0.12, '{}', NULL),

('N-O01', 'supra', 'HL-05-ORTHO', 'CONSTRAINT', 'Post-Op Vitals Monitoring',
 'Post-op vitals q15min for 4 hours.', 0.94, 1, 'ACTIVE', 0.35, '{}', 'ortho'),
('N-O02', 'supra', 'HL-10-ORTHO-W', 'DECISION', 'Paracetamol First-Line Post-TKR',
 'Supra Ortho uses Paracetamol 650mg QDS post-TKR.', 0.88, 1, 'ACTIVE', 0.08, '{}', 'ortho'),
('N-O03', 'supra', 'HL-10-ORTHO-W', 'ANTI_PATTERN', 'Never Discharge TKR Under 48 Hours',
 'Do NOT discharge TKR before 48 hours.', 0.91, 1, 'ACTIVE', 0.10, '{}', 'ortho'),
('N-O04', 'supra', 'HL-05-ORTHO', 'DECISION', 'Zimmer Implant Preference',
 'Ortho uses Zimmer Biomet as preferred TKR implant.', 0.72, 1, 'ACTIVE', 0.05, '{}', 'ortho'),
('N-O05', 'supra', 'HL-10-ORTHO-W', 'FACT', 'Ortho Ward Bed Capacity',
 'Ortho Ward: 45 beds.', 0.50, 1, 'ACTIVE', 0.40, '{}', 'ortho'),
('N-O06', 'supra', 'HL-05-ORTHO', 'CONSTRAINT', 'DVT Prophylaxis Protocol',
 'All ortho surgical patients receive Enoxaparin 40mg.', 0.93, 1, 'ACTIVE', 0.30, '{}', 'ortho'),

('N-O11', 'supra', 'HL-05-ORTHO', 'DECISION', 'Ortho Budget Allocation 2026',
 'FY 2026 budget: ₹4.2 Cr. Implants: 45%, Staffing: 30%.', 0.70, 1, 'ACTIVE', 0.05, '{"MNPI"}', 'ortho'),
('N-O12', 'supra', 'HL-05-ORTHO', 'DECISION', 'Ortho Vendor Negotiation Strategy',
 'Renegotiate Zimmer contract for 12% discount.', 0.65, 1, 'ACTIVE', 0.03, '{"MNPI", "CONFIDENTIAL"}', 'ortho'),

('N-M01', 'supra', 'HL-05-MED', 'CONSTRAINT', 'Diabetic Fasting Protocol',
 'Adjust insulin timing for fasting patients.', 0.90, 1, 'ACTIVE', 0.15, '{}', 'medicine'),
('N-M02', 'supra', 'HL-05-MED', 'DECISION', 'Sepsis Protocol v3 2026',
 'Sepsis Bundle v3: lactate within 1 hour.', 0.95, 1, 'ACTIVE', 0.25, '{}', 'medicine'),
('N-M08', 'supra', 'HL-05-MED', 'DECISION', 'Sepsis Protocol v2 (SUPERSEDED)',
 'OLD: Sepsis Bundle v2 with 3-hour lactate window.', 0.95, 1, 'SUPERSEDED', 0.25, '{}', 'medicine'),

('N-C01', 'supra', 'HL-05-CARDIO', 'CONSTRAINT', 'Cardiac Catheterization Consent',
 'Written consent 4 hours before cath.', 0.92, 1, 'ACTIVE', 0.30, '{}', 'cardiology'),
('N-C02', 'supra', 'HL-05-CARDIO', 'DECISION', 'CCU Troponin Protocol',
 'Serial troponin at 0, 3, 6 hours.', 0.90, 1, 'ACTIVE', 0.35, '{}', 'cardiology'),

('N-A01', 'supra', 'HL-01', 'DECISION', 'Hospital Expansion Plan',
 '80 additional beds by Q4 2027. Investment: ₹85 Cr.', 0.80, 1, 'ACTIVE', 0.02, '{"MNPI", "CONFIDENTIAL"}', NULL),

('N-D01', 'supra', 'HL-05-ORTHO', 'FACT', 'What is a Total Knee Replacement',
 'TKR is a procedure replacing knee joint surfaces.', 0.40, 1, 'ACTIVE', 0.92, '{}', 'ortho');