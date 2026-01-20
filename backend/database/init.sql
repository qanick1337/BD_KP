CREATE DATABASE IF NOT EXISTS course_project
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE course_project;

DROP TABLE IF EXISTS application;
DROP TABLE IF EXISTS vacancy_category;
DROP TABLE IF EXISTS vacancy_skill;
DROP TABLE IF EXISTS vacancy;
DROP TABLE IF EXISTS experience;
DROP TABLE IF EXISTS candidate_skill;
DROP TABLE IF EXISTS candidate;
DROP TABLE IF EXISTS company_user;
DROP TABLE IF EXISTS company_auth;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS skill;
DROP TABLE IF EXISTS application_status;
DROP TABLE IF EXISTS vacancy_status;
DROP TABLE IF EXISTS employment_type;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS country;

CREATE TABLE country (
    country_id     INT PRIMARY KEY AUTO_INCREMENT,
    country_name   VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE city (
    city_id     INT PRIMARY KEY AUTO_INCREMENT,
    country_id  INT NOT NULL,
    city_name   VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (country_id) REFERENCES country(country_id)
);

CREATE TABLE employment_type (
    employment_type_id   INT PRIMARY KEY AUTO_INCREMENT,
    employment_type_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE vacancy_status (
    vacancy_status_id    INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_status_name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE application_status (
    application_status_id    INT PRIMARY KEY AUTO_INCREMENT,
    application_status_name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE skill (
    skill_id    INT PRIMARY KEY AUTO_INCREMENT,
    skill_name  VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE category (
    category_id     INT PRIMARY KEY AUTO_INCREMENT,
    category_name   VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE company (
    company_id           INT PRIMARY KEY AUTO_INCREMENT,
    company_name         VARCHAR(200) NOT NULL,
    number_of_employees  INT DEFAULT (0),
    company_site         VARCHAR(200),
    phone_number         VARCHAR(50),
    company_description  TEXT
);

CREATE TABLE company_auth (
    company_id   INT PRIMARY KEY NOT NULL,
    login_email  VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE company_user (
    company_user_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id      INT NOT NULL,
    user_email      VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    surname         VARCHAR(100) NOT NULL,
    patronymic      VARCHAR(100),
    phone_number    VARCHAR(50),
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

CREATE TABLE candidate (
    candidate_id        INT PRIMARY KEY AUTO_INCREMENT,
    city_id             INT NOT NULL,
    employment_type_id  INT NOT NULL,
    position            VARCHAR(200) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    surname             VARCHAR(100) NOT NULL,
    patronymic          VARCHAR(100),
    sex                 VARCHAR(10),
    candidate_email     VARCHAR(150) NOT NULL UNIQUE,
    phone_number        VARCHAR(50),
    expected_salary     FLOAT DEFAULT 1,
    FOREIGN KEY (city_id) REFERENCES city(city_id),
    FOREIGN KEY (employment_type_id) REFERENCES employment_type(employment_type_id)
);

CREATE TABLE experience (
    experience_id   INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id    INT NOT NULL,
    company_id      INT NOT NULL,
    position        VARCHAR(200) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    description     TEXT,
    FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id)   REFERENCES company(company_id)
);

CREATE TABLE vacancy (
    vacancy_id          INT PRIMARY KEY AUTO_INCREMENT,
    company_user_id     INT NULL,
    city_id             INT NOT NULL,
    employment_type_id  INT NOT NULL,
    vacancy_status_id   INT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    salary_min          FLOAT NOT NULL,
    salary_max          FLOAT NOT NULL,
    salary_comment      TEXT,
    created_at          DATE DEFAULT (CURDATE()),
    FOREIGN KEY (company_user_id)    REFERENCES company_user(company_user_id) ON DELETE SET NULL,
    FOREIGN KEY (city_id)            REFERENCES city(city_id),
    FOREIGN KEY (employment_type_id) REFERENCES employment_type(employment_type_id),
    FOREIGN KEY (vacancy_status_id)  REFERENCES vacancy_status(vacancy_status_id)
);

CREATE TABLE vacancy_skill (
    vacancy_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id         INT NOT NULL,
    vacancy_id       INT NOT NULL,
    FOREIGN KEY (skill_id)   REFERENCES skill(skill_id),
    FOREIGN KEY (vacancy_id) REFERENCES vacancy(vacancy_id) ON DELETE CASCADE,
    UNIQUE (vacancy_id, skill_id)
);

CREATE TABLE candidate_skill  (
    candidate_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id           INT NOT NULL,
    candidate_id       INT NOT NULL,
    FOREIGN KEY (skill_id)     REFERENCES skill(skill_id),
    FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    UNIQUE (candidate_id, skill_id)
);

CREATE TABLE vacancy_category (
    vacancy_category_id INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_id          INT NOT NULL,
    category_id         INT NOT NULL,
    FOREIGN KEY (vacancy_id) REFERENCES vacancy(vacancy_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    UNIQUE (vacancy_id, category_id)
);

CREATE TABLE application (
    application_id        INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id          INT NOT NULL,
    vacancy_id            INT NOT NULL,
    application_status_id INT NOT NULL,
    comment               TEXT,
    FOREIGN KEY (candidate_id)          REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id)            REFERENCES vacancy(vacancy_id)   ON DELETE CASCADE,
    FOREIGN KEY (application_status_id) REFERENCES application_status(application_status_id)
);

INSERT INTO country (country_name) VALUES ('Ukraine');

INSERT INTO employment_type (employment_type_name) VALUES 
    ('Full-time'), ('Part-time'), ('Remote');

INSERT INTO vacancy_status (vacancy_status_name) VALUES 
    ('Active'), ('On Hold'), ('Closed'), ('Filled'), ('Draft'), ('Archived');

INSERT INTO application_status (application_status_name) VALUES
    ('New'), ('In Review'), ('Interview'), ('Offer'), ('Rejected'), ('Accepted');

INSERT INTO city (city_name, country_id) VALUES
    ('Вінниця', 1), ('Дніпро', 1), ('Донецьк', 1), ('Житомир', 1), ('Запоріжжя', 1),
    ('Івано-Франківськ', 1), ('Кропивницький', 1), ('Луганськ', 1), ('Львів', 1),
    ('Миколаїв', 1), ('Одеса', 1), ('Полтава', 1), ('Рівне', 1), ('Суми', 1),
    ('Тернопіль', 1), ('Ужгород', 1), ('Харків', 1), ('Херсон', 1), ('Хмельницький', 1),
    ('Черкаси', 1), ('Чернівці', 1), ('Чернігів', 1), ('Київ', 1), ('Сімферополь', 1);

INSERT INTO company (company_name, number_of_employees, company_site, phone_number, company_description) VALUES 
    ('SoftVision', 120, 'https://softvision.com', '+380671112233', 'IT компанія, що займається аутсорсом.'),
    ('RetailHub', 540, 'https://retailhub.ua', '+380501234567', 'Мережа магазинів електроніки.'),
    ('AgroTech Solutions', 85, 'https://agrotech.ua', '+380931112244', 'Інновації в агросекторі.');

INSERT INTO company_auth (company_id, login_email, password) VALUES
    (1, 'admin@softvision.com', '$2b$10$RXXzxokVf09HsgRtRPuYAu18MaAmiE519.PS87mjsyHWf7EWuxHBO'), -- Пароль: 123456 (оновлений хеш)
    (2, 'owner@retailhub.ua', 'qwerty123'),
    (3, 'info@agrotech.ua', 'password1');

INSERT INTO company_user (company_id, user_email, password, name, surname, patronymic, phone_number) VALUES
    (1, 'hr1@softvision.com', 'hr12345', 'Олена', 'Коваль', 'Петрівна', '+380671234567'),
    (1, 'hr2@softvision.com', 'hr98765', 'Іван', 'Демченко', NULL, '+380501112233'),
    (2, 'recruit@retailhub.ua', 'retail123', 'Марія', 'Сидоренко', 'Іванівна', '+380931232345'),
    (3, 'staff@agrotech.ua', 'agro111', 'Олег', 'Ткаченко', NULL, '+380937778899'),
    (1, 'softtelevik@gmail.com', 'oleg12488', 'Pet', 'Bright', NULL, '420723218923');

INSERT INTO skill (skill_name) VALUES
('JavaScript'), ('TypeScript'), ('React'), ('Vue.js'), ('Angular'), ('Node.js'), ('Express.js'), ('Next.js'),
('HTML'), ('CSS'), ('SASS/SCSS'), ('Tailwind CSS'), ('Bootstrap'), ('Redux'), ('SQL'), ('MySQL'), ('PostgreSQL'),
('MongoDB'), ('Git'), ('Docker'), ('Python'), ('Django'), ('Flask'), ('Java'), ('Spring Boot'), ('C#'), ('.NET Core'),
('PHP'), ('Laravel'), ('Project Management'), ('Scrum'), ('Agile'), ('UI/UX Design'), ('Figma'), ('DevOps'), ('AWS');

INSERT INTO category (category_name) VALUES
('Веб-розробка'), ('Бекенд-розробка'), ('Фронтенд-розробка'), ('Фулстек-розробка'), ('Мобільна розробка'),
('DevOps'), ('UI/UX дизайн'), ('QA'), ('Data Science'), ('Маркетинг'), ('HR'), ('Фінанси');

INSERT INTO candidate (city_id, employment_type_id, position, name, surname, patronymic, sex, candidate_email, phone_number, expected_salary) VALUES
(1, 3, 'Frontend Developer', 'Іван', 'Петренко', 'Олегович', 'male', 'ivan.petrenko@gmail.com', '+380631112233', 1500),
(2, 1, 'Backend Developer', 'Марія', 'Сидоренко', 'Петрівна', 'female', 'maria.sydorenko@gmail.com', '+380671234567', 1800),
(3, 1, 'QA Engineer', 'Олег', 'Даниленко', NULL, 'male', 'oleh.danylenko@gmail.com', '+380931112244', 1200),
(5, 3, 'UX/UI Designer', 'Христина', 'Мельник', NULL, 'female', 'melnyk.design@gmail.com', '+380501234999', 1400),
(4, 2, 'Project Manager', 'Андрій', 'Ткаченко', 'Іванович', 'male', 'andrii.pm@gmail.com', '+380931112220', 2000),
(1, 1, 'DevOps Engineer', 'Юрій', 'Бондар', NULL, 'male', 'bondar.devops@gmail.com', '+380671112200', 2500);

INSERT INTO candidate_skill (skill_id, candidate_id) VALUES
(1,1),(3,1),(9,1),(10,1),
(6,2),(15,2),(16,2),(19,2),
(15,3),(30,3),(31,3),
(33,4),(34,4),(10,4);

INSERT INTO vacancy (company_user_id, city_id, employment_type_id, vacancy_status_id, title, description, salary_min, salary_max) 
VALUES (1, 1, 1, 1, 'Senior Node.js Developer', 'We are looking for...', 3000, 5000);