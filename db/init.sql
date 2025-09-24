-- First, enable pgvector extension (only needs to be done once per DB)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create an enum for funding stage (cleaner than free text)
CREATE TYPE funding_stage AS ENUM (
  'Conceptual', 'Pre-seed', 'Seed',
  'Series A', 'Series B', 'Series C', 'Series D'
);

-- Create an enum for funds raised
CREATE TYPE funds_raised AS ENUM (
  '<$500K', '$500K-$1M', '$1M-$5M', '$5M-$10M', '>$10M'
);

-- Create startups table
CREATE TABLE startups (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  company_name TEXT NOT NULL,

  -- Founders and investors are JSONB for flexibility
  founders JSONB,                 -- e.g. [{ "name": "Alice", "linkedin": "..." }]
  investors JSONB,                -- e.g. [ "Investor A", "Investor B" ]

  -- Funding information
  funding_stage funding_stage,
  funds_raised funds_raised,
  ref_funding JSONB,              -- reference/notes about funding e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]

  -- Technology
  tech_offering TEXT,
  ref_tech JSONB,                 -- reference/notes about tech_offering e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]
  tech_embedding VECTOR(1536),    -- embedding for tech_offering

  -- Value proposition
  uvp TEXT,
  ref_uvp JSONB,                  -- reference/notes about uvp e.g. [ "Quote A (website.com)", "Quote B (website.org)" ]
  uvp_embedding VECTOR(1536)      -- embedding for uvp
);