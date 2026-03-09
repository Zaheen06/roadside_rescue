-- Add Car Tow Service to services table
-- Pricing: ₹25/km + ₹50 service charge (base_price = service charge only)
INSERT INTO services(key, title, base_price, estimated_time_minutes)
VALUES ('car_tow', 'Car Tow Service', 50, 60)
ON CONFLICT(key) DO NOTHING;

-- Add a column to requests table to store destination coords for tow service
ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS dest_lat numeric,
  ADD COLUMN IF NOT EXISTS dest_lon numeric,
  ADD COLUMN IF NOT EXISTS dest_address text,
  ADD COLUMN IF NOT EXISTS distance_km numeric,
  ADD COLUMN IF NOT EXISTS price numeric;
