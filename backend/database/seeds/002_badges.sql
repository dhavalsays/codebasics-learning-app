-- Codebasics Assess Database Seeds
-- Seed: 002_badges
-- Description: Insert all achievement badges as defined in PRD Section 12.3

-- =============================================
-- BADGES
-- =============================================

-- Career Test Badges
INSERT INTO badges (id, name, description, icon_url, criteria) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Career Explorer', 'You took your first step in discovering your data career path', '/badges/career-explorer.svg', 'Complete first career test'),
    ('b1000000-0000-0000-0000-000000000002', 'Path Finder', 'You explored all three data career paths', '/badges/path-finder.svg', 'Complete all 3 career tests'),
    ('b1000000-0000-0000-0000-000000000003', 'DA Natural', 'You have a strong aptitude for Data Analytics', '/badges/da-natural.svg', 'Score 80%+ on DA test'),
    ('b1000000-0000-0000-0000-000000000004', 'DS Prodigy', 'You show exceptional potential for Data Science', '/badges/ds-prodigy.svg', 'Score 80%+ on DS test'),
    ('b1000000-0000-0000-0000-000000000005', 'DE Builder', 'You have the mindset of a Data Engineer', '/badges/de-builder.svg', 'Score 80%+ on DE test'),
    ('b1000000-0000-0000-0000-000000000006', 'Perfect Match', 'You found your perfect career match', '/badges/perfect-match.svg', 'Score 90%+ on any career test');

-- Skill Test Badges
INSERT INTO badges (id, name, description, icon_url, criteria) VALUES
    ('b1000000-0000-0000-0000-000000000007', 'Python Pioneer', 'You demonstrated strong Python fundamentals', '/badges/python-pioneer.svg', 'Score 80%+ on Python test'),
    ('b1000000-0000-0000-0000-000000000008', 'SQL Star', 'You mastered SQL queries', '/badges/sql-star.svg', 'Score 80%+ on SQL test');

-- Streak Badges
INSERT INTO badges (id, name, description, icon_url, criteria) VALUES
    ('b1000000-0000-0000-0000-000000000009', 'Streak Starter', 'You built a learning habit', '/badges/streak-starter.svg', '7-day streak'),
    ('b1000000-0000-0000-0000-000000000010', 'Streak Master', 'You showed incredible dedication', '/badges/streak-master.svg', '30-day streak');

-- Social & Leaderboard Badges
INSERT INTO badges (id, name, description, icon_url, criteria) VALUES
    ('b1000000-0000-0000-0000-000000000011', 'Social Butterfly', 'You love sharing your achievements', '/badges/social-butterfly.svg', 'Share 5 results'),
    ('b1000000-0000-0000-0000-000000000012', 'Top 10', 'You ranked in the top 10 this week', '/badges/top-10.svg', 'Weekly leaderboard top 10'),
    ('b1000000-0000-0000-0000-000000000013', 'Champion', 'You conquered the weekly leaderboard', '/badges/champion.svg', 'Weekly leaderboard #1');

-- Learning Journey Badges
INSERT INTO badges (id, name, description, icon_url, criteria) VALUES
    ('b1000000-0000-0000-0000-000000000014', 'Quick Learner', 'You completed 10 practice questions', '/badges/quick-learner.svg', 'Answer 10 practice questions'),
    ('b1000000-0000-0000-0000-000000000015', 'Dedicated Learner', 'You completed 100 practice questions', '/badges/dedicated-learner.svg', 'Answer 100 practice questions'),
    ('b1000000-0000-0000-0000-000000000016', 'XP Hunter', 'You earned your first 1000 XP', '/badges/xp-hunter.svg', 'Earn 1000 XP total');
