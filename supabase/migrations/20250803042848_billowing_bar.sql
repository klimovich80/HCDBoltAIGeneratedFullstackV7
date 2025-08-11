/*
  # Seed Data for Equestrian CRM

  This migration adds sample data for development and demonstration purposes.
  
  1. Sample Users
    - Admin user
    - trainers
    - Members with different tiers
    
  2. Sample Horses
    - Various breeds and ages
    - Different boarding types
    - Medical status examples
    
  3. Sample Lessons
    - Different lesson types
    - Various statuses
    
  4. Sample Equipment
    - Different categories and conditions
    
  5. Sample Events
    - Competitions and clinics
*/

-- Insert sample users (these will need to be created through Supabase auth first)
INSERT INTO users (id, first_name, last_name, email, phone, role, membership_tier, emergency_contact_name, emergency_contact_phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin@equestrian.com', '+1-555-0001', 'admin', null, 'Emergency Contact', '+1-555-9999'),
  ('22222222-2222-2222-2222-222222222222', 'Sarah', 'Johnson', 'sarah.trainer@equestrian.com', '+1-555-0002', 'trainer', null, 'Mike Johnson', '+1-555-9998'),
  ('33333333-3333-3333-3333-333333333333', 'Michael', 'Chen', 'michael.trainer@equestrian.com', '+1-555-0003', 'trainer', null, 'Lisa Chen', '+1-555-9997'),
  ('44444444-4444-4444-4444-444444444444', 'Emma', 'Williams', 'emma@email.com', '+1-555-0004', 'member', 'premium', 'David Williams', '+1-555-9996'),
  ('55555555-5555-5555-5555-555555555555', 'James', 'Brown', 'james@email.com', '+1-555-0005', 'member', 'basic', 'Mary Brown', '+1-555-9995'),
  ('66666666-6666-6666-6666-666666666666', 'Sophie', 'Davis', 'sophie@email.com', '+1-555-0006', 'member', 'elite', 'Tom Davis', '+1-555-9994'),
  ('77777777-7777-7777-7777-777777777777', 'Robert', 'Wilson', 'robert@email.com', '+1-555-0007', 'member', 'premium', 'Jane Wilson', '+1-555-9993')
ON CONFLICT (id) DO NOTHING;

-- Insert sample horses
INSERT INTO horses (id, name, breed, age, gender, color, owner_id, boarding_type, stall_number, medical_notes, vaccination_status, last_vet_visit) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thunder', 'Thoroughbred', 8, 'gelding', 'Bay', '44444444-4444-4444-4444-444444444444', 'full', 'S01', 'No known allergies. Regular exercise required.', 'current', '2024-11-15'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Moonlight', 'Arabian', 12, 'mare', 'Gray', '55555555-5555-5555-5555-555555555555', 'full', 'S02', 'Arthritis in left front leg. Requires joint supplements.', 'current', '2024-11-10'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Star', 'Quarter Horse', 6, 'mare', 'Chestnut', '66666666-6666-6666-6666-666666666666', 'partial', 'S03', 'Healthy horse, no current medical issues.', 'due', '2024-10-20'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Blaze', 'Paint Horse', 10, 'gelding', 'Pinto', '77777777-7777-7777-7777-777777777777', 'full', 'S04', 'Sensitive to certain feeds. See dietary notes.', 'current', '2024-11-12'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Spirit', 'Mustang', 7, 'stallion', 'Black', null, 'pasture', null, 'School horse - excellent temperament for beginners.', 'current', '2024-11-08'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Belle', 'Tennessee Walker', 9, 'mare', 'Palomino', '44444444-4444-4444-4444-444444444444', 'full', 'S05', 'Regular dental work required. Very gentle.', 'overdue', '2024-09-15')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (id, title, description, instructor_id, horse_id, member_id, scheduled_date, duration_minutes, lesson_type, status, cost) VALUES
  ('l1111111-1111-1111-1111-111111111111', 'Beginner Riding Lesson', 'Introduction to basic riding techniques', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '2024-12-20 10:00:00+00', 60, 'private', 'scheduled', 85.00),
  ('l2222222-2222-2222-2222-222222222222', 'Advanced Dressage', 'Working on collected gaits and transitions', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '2024-12-20 14:00:00+00', 90, 'private', 'scheduled', 120.00),
  ('l3333333-3333-3333-3333-333333333333', 'Group Trail Ride', 'Scenic trail ride for intermediate riders', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', '2024-12-21 09:00:00+00', 120, 'group', 'scheduled', 65.00),
  ('l4444444-4444-4444-4444-444444444444', 'Jumping Training', 'Basic jumping techniques and safety', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', '2024-12-19 16:00:00+00', 75, 'training', 'completed', 95.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, title, description, event_type, start_date, end_date, organizer_id, max_participants, registration_fee) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Winter Dressage Competition', 'Annual winter dressage competition for all levels', 'competition', '2024-12-28 08:00:00+00', '2024-12-28 18:00:00+00', '22222222-2222-2222-2222-222222222222', 50, 45.00),
  ('e2222222-2222-2222-2222-222222222222', 'Jumping Clinic with Expert trainer', 'Two-day intensive jumping clinic', 'clinic', '2025-01-15 09:00:00+00', '2025-01-16 17:00:00+00', '33333333-3333-3333-3333-333333333333', 20, 180.00),
  ('e3333333-3333-3333-3333-333333333333', 'New Year Social Ride', 'Celebratory group ride and BBQ', 'social', '2025-01-01 11:00:00+00', '2025-01-01 16:00:00+00', '22222222-2222-2222-2222-222222222222', 30, 25.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (id, name, category, brand, condition, assigned_horse_id, cost, current_value) VALUES
  ('eq111111-1111-1111-1111-111111111111', 'English All-Purpose Saddle', 'saddle', 'Wintec', 'excellent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 850.00, 600.00),
  ('eq222222-2222-2222-2222-222222222222', 'Dressage Bridle', 'bridle', 'Stubben', 'good', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 320.00, 250.00),
  ('eq333333-3333-3333-3333-333333333333', 'Western Saddle', 'saddle', 'Circle Y', 'good', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1200.00, 900.00),
  ('eq444444-4444-4444-4444-444444444444', 'Training Halter', 'halter', 'Tough-1', 'excellent', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 35.00, 30.00),
  ('eq555555-5555-5555-5555-555555555555', 'Winter Blanket', 'blanket', 'Rambo', 'fair', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 180.00, 100.00),
  ('eq666666-6666-6666-6666-666666666666', 'Jumping Boots (Set)', 'boot', 'Professional Choice', 'excellent', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 120.00, 100.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, member_id, amount, payment_type, payment_method, status, due_date, paid_date, description) VALUES
  ('p1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 340.00, 'boarding', 'card', 'paid', '2024-12-01', '2024-11-28', 'Monthly boarding fee for Thunder'),
  ('p2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 85.00, 'lesson', 'cash', 'paid', '2024-12-19', '2024-12-19', 'Private lesson with Sarah'),
  ('p3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 420.00, 'boarding', 'transfer', 'pending', '2024-12-01', null, 'Monthly boarding fee for Star'),
  ('p4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 45.00, 'event', 'card', 'paid', '2024-12-28', '2024-12-15', 'Winter Dressage Competition registration')
ON CONFLICT (id) DO NOTHING;

-- Insert sample feed records
INSERT INTO feed_records (id, horse_id, feed_type, amount, unit, feeding_time, fed_by, supplements) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Timothy Hay', 2.5, 'flakes', '2024-12-19 07:00:00+00', '22222222-2222-2222-2222-222222222222', 'Joint supplement'),
  ('f2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Senior Feed', 3.0, 'cups', '2024-12-19 07:30:00+00', '22222222-2222-2222-2222-222222222222', 'Arthritis support, Vitamin E'),
  ('f3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Alfalfa Hay', 2.0, 'flakes', '2024-12-19 18:00:00+00', '33333333-3333-3333-3333-333333333333', null),
  ('f4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Grain Mix', 2.5, 'cups', '2024-12-19 18:30:00+00', '33333333-3333-3333-3333-333333333333', 'Digestive support')
ON CONFLICT (id) DO NOTHING;

-- Insert sample stall assignments
INSERT INTO stall_assignments (id, stall_number, horse_id, assigned_date, monthly_rate, isActive) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'S01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-11-01', 340.00, true),
  ('s2222222-2222-2222-2222-222222222222', 'S02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-10-15', 340.00, true),
  ('s3333333-3333-3333-3333-333333333333', 'S03', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-11-10', 280.00, true),
  ('s4444444-4444-4444-4444-444444444444', 'S04', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-09-01', 340.00, true),
  ('s5555555-5555-5555-5555-555555555555', 'S05', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-08-15', 340.00, true)
ON CONFLICT (id) DO NOTHING;