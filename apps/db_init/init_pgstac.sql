CREATE EXTENSION postgis;
CREATE EXTENSION pgstac;

-- Verify the installation
SELECT * FROM pg_available_extensions WHERE name IN ('postgis', 'pgstac');
