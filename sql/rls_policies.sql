-- Row Level Security (RLS) Policies for Roadside Rescue
-- Run this in your Supabase SQL Editor after creating the tables

-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- REQUESTS TABLE POLICIES
-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own requests
CREATE POLICY "Users can update their own requests"
  ON requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow technicians to view assigned requests
CREATE POLICY "Technicians can view assigned requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM technicians
      WHERE technicians.id = requests.assigned_technician
      AND technicians.id = auth.uid()
    )
  );

-- Allow technicians to update assigned requests
CREATE POLICY "Technicians can update assigned requests"
  ON requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM technicians
      WHERE technicians.id = requests.assigned_technician
      AND technicians.id = auth.uid()
    )
  );

-- TECHNICIANS TABLE POLICIES
-- Anyone can view available technicians (for finding nearby techs)
CREATE POLICY "Anyone can view technicians"
  ON technicians FOR SELECT
  USING (true);

-- Technicians can update their own profile
CREATE POLICY "Technicians can update their own profile"
  ON technicians FOR UPDATE
  USING (auth.uid() = id);

-- Technicians can insert their own profile
CREATE POLICY "Technicians can insert their own profile"
  ON technicians FOR INSERT
  WITH CHECK (auth.uid() = id);

-- VEHICLES TABLE POLICIES
-- Users can view their own vehicles
CREATE POLICY "Users can view their own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own vehicles
CREATE POLICY "Users can create their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vehicles
CREATE POLICY "Users can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

-- FUEL_REQUESTS TABLE POLICIES
-- Users can view fuel requests for their requests
CREATE POLICY "Users can view their fuel requests"
  ON fuel_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = fuel_requests.request_id
      AND requests.user_id = auth.uid()
    )
  );

-- Users can create fuel requests for their requests
CREATE POLICY "Users can create fuel requests"
  ON fuel_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = fuel_requests.request_id
      AND (requests.user_id = auth.uid() OR requests.user_id IS NULL)
    )
  );

-- REVIEWS TABLE POLICIES
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews for their requests
CREATE POLICY "Users can create reviews for their requests"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = reviews.request_id
      AND requests.user_id = auth.uid()
    )
  );

-- SERVICES TABLE - No RLS needed (public catalog)
-- Services are public and don't need RLS
