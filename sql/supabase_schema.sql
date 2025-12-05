-- supabase_schema.sql

-- 1) technicians
create table if not exists technicians (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  vehicle_type text, -- bike / van / car
  rating numeric(2,1) default 5.0,
  is_available boolean default true,
  lat numeric,
  lon numeric,
  created_at timestamptz default now()
);

-- 2) services (catalog)
create table if not exists services (
  id serial primary key,
  key text unique not null,
  title text not null,
  base_price numeric default 100,
  estimated_time_minutes int default 30
);

insert into services(key, title, base_price, estimated_time_minutes)
values
('puncture_repair', 'Puncture Repair', 120, 30),
('stepney_change', 'Stepney Change', 150, 20),
('tube_replacement', 'Tube Replacement', 200, 40),
('air_fill', 'Air Fill', 80, 10),
('fuel_delivery', 'Fuel Delivery', 200, 15)
on conflict do nothing;

-- 3) vehicles
create table if not exists vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- reference to auth user (use supabase auth)
  type text, -- car / bike / scooter
  model text,
  reg_number text,
  created_at timestamptz default now()
);

-- 4) requests (bookings)
create table if not exists requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- null if guest; link to supabase auth id if available
  service_id int references services(id),
  vehicle_type text, -- car/bike/scooter
  description text,
  status text default 'pending', -- pending / accepted / in_progress / completed / cancelled
  lat numeric not null,
  lon numeric not null,
  address text,
  assigned_technician uuid references technicians(id),
  estimated_price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5) fuel_requests (detail)
create table if not exists fuel_requests (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references requests(id) on delete cascade,
  fuel_type text, -- petrol/diesel
  litres numeric,
  price_per_litre numeric,
  delivered boolean default false
);

-- 6) reviews
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references requests(id),
  user_id uuid,
  rating int check (rating >=1 and rating <=5),
  comment text,
  created_at timestamptz default now()
);

-- 7) add index for quick geo queries
create index if not exists idx_technicians_location on technicians (lat, lon);
create index if not exists idx_requests_location on requests (lat, lon);
alter table requests
add column payment_status text default 'pending',   -- pending/paid/failed
add column price numeric default 0,
add column razorpay_order_id text,
add column razorpay_payment_id text;
ALTER TABLE technicians 
ADD COLUMN current_lat numeric,
ADD COLUMN current_lon numeric,
ADD COLUMN tech_status text DEFAULT 'idle';
