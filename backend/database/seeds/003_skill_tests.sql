-- Codebasics Assess Database Seeds
-- Seed: 003_skill_tests
-- Description: Insert skill tests and sample questions for Python and SQL

-- =============================================
-- SKILL TESTS
-- =============================================

INSERT INTO skill_tests (id, title, description, category, total_questions, passing_score) VALUES
    ('51100000-0000-0000-0000-000000000001', 'Python Fundamentals', 'Test your knowledge of Python basics including variables, loops, functions, and data structures', 'Python', 20, 70),
    ('51100000-0000-0000-0000-000000000002', 'SQL Knowledge Check', 'Assess your SQL skills covering queries, joins, aggregations, and database concepts', 'SQL', 20, 70);

-- =============================================
-- PYTHON QUESTIONS (Sample - 25 questions)
-- =============================================

INSERT INTO skill_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) VALUES
-- Variables & Data Types
('51100000-0000-0000-0000-000000000001', 'What is the output of: type(3.14)?', '<class ''int''>', '<class ''float''>', '<class ''str''>', '<class ''double''>', 'b', 'In Python, decimal numbers are represented as float type, not double as in some other languages.', 'Data Types', 'easy'),

('51100000-0000-0000-0000-000000000001', 'Which of the following is a valid variable name in Python?', '2variable', 'my-var', '_myVar', 'class', 'c', 'Variable names can start with underscore or letter, but not numbers or hyphens. ''class'' is a reserved keyword.', 'Variables', 'easy'),

('51100000-0000-0000-0000-000000000001', 'What will be the output of: bool(0)?', 'True', 'False', '0', 'Error', 'b', 'In Python, 0, empty strings, empty lists, and None are considered False when converted to boolean.', 'Data Types', 'easy'),

-- Strings
('51100000-0000-0000-0000-000000000001', 'What is the output of: "Hello"[1:4]?', 'Hel', 'ell', 'ello', 'Hell', 'b', 'String slicing [1:4] starts at index 1 and goes up to (but not including) index 4, giving us characters at positions 1, 2, and 3.', 'Strings', 'easy'),

('51100000-0000-0000-0000-000000000001', 'Which method removes whitespace from both ends of a string?', 'strip()', 'trim()', 'clean()', 'remove()', 'a', 'The strip() method removes leading and trailing whitespace. Python doesn''t have a trim() method like some other languages.', 'Strings', 'easy'),

-- Lists
('51100000-0000-0000-0000-000000000001', 'What is the output of: [1, 2, 3] + [4, 5]?', '[1, 2, 3, 4, 5]', '[5, 7, 8]', '[[1, 2, 3], [4, 5]]', 'Error', 'a', 'The + operator concatenates two lists, creating a new list with all elements from both lists.', 'Lists', 'easy'),

('51100000-0000-0000-0000-000000000001', 'Which method adds an element to the end of a list?', 'add()', 'append()', 'insert()', 'extend()', 'b', 'append() adds a single element to the end. extend() adds multiple elements, insert() adds at a specific position.', 'Lists', 'easy'),

('51100000-0000-0000-0000-000000000001', 'What does list.pop() return?', 'None', 'The first element', 'The last element', 'The list length', 'c', 'pop() without arguments removes and returns the last element of the list.', 'Lists', 'medium'),

-- Dictionaries
('51100000-0000-0000-0000-000000000001', 'How do you access the value of key ''name'' in dict d?', 'd.name', 'd[name]', 'd[''name'']', 'd->name', 'c', 'Dictionary values are accessed using square brackets with the key as a string: d[''name'']', 'Dictionaries', 'easy'),

('51100000-0000-0000-0000-000000000001', 'What method returns all keys from a dictionary?', 'keys()', 'get_keys()', 'all_keys()', 'list()', 'a', 'The keys() method returns a view object containing all keys of the dictionary.', 'Dictionaries', 'easy'),

-- Loops
('51100000-0000-0000-0000-000000000001', 'What is the output of: for i in range(3): print(i)?', '1 2 3', '0 1 2', '0 1 2 3', '1 2', 'b', 'range(3) generates numbers from 0 to 2 (3 is exclusive), so it prints 0, 1, 2.', 'Loops', 'easy'),

('51100000-0000-0000-0000-000000000001', 'Which keyword is used to skip the current iteration in a loop?', 'skip', 'pass', 'continue', 'next', 'c', 'continue skips the rest of the current iteration and moves to the next iteration of the loop.', 'Loops', 'easy'),

('51100000-0000-0000-0000-000000000001', 'What does the ''break'' statement do in a loop?', 'Pauses the loop', 'Exits the loop completely', 'Skips to next iteration', 'Restarts the loop', 'b', 'break immediately exits the loop, regardless of the loop condition.', 'Loops', 'easy'),

-- Functions
('51100000-0000-0000-0000-000000000001', 'What keyword is used to define a function in Python?', 'function', 'func', 'def', 'define', 'c', 'Functions in Python are defined using the ''def'' keyword followed by the function name and parentheses.', 'Functions', 'easy'),

('51100000-0000-0000-0000-000000000001', 'What is the output of a function that doesn''t have a return statement?', '0', 'None', 'Empty string', 'Error', 'b', 'If a function doesn''t explicitly return a value, it implicitly returns None.', 'Functions', 'medium'),

('51100000-0000-0000-0000-000000000001', 'What does *args allow in a function definition?', 'Keyword arguments', 'Variable number of arguments', 'Default arguments', 'No arguments', 'b', '*args allows a function to accept any number of positional arguments as a tuple.', 'Functions', 'medium'),

-- Conditionals
('51100000-0000-0000-0000-000000000001', 'What is the correct syntax for an if statement in Python?', 'if (x > 5):', 'if x > 5 then:', 'if x > 5:', 'if x > 5 {', 'c', 'Python uses ''if condition:'' syntax without parentheses (though they''re allowed) and with a colon.', 'Conditionals', 'easy'),

('51100000-0000-0000-0000-000000000001', 'Which operator checks if two values are equal?', '=', '==', '===', 'equals()', 'b', '== is the equality operator. = is for assignment. Python doesn''t have === like JavaScript.', 'Conditionals', 'easy'),

-- List Comprehensions
('51100000-0000-0000-0000-000000000001', 'What is the output of: [x*2 for x in range(3)]?', '[0, 1, 2]', '[2, 4, 6]', '[0, 2, 4]', '[1, 2, 3]', 'c', 'This list comprehension multiplies each number in range(3) (0,1,2) by 2, giving [0, 2, 4].', 'List Comprehensions', 'medium'),

('51100000-0000-0000-0000-000000000001', 'What does [x for x in range(10) if x % 2 == 0] return?', '[0, 2, 4, 6, 8]', '[1, 3, 5, 7, 9]', '[2, 4, 6, 8, 10]', '[0, 1, 2, 3, 4]', 'a', 'This filters range(10) to only include even numbers (where x % 2 == 0).', 'List Comprehensions', 'medium'),

-- Exception Handling
('51100000-0000-0000-0000-000000000001', 'Which keyword is used to handle exceptions in Python?', 'catch', 'except', 'handle', 'error', 'b', 'Python uses try-except blocks for exception handling, unlike try-catch in other languages.', 'Exception Handling', 'medium'),

('51100000-0000-0000-0000-000000000001', 'What exception is raised when dividing by zero?', 'ValueError', 'ZeroDivisionError', 'ArithmeticError', 'MathError', 'b', 'ZeroDivisionError is raised when attempting to divide a number by zero.', 'Exception Handling', 'medium'),

-- OOP Basics
('51100000-0000-0000-0000-000000000001', 'What is the first parameter of instance methods in Python?', 'this', 'self', 'instance', 'object', 'b', 'By convention, the first parameter of instance methods is named ''self'' and refers to the instance.', 'OOP', 'medium'),

('51100000-0000-0000-0000-000000000001', 'Which method is called when an object is created?', '__init__', '__new__', '__create__', '__start__', 'a', '__init__ is the constructor method that initializes the object after it''s created.', 'OOP', 'medium'),

('51100000-0000-0000-0000-000000000001', 'How do you create a child class that inherits from Parent?', 'class Child extends Parent:', 'class Child(Parent):', 'class Child inherits Parent:', 'class Child : Parent', 'b', 'Python uses parentheses to indicate inheritance: class Child(Parent):', 'OOP', 'medium');

-- =============================================
-- SQL QUESTIONS (Sample - 25 questions)
-- =============================================

INSERT INTO skill_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) VALUES
-- Basic SELECT
('51100000-0000-0000-0000-000000000002', 'Which SQL keyword is used to retrieve data from a database?', 'GET', 'FETCH', 'SELECT', 'RETRIEVE', 'c', 'SELECT is the standard SQL command used to retrieve data from one or more tables.', 'SELECT', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Which clause is used to filter rows in a SELECT statement?', 'FILTER', 'WHERE', 'HAVING', 'CONDITION', 'b', 'WHERE clause filters rows before any grouping. HAVING filters after GROUP BY.', 'SELECT', 'easy'),

('51100000-0000-0000-0000-000000000002', 'How do you select all columns from a table named ''users''?', 'SELECT users', 'SELECT * FROM users', 'SELECT ALL FROM users', 'GET * FROM users', 'b', 'SELECT * FROM table_name retrieves all columns from the specified table.', 'SELECT', 'easy'),

-- WHERE Clause
('51100000-0000-0000-0000-000000000002', 'Which operator is used to check for NULL values?', '= NULL', '== NULL', 'IS NULL', 'EQUALS NULL', 'c', 'NULL values must be checked using IS NULL or IS NOT NULL, not with equality operators.', 'WHERE', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Which operator selects values within a range?', 'RANGE', 'BETWEEN', 'WITHIN', 'IN', 'd', 'BETWEEN...AND selects values within an inclusive range. IN checks against a list of values.', 'WHERE', 'easy'),

('51100000-0000-0000-0000-000000000002', 'What does the LIKE operator do?', 'Compares exact values', 'Performs pattern matching', 'Joins tables', 'Sorts results', 'b', 'LIKE is used for pattern matching with wildcards % (any characters) and _ (single character).', 'WHERE', 'easy'),

-- JOINs
('51100000-0000-0000-0000-000000000002', 'Which JOIN returns only matching rows from both tables?', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'c', 'INNER JOIN returns only rows where there is a match in both tables.', 'JOINs', 'medium'),

('51100000-0000-0000-0000-000000000002', 'Which JOIN returns all rows from the left table?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'b', 'LEFT JOIN returns all rows from the left table and matched rows from the right table.', 'JOINs', 'medium'),

('51100000-0000-0000-0000-000000000002', 'What is a CROSS JOIN?', 'Joins matching rows', 'Produces Cartesian product', 'Joins on multiple columns', 'Self-join', 'b', 'CROSS JOIN produces a Cartesian product - every row from first table paired with every row from second.', 'JOINs', 'medium'),

('51100000-0000-0000-0000-000000000002', 'What is a self-join?', 'Join with itself using aliases', 'Join without conditions', 'Join with primary key only', 'Automatic join', 'a', 'A self-join joins a table to itself, typically using table aliases to distinguish instances.', 'JOINs', 'hard'),

-- Aggregations
('51100000-0000-0000-0000-000000000002', 'Which function returns the number of rows?', 'SUM()', 'COUNT()', 'TOTAL()', 'NUM()', 'b', 'COUNT() returns the number of rows that match the specified criteria.', 'Aggregations', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Which clause groups rows that have the same values?', 'ORDER BY', 'GROUP BY', 'PARTITION BY', 'SORT BY', 'b', 'GROUP BY groups rows with the same values into summary rows for aggregate functions.', 'Aggregations', 'easy'),

('51100000-0000-0000-0000-000000000002', 'What is the difference between COUNT(*) and COUNT(column)?', 'No difference', 'COUNT(*) counts NULLs, COUNT(column) doesn''t', 'COUNT(column) is faster', 'COUNT(*) only works with SELECT *', 'b', 'COUNT(*) counts all rows including NULLs, while COUNT(column) only counts non-NULL values.', 'Aggregations', 'medium'),

('51100000-0000-0000-0000-000000000002', 'Which function returns the average value?', 'MEAN()', 'AVG()', 'AVERAGE()', 'MID()', 'b', 'AVG() is the SQL function that calculates the average of numeric values.', 'Aggregations', 'easy'),

-- ORDER BY
('51100000-0000-0000-0000-000000000002', 'How do you sort results in descending order?', 'ORDER BY column DESC', 'SORT BY column DESC', 'ORDER BY column DESCENDING', 'ORDER column DESC', 'a', 'ORDER BY column DESC sorts results in descending order. ASC is for ascending (default).', 'ORDER BY', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Can you ORDER BY a column not in SELECT?', 'Yes, always', 'No, never', 'Yes, unless using DISTINCT', 'Only with GROUP BY', 'c', 'Generally yes, but with DISTINCT, you can only order by columns in the SELECT list.', 'ORDER BY', 'medium'),

-- Subqueries
('51100000-0000-0000-0000-000000000002', 'What is a subquery?', 'A query within another query', 'A stored procedure', 'A view', 'A temporary table', 'a', 'A subquery (inner query) is a query nested inside another query (outer query).', 'Subqueries', 'medium'),

('51100000-0000-0000-0000-000000000002', 'Which operator checks if any value from subquery exists?', 'ANY', 'EXISTS', 'IN', 'All of the above', 'd', 'ANY, EXISTS, and IN can all check subquery results, but they work differently.', 'Subqueries', 'medium'),

-- Data Modification
('51100000-0000-0000-0000-000000000002', 'Which statement adds new rows to a table?', 'ADD', 'INSERT', 'APPEND', 'CREATE', 'b', 'INSERT INTO statement is used to add new rows of data to a table.', 'DML', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Which statement modifies existing data?', 'MODIFY', 'CHANGE', 'UPDATE', 'ALTER', 'c', 'UPDATE statement modifies existing records in a table. ALTER modifies table structure.', 'DML', 'easy'),

('51100000-0000-0000-0000-000000000002', 'Which statement removes rows from a table?', 'REMOVE', 'DELETE', 'DROP', 'TRUNCATE', 'b', 'DELETE removes specific rows. DROP removes entire table. TRUNCATE removes all rows but keeps structure.', 'DML', 'easy'),

-- Constraints
('51100000-0000-0000-0000-000000000002', 'What constraint ensures unique values in a column?', 'NOT NULL', 'UNIQUE', 'CHECK', 'DEFAULT', 'b', 'UNIQUE constraint ensures all values in a column are different.', 'Constraints', 'easy'),

('51100000-0000-0000-0000-000000000002', 'What is a PRIMARY KEY?', 'A unique identifier for each row', 'The first column', 'An auto-increment column', 'A foreign key reference', 'a', 'PRIMARY KEY uniquely identifies each record. It combines UNIQUE and NOT NULL constraints.', 'Constraints', 'easy'),

('51100000-0000-0000-0000-000000000002', 'What does a FOREIGN KEY do?', 'Creates unique values', 'Links two tables together', 'Prevents NULL values', 'Sorts data automatically', 'b', 'FOREIGN KEY establishes a link between data in two tables by referencing another table''s primary key.', 'Constraints', 'medium'),

-- Advanced
('51100000-0000-0000-0000-000000000002', 'What is the purpose of the HAVING clause?', 'Filter before grouping', 'Filter after grouping', 'Sort results', 'Join tables', 'b', 'HAVING filters groups after GROUP BY, while WHERE filters rows before grouping.', 'Aggregations', 'medium');
