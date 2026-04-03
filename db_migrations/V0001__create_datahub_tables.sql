
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'Оператор',
    status VARCHAR(20) NOT NULL DEFAULT 'Активен',
    dept VARCHAR(80),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rows_count INTEGER NOT NULL DEFAULT 0,
    size_mb NUMERIC(10,1) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Ок',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(80) NOT NULL,
    rows_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Готов',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed users
INSERT INTO users (name, email, role, status, dept, last_seen, created_at) VALUES
('Иван Петров', 'i.petrov@company.ru', 'Администратор', 'Активен', 'IT', NOW() - INTERVAL '5 min', NOW() - INTERVAL '120 days'),
('Мария Иванова', 'maria.ivanova@company.ru', 'Менеджер', 'Активен', 'Продажи', NOW() - INTERVAL '12 min', NOW() - INTERVAL '200 days'),
('Алексей Сидоров', 'a.sidorov@company.ru', 'Оператор', 'Активен', 'Логистика', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '90 days'),
('Елена Козлова', 'e.kozlova@company.ru', 'Аналитик', 'Неактивен', 'Финансы', NOW() - INTERVAL '3 days', NOW() - INTERVAL '300 days'),
('Дмитрий Новиков', 'd.novikov@company.ru', 'Менеджер', 'Активен', 'Маркетинг', NOW() - INTERVAL '20 min', NOW() - INTERVAL '60 days'),
('Ольга Морозова', 'o.morozova@company.ru', 'Оператор', 'Активен', 'Продажи', NOW() - INTERVAL '45 min', NOW() - INTERVAL '150 days'),
('Сергей Волков', 's.volkov@company.ru', 'Аналитик', 'Активен', 'IT', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '400 days'),
('Анна Попова', 'a.popova@company.ru', 'Администратор', 'Активен', 'Финансы', NOW() - INTERVAL '8 min', NOW() - INTERVAL '500 days'),
('Роман Лебедев', 'r.lebedev@company.ru', 'Оператор', 'Неактивен', 'Логистика', NOW() - INTERVAL '5 days', NOW() - INTERVAL '250 days'),
('Наталья Семёнова', 'n.semenova@company.ru', 'Менеджер', 'Активен', 'Маркетинг', NOW() - INTERVAL '30 min', NOW() - INTERVAL '180 days'),
('Павел Егоров', 'p.egorov@company.ru', 'Оператор', 'Активен', 'Продажи', NOW() - INTERVAL '15 min', NOW() - INTERVAL '75 days'),
('Виктория Фёдорова', 'v.fedorova@company.ru', 'Аналитик', 'Активен', 'Финансы', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '330 days');

-- Seed data_tables
INSERT INTO data_tables (name, rows_count, size_mb, status, updated_at) VALUES
('orders', 12045, 24.3, 'Ок', NOW() - INTERVAL '2 min'),
('customers', 4891, 8.1, 'Ок', NOW() - INTERVAL '5 min'),
('products', 2340, 3.9, 'Ок', NOW() - INTERVAL '8 min'),
('invoices', 8762, 18.6, 'Ок', NOW() - INTERVAL '1 min'),
('payments', 15390, 31.2, 'Ок', NOW() - INTERVAL '15 min'),
('shipments', 6120, 12.4, 'Ок', NOW() - INTERVAL '3 min'),
('categories', 89, 0.1, 'Ок', NOW() - INTERVAL '44 min'),
('suppliers', 234, 0.4, 'Ок', NOW() - INTERVAL '22 min'),
('warehouse', 1560, 2.6, 'Предупреждение', NOW() - INTERVAL '7 min'),
('employees', 148, 0.3, 'Ок', NOW() - INTERVAL '60 min'),
('contracts', 430, 0.7, 'Ок', NOW() - INTERVAL '11 min'),
('tasks', 2890, 4.8, 'Ошибка', NOW() - INTERVAL '30 min');

-- Seed reports
INSERT INTO reports (name, type, rows_count, status, updated_at) VALUES
('Продажи за квартал', 'Финансовый', 4520, 'Готов', NOW() - INTERVAL '3 hours'),
('KPI сотрудников', 'HR', 148, 'Готов', NOW() - INTERVAL '4 hours'),
('Складские остатки', 'Логистика', 8900, 'Устарел', NOW() - INTERVAL '1 day'),
('Дебиторская задолженность', 'Финансовый', 234, 'Готов', NOW() - INTERVAL '1 hour'),
('Воронка продаж', 'Маркетинг', 890, 'Генерация', NOW() - INTERVAL '5 min');
