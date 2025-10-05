-- First, enable pgvector extension (only needs to be done once per DB)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create an enum for funding stage (cleaner than free text)
CREATE TYPE funding_stage AS ENUM(
    'Conceptual',
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Series D'
);

-- Create an enum for funds raised
CREATE TYPE funds_raised AS ENUM(
    '<$500K',
    '$500K-$1M',
    '$1M-$5M',
    '$5M-$10M',
    '>$10M'
);

CREATE TYPE num_employees AS ENUM('1-10', '11-50', '51-100', '101-1000', '>1000');

CREATE TYPE trl AS ENUM('TRL 1-4', 'TRL 5-7', 'TRL 8-9');

-- Create startups table
CREATE TABLE
    startups (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_name TEXT,
        company_website TEXT UNIQUE,
        year_founded VARCHAR(4),
        country TEXT,
        num_employees num_employees,
        -- Founders and investors are JSONB for flexibility
        founders JSONB, -- e.g. [{ "name": "Alice", "linkedin": "..." }]
        investors JSONB, -- e.g. [ "Investor A", "Investor B" ]
        -- Funding information
        funding_stage funding_stage,
        funds_raised funds_raised,
        ref_funding JSONB, -- reference/notes about funding e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]
        -- Technology
        tech_offering TEXT,
        ref_tech JSONB, -- reference/notes about tech_offering e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]
        tech_embedding VECTOR (1536), -- embedding for tech_offering
        -- Value proposition
        uvp TEXT,
        ref_uvp JSONB, -- reference/notes about uvp e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]
        uvp_embedding VECTOR (1536), -- embedding for uvp
        trl trl,
        trl_explanation TEXT,
        competitors JSONB,
        use_cases JSONB
    );

-- Workstreams table
CREATE TABLE
    workstreams (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        use_case TEXT,
        challenge TEXT,
        technologies JSONB,
        overall_recommendation TEXT,
        create_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Singapore')
    );

-- Workstream ↔ Startup Evaluation table (edge with properties)
CREATE TABLE
    workstream_startup_evaluations (
        workstream_id INT NOT NULL REFERENCES workstreams (id) ON DELETE CASCADE,
        startup_id INT NOT NULL REFERENCES startups (id) ON DELETE CASCADE,
        competitive_advantage TEXT,
        risks TEXT,
        collaboration_potential TEXT,
        PRIMARY KEY (workstream_id, startup_id)
    );