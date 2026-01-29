-- Codebasics Assess Database Seeds
-- Seed: 001_career_questions
-- Description: Insert the 12 career suitability assessment questions with options and role weights

-- =============================================
-- CAREER QUESTIONS (12 questions)
-- =============================================

-- Question 1: Coding Foundation
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    1,
    'You have a strong foundation in coding or a willingness to learn it',
    'Coding',
    'agreement_scale'
);

-- Question 2: Maths & Stats
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    2,
    'You have a strong foundation in maths & stats or a willingness to learn it',
    'Maths/Stats',
    'agreement_scale'
);

-- Question 3: Computer Science
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    3,
    'You have a strong foundation in computer science or a willingness to learn it',
    'Computer Science',
    'agreement_scale'
);

-- Question 4: Dashboards & Reports
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    4,
    'You are fascinated by the idea of creating dashboards and business reports',
    'Learning Mindset',
    'agreement_scale'
);

-- Question 5: Presenting to Business
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    5,
    'You can envision yourself presenting insights to business folks by analysing data',
    'Business Inclination',
    'agreement_scale'
);

-- Question 6: Data Storage Interest
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000006',
    6,
    'You wondered how data is generated, stored and processed',
    'Technical Curiosity',
    'frequency_scale'
);

-- Question 7: AI Tools Usage
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000007',
    7,
    'You use ChatGPT or other AI tools to get things done',
    'AI Enabled',
    'frequency_scale'
);

-- Question 8: Building Systems
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000008',
    8,
    'You like the thought of building and maintaining systems/pipelines',
    'Engineering Mindset',
    'agreement_scale'
);

-- Question 9: Quick Entry (< 6 months)
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000009',
    9,
    'You are looking for an entry to data field ASAP (within 6 months)',
    'Time Preference',
    'agreement_scale'
);

-- Question 10: Problem Solving
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000010',
    10,
    'You love solving complex puzzles (strategic games, chess, sudoku etc.)',
    'Problem Solving',
    'agreement_scale'
);

-- Question 11: Business over Technical
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000011',
    11,
    'You prefer focusing on business outcomes over hardcore technical stuff',
    'Business Focus',
    'agreement_scale'
);

-- Question 12: Experimentation
INSERT INTO career_questions (id, serial_no, question_text, category, option_type)
VALUES (
    'a1000000-0000-0000-0000-000000000012',
    12,
    'You love experimenting and improving results over time',
    'Analytical Mindset',
    'frequency_scale'
);

-- =============================================
-- QUESTION OPTIONS (Agreement Scale: 1-5, Frequency Scale: 1-5)
-- =============================================

-- Options for Agreement Scale Questions (1, 2, 3, 4, 5, 8, 9, 10, 11)
-- Using a DO block to insert options for all agreement scale questions

DO $$
DECLARE
    agreement_questions UUID[] := ARRAY[
        'a1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000008',
        'a1000000-0000-0000-0000-000000000009',
        'a1000000-0000-0000-0000-000000000010',
        'a1000000-0000-0000-0000-000000000011'
    ];
    q_id UUID;
BEGIN
    FOREACH q_id IN ARRAY agreement_questions
    LOOP
        INSERT INTO career_question_options (question_id, option_text, option_order, score)
        VALUES
            (q_id, 'Strongly Disagree', 1, 1),
            (q_id, 'Disagree', 2, 2),
            (q_id, 'Neutral', 3, 3),
            (q_id, 'Agree', 4, 4),
            (q_id, 'Strongly Agree', 5, 5);
    END LOOP;
END $$;

-- Options for Frequency Scale Questions (6, 7, 12)
DO $$
DECLARE
    frequency_questions UUID[] := ARRAY[
        'a1000000-0000-0000-0000-000000000006',
        'a1000000-0000-0000-0000-000000000007',
        'a1000000-0000-0000-0000-000000000012'
    ];
    q_id UUID;
BEGIN
    FOREACH q_id IN ARRAY frequency_questions
    LOOP
        INSERT INTO career_question_options (question_id, option_text, option_order, score)
        VALUES
            (q_id, 'Never', 1, 1),
            (q_id, 'Rarely', 2, 2),
            (q_id, 'Sometimes', 3, 3),
            (q_id, 'Often', 4, 4),
            (q_id, 'Always', 5, 5);
    END LOOP;
END $$;

-- =============================================
-- ROLE-SPECIFIC WEIGHTS (DA, DS, DE)
-- From PRD Section 5.3
-- =============================================

-- Question 1: Coding Foundation
-- DS: 0.60, DE: 0.35, DA: 0.05
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'ds', 0.60),
    ('a1000000-0000-0000-0000-000000000001', 'de', 0.35),
    ('a1000000-0000-0000-0000-000000000001', 'da', 0.05);

-- Question 2: Maths & Stats
-- DS: 0.75, DE: 0.10, DA: 0.15
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000002', 'ds', 0.75),
    ('a1000000-0000-0000-0000-000000000002', 'de', 0.10),
    ('a1000000-0000-0000-0000-000000000002', 'da', 0.15);

-- Question 3: Computer Science
-- DS: 0.33, DE: 0.65, DA: 0.02
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000003', 'ds', 0.33),
    ('a1000000-0000-0000-0000-000000000003', 'de', 0.65),
    ('a1000000-0000-0000-0000-000000000003', 'da', 0.02);

-- Question 4: Dashboards & Reports
-- DS: 0.20, DE: 0.10, DA: 0.70
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000004', 'ds', 0.20),
    ('a1000000-0000-0000-0000-000000000004', 'de', 0.10),
    ('a1000000-0000-0000-0000-000000000004', 'da', 0.70);

-- Question 5: Presenting to Business
-- DS: 0.20, DE: 0.10, DA: 0.70
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000005', 'ds', 0.20),
    ('a1000000-0000-0000-0000-000000000005', 'de', 0.10),
    ('a1000000-0000-0000-0000-000000000005', 'da', 0.70);

-- Question 6: Data Storage Interest
-- DS: 0.15, DE: 0.75, DA: 0.10
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000006', 'ds', 0.15),
    ('a1000000-0000-0000-0000-000000000006', 'de', 0.75),
    ('a1000000-0000-0000-0000-000000000006', 'da', 0.10);

-- Question 7: AI Tools Usage
-- DS: 0.34, DE: 0.33, DA: 0.33
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000007', 'ds', 0.34),
    ('a1000000-0000-0000-0000-000000000007', 'de', 0.33),
    ('a1000000-0000-0000-0000-000000000007', 'da', 0.33);

-- Question 8: Building Systems
-- DS: 0.20, DE: 0.70, DA: 0.10
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000008', 'ds', 0.20),
    ('a1000000-0000-0000-0000-000000000008', 'de', 0.70),
    ('a1000000-0000-0000-0000-000000000008', 'da', 0.10);

-- Question 9: Quick Entry (< 6 months)
-- DS: 0.10, DE: 0.10, DA: 0.80
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000009', 'ds', 0.10),
    ('a1000000-0000-0000-0000-000000000009', 'de', 0.10),
    ('a1000000-0000-0000-0000-000000000009', 'da', 0.80);

-- Question 10: Problem Solving
-- DS: 0.40, DE: 0.30, DA: 0.30
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000010', 'ds', 0.40),
    ('a1000000-0000-0000-0000-000000000010', 'de', 0.30),
    ('a1000000-0000-0000-0000-000000000010', 'da', 0.30);

-- Question 11: Business over Technical
-- DS: 0.20, DE: 0.10, DA: 0.70
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000011', 'ds', 0.20),
    ('a1000000-0000-0000-0000-000000000011', 'de', 0.10),
    ('a1000000-0000-0000-0000-000000000011', 'da', 0.70);

-- Question 12: Experimentation
-- DS: 0.70, DE: 0.20, DA: 0.10
INSERT INTO career_role_weights (question_id, role, weight) VALUES
    ('a1000000-0000-0000-0000-000000000012', 'ds', 0.70),
    ('a1000000-0000-0000-0000-000000000012', 'de', 0.20),
    ('a1000000-0000-0000-0000-000000000012', 'da', 0.10);
