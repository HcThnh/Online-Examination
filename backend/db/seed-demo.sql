-- Demo seed data for the Online Examination Application.
--
-- Login credentials for teachers:
--   alice@example.com / demo1234
--   bob@example.com   / demo1234
--
-- Tests use passcodes: MATH101, GEO202, PY303, SCI404
--
-- This file is designed to be run via backend/scripts/seed-demo.sh which
-- handles safety checks and schema-exists validation. Running it directly is
-- possible but will fail noisily if any of the target tables already contain
-- rows, because every INSERT uses a fixed primary key.

BEGIN;

-- ---------------------------------------------------------------------------
-- Users: 2 teachers + 8 students
-- BCrypt hash below corresponds to password "demo1234"
-- ---------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
    (1, 'Alice Anderson', 'alice@example.com', '$2a$10$Nqzg5PXfs7obx3Pu15be4uD6.JzZ/Et95jh7T0H7KdwDuwSvleZ5e', 'TEACHER', NOW() - INTERVAL '30 days'),
    (2, 'Bob Baker',      'bob@example.com',   '$2a$10$Nqzg5PXfs7obx3Pu15be4uD6.JzZ/Et95jh7T0H7KdwDuwSvleZ5e', 'TEACHER', NOW() - INTERVAL '30 days'),
    (3, 'Charlie Chen',   'charlie.chen@student.exam',   'N/A', 'STUDENT', NOW() - INTERVAL '10 days'),
    (4, 'Diana Davis',    'diana.davis@student.exam',    'N/A', 'STUDENT', NOW() - INTERVAL '10 days'),
    (5, 'Ethan Evans',    'ethan.evans@student.exam',    'N/A', 'STUDENT', NOW() - INTERVAL  '9 days'),
    (6, 'Fiona Foster',   'fiona.foster@student.exam',   'N/A', 'STUDENT', NOW() - INTERVAL  '8 days'),
    (7, 'George Green',   'george.green@student.exam',   'N/A', 'STUDENT', NOW() - INTERVAL  '7 days'),
    (8, 'Hannah Hall',    'hannah.hall@student.exam',    'N/A', 'STUDENT', NOW() - INTERVAL  '6 days'),
    (9, 'Ivan Ivanov',    'ivan.ivanov@student.exam',    'N/A', 'STUDENT', NOW() - INTERVAL  '5 days'),
    (10,'Julia Jones',    'julia.jones@student.exam',    'N/A', 'STUDENT', NOW() - INTERVAL  '4 days');

-- ---------------------------------------------------------------------------
-- Tests
-- ---------------------------------------------------------------------------
INSERT INTO tests (id, title, description, passcode, teacher_id, created_at, updated_at) VALUES
    (1, 'Math Basics',        'Basic arithmetic and algebra questions.',   'MATH101', 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (2, 'World Geography',    'Countries, capitals, and continents.',      'GEO202',  1, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    (3, 'Python Programming', 'Introductory Python syntax and semantics.', 'PY303',   2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    (4, 'General Science',    'Physics, biology, and chemistry basics.',   'SCI404',  2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days');

-- ---------------------------------------------------------------------------
-- Questions (5 per test = 20 total) and answer options (4 per question = 80)
-- Convention: display_order starts at 1, points = 10 per question unless noted.
-- ---------------------------------------------------------------------------

-- Test 1: Math Basics -------------------------------------------------------
INSERT INTO questions (id, test_id, question_text, points, display_order, created_at) VALUES
    (1, 1, 'What is 7 + 5?',                        10, 1, NOW() - INTERVAL '20 days'),
    (2, 1, 'What is 12 - 4?',                       10, 2, NOW() - INTERVAL '20 days'),
    (3, 1, 'What is 6 * 7?',                        10, 3, NOW() - INTERVAL '20 days'),
    (4, 1, 'Solve for x: 2x + 3 = 11',              10, 4, NOW() - INTERVAL '20 days'),
    (5, 1, 'What is the square root of 81?',        10, 5, NOW() - INTERVAL '20 days');

INSERT INTO answer_options (id, question_id, option_text, is_correct, display_order) VALUES
    (1,  1, '10', FALSE, 1), (2,  1, '11', FALSE, 2), (3,  1, '12', TRUE,  3), (4,  1, '13', FALSE, 4),
    (5,  2, '6',  FALSE, 1), (6,  2, '7',  FALSE, 2), (7,  2, '8',  TRUE,  3), (8,  2, '9',  FALSE, 4),
    (9,  3, '36', FALSE, 1), (10, 3, '40', FALSE, 2), (11, 3, '42', TRUE,  3), (12, 3, '48', FALSE, 4),
    (13, 4, '2',  FALSE, 1), (14, 4, '3',  FALSE, 2), (15, 4, '4',  TRUE,  3), (16, 4, '5',  FALSE, 4),
    (17, 5, '7',  FALSE, 1), (18, 5, '8',  FALSE, 2), (19, 5, '9',  TRUE,  3), (20, 5, '10', FALSE, 4);

-- Test 2: World Geography ---------------------------------------------------
INSERT INTO questions (id, test_id, question_text, points, display_order, created_at) VALUES
    (6,  2, 'What is the capital of France?',              10, 1, NOW() - INTERVAL '18 days'),
    (7,  2, 'Which continent is Egypt located in?',        10, 2, NOW() - INTERVAL '18 days'),
    (8,  2, 'What is the largest ocean on Earth?',         10, 3, NOW() - INTERVAL '18 days'),
    (9,  2, 'Which country has the longest coastline?',    10, 4, NOW() - INTERVAL '18 days'),
    (10, 2, 'Mount Everest is located on the border of?',  10, 5, NOW() - INTERVAL '18 days');

INSERT INTO answer_options (id, question_id, option_text, is_correct, display_order) VALUES
    (21, 6, 'London',     FALSE, 1), (22, 6, 'Berlin',     FALSE, 2), (23, 6, 'Paris',        TRUE,  3), (24, 6, 'Madrid',       FALSE, 4),
    (25, 7, 'Asia',       FALSE, 1), (26, 7, 'Africa',     TRUE,  2), (27, 7, 'Europe',       FALSE, 3), (28, 7, 'South America',FALSE, 4),
    (29, 8, 'Atlantic',   FALSE, 1), (30, 8, 'Indian',     FALSE, 2), (31, 8, 'Pacific',      TRUE,  3), (32, 8, 'Arctic',       FALSE, 4),
    (33, 9, 'Russia',     FALSE, 1), (34, 9, 'Canada',     TRUE,  2), (35, 9, 'Australia',    FALSE, 3), (36, 9, 'USA',          FALSE, 4),
    (37,10, 'India/Nepal',FALSE, 1), (38,10, 'Nepal/China',TRUE,  2), (39,10, 'China/Bhutan', FALSE, 3), (40,10, 'India/China',  FALSE, 4);

-- Test 3: Python Programming ------------------------------------------------
INSERT INTO questions (id, test_id, question_text, points, display_order, created_at) VALUES
    (11, 3, 'Which keyword defines a function in Python?',        10, 1, NOW() - INTERVAL '15 days'),
    (12, 3, 'What is the output of: print(type([]))?',            10, 2, NOW() - INTERVAL '15 days'),
    (13, 3, 'Which of these is an immutable data type?',          10, 3, NOW() - INTERVAL '15 days'),
    (14, 3, 'How do you start a single-line comment in Python?',  10, 4, NOW() - INTERVAL '15 days'),
    (15, 3, 'What does len("hello") return?',                     10, 5, NOW() - INTERVAL '15 days');

INSERT INTO answer_options (id, question_id, option_text, is_correct, display_order) VALUES
    (41,11, 'function',       FALSE, 1), (42,11, 'def',             TRUE,  2), (43,11, 'fun',             FALSE, 3), (44,11, 'lambda',    FALSE, 4),
    (45,12, '<class ''list''>',TRUE, 1), (46,12, 'list',             FALSE, 2), (47,12, 'array',           FALSE, 3), (48,12, 'Error',     FALSE, 4),
    (49,13, 'list',           FALSE, 1), (50,13, 'dict',             FALSE, 2), (51,13, 'tuple',           TRUE,  3), (52,13, 'set',       FALSE, 4),
    (53,14, '//',             FALSE, 1), (54,14, '/* */',            FALSE, 2), (55,14, '#',               TRUE,  3), (56,14, '--',        FALSE, 4),
    (57,15, '4',              FALSE, 1), (58,15, '5',                TRUE,  2), (59,15, '6',               FALSE, 3), (60,15, 'Error',     FALSE, 4);

-- Test 4: General Science ---------------------------------------------------
INSERT INTO questions (id, test_id, question_text, points, display_order, created_at) VALUES
    (16, 4, 'What is the chemical symbol for water?',            10, 1, NOW() - INTERVAL '12 days'),
    (17, 4, 'Which planet is known as the Red Planet?',          10, 2, NOW() - INTERVAL '12 days'),
    (18, 4, 'What gas do plants absorb from the atmosphere?',    10, 3, NOW() - INTERVAL '12 days'),
    (19, 4, 'What is the powerhouse of the cell?',               10, 4, NOW() - INTERVAL '12 days'),
    (20, 4, 'What is the unit of electrical resistance?',        10, 5, NOW() - INTERVAL '12 days');

INSERT INTO answer_options (id, question_id, option_text, is_correct, display_order) VALUES
    (61,16, 'HO',          FALSE, 1), (62,16, 'H2O',           TRUE,  2), (63,16, 'O2H',        FALSE, 3), (64,16, 'HHO',         FALSE, 4),
    (65,17, 'Venus',       FALSE, 1), (66,17, 'Jupiter',       FALSE, 2), (67,17, 'Mars',       TRUE,  3), (68,17, 'Saturn',      FALSE, 4),
    (69,18, 'Oxygen',      FALSE, 1), (70,18, 'Nitrogen',      FALSE, 2), (71,18, 'Carbon Dioxide', TRUE, 3), (72,18, 'Hydrogen', FALSE, 4),
    (73,19, 'Nucleus',     FALSE, 1), (74,19, 'Ribosome',      FALSE, 2), (75,19, 'Mitochondria',TRUE,  3), (76,19, 'Chloroplast',FALSE, 4),
    (77,20, 'Volt',        FALSE, 1), (78,20, 'Ampere',        FALSE, 2), (79,20, 'Ohm',         TRUE,  3), (80,20, 'Watt',        FALSE, 4);

-- ---------------------------------------------------------------------------
-- Test attempts: 8 student submissions with scored answers.
-- Each attempt references exactly the 5 questions of its test.
-- max_score is always 50 (5 questions * 10 points).
-- ---------------------------------------------------------------------------

-- Math Basics (test 1): Charlie scores 50 (perfect), Diana scores 30.
INSERT INTO test_attempts (id, test_id, student_id, score, max_score, submitted_at) VALUES
    (1, 1, 3, 50, 50, NOW() - INTERVAL '8 days'),
    (2, 1, 4, 30, 50, NOW() - INTERVAL '7 days');

INSERT INTO student_answers (id, attempt_id, question_id, selected_option_id) VALUES
    -- Charlie: all correct
    (1,  1, 1, 3),  (2,  1, 2, 7),  (3,  1, 3, 11), (4,  1, 4, 15), (5,  1, 5, 19),
    -- Diana: 3 correct (Q1, Q3, Q5), 2 wrong (Q2, Q4)
    (6,  2, 1, 3),  (7,  2, 2, 5),  (8,  2, 3, 11), (9,  2, 4, 13), (10, 2, 5, 19);

-- World Geography (test 2): Ethan scores 40.
INSERT INTO test_attempts (id, test_id, student_id, score, max_score, submitted_at) VALUES
    (3, 2, 5, 40, 50, NOW() - INTERVAL '6 days');

INSERT INTO student_answers (id, attempt_id, question_id, selected_option_id) VALUES
    -- Ethan: 4 correct, 1 wrong (Q9)
    (11, 3, 6, 23), (12, 3, 7, 26), (13, 3, 8, 31), (14, 3, 9, 33), (15, 3, 10, 38);

-- Python (test 3): Fiona scores 50, George 20, Hannah 40.
INSERT INTO test_attempts (id, test_id, student_id, score, max_score, submitted_at) VALUES
    (4, 3, 6, 50, 50, NOW() - INTERVAL '5 days'),
    (5, 3, 7, 20, 50, NOW() - INTERVAL '4 days'),
    (6, 3, 8, 40, 50, NOW() - INTERVAL '3 days');

INSERT INTO student_answers (id, attempt_id, question_id, selected_option_id) VALUES
    -- Fiona: all correct
    (16, 4, 11, 42), (17, 4, 12, 45), (18, 4, 13, 51), (19, 4, 14, 55), (20, 4, 15, 58),
    -- George: 2 correct (Q11, Q15)
    (21, 5, 11, 42), (22, 5, 12, 46), (23, 5, 13, 49), (24, 5, 14, 53), (25, 5, 15, 58),
    -- Hannah: 4 correct, 1 wrong (Q13)
    (26, 6, 11, 42), (27, 6, 12, 45), (28, 6, 13, 50), (29, 6, 14, 55), (30, 6, 15, 58);

-- Science (test 4): Ivan scores 50, Julia scores 30.
INSERT INTO test_attempts (id, test_id, student_id, score, max_score, submitted_at) VALUES
    (7, 4, 9,  50, 50, NOW() - INTERVAL '2 days'),
    (8, 4, 10, 30, 50, NOW() - INTERVAL '1 day');

INSERT INTO student_answers (id, attempt_id, question_id, selected_option_id) VALUES
    -- Ivan: all correct
    (31, 7, 16, 62), (32, 7, 17, 67), (33, 7, 18, 71), (34, 7, 19, 75), (35, 7, 20, 79),
    -- Julia: 3 correct, 2 wrong (Q17, Q18)
    (36, 8, 16, 62), (37, 8, 17, 65), (38, 8, 18, 69), (39, 8, 19, 75), (40, 8, 20, 79);

-- ---------------------------------------------------------------------------
-- Advance the identity sequences past the highest inserted IDs so future
-- inserts from the application don't collide with seeded rows.
-- ---------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users',           'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('tests',           'id'), (SELECT MAX(id) FROM tests));
SELECT setval(pg_get_serial_sequence('questions',       'id'), (SELECT MAX(id) FROM questions));
SELECT setval(pg_get_serial_sequence('answer_options',  'id'), (SELECT MAX(id) FROM answer_options));
SELECT setval(pg_get_serial_sequence('test_attempts',   'id'), (SELECT MAX(id) FROM test_attempts));
SELECT setval(pg_get_serial_sequence('student_answers', 'id'), (SELECT MAX(id) FROM student_answers));

COMMIT;
