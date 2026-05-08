
-- MEDIA
create table public.media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('photo','video')),
  url text not null,
  title text,
  show_in_gallery boolean not null default true,
  show_in_carousel boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.media enable row level security;
create policy "media public read" on public.media for select using (true);

-- SERVICES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text,
  image_url text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
create policy "services public read" on public.services for select using (true);

-- CONTACT ENQUIRIES
create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_enquiries enable row level security;
create policy "contact insert public" on public.contact_enquiries for insert with check (true);

-- APPOINTMENT ENQUIRIES
create table public.appointment_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service_id uuid,
  service_name text,
  description text,
  created_at timestamptz not null default now()
);
alter table public.appointment_enquiries enable row level security;
create policy "appointment insert public" on public.appointment_enquiries for insert with check (true);

-- SITE SETTINGS (single row)
create table public.site_settings (
  id int primary key default 1,
  email text not null default 'info@pmds.com',
  whatsapp_number text not null default '919999999999',
  phone_number text not null default '919999999999',
  address text not null default '123 Main Street, Your City',
  map_embed_url text not null default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0!2d77.0!3d28.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDAwJzAwLjAiTiA3N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000',
  about_content text not null default 'Perfect Motor Driving School (PMDS) is dedicated to providing top-quality driver education with certified instructors, modern vehicles, and a proven curriculum.',
  constraint single_row check (id = 1)
);
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select using (true);
insert into public.site_settings (id) values (1);

-- Storage bucket for uploads
insert into storage.buckets (id, name, public) values ('media','media', true);
create policy "media bucket public read" on storage.objects for select using (bucket_id = 'media');
create policy "media bucket public write" on storage.objects for insert with check (bucket_id = 'media');
create policy "media bucket public update" on storage.objects for update using (bucket_id = 'media');
create policy "media bucket public delete" on storage.objects for delete using (bucket_id = 'media');

-- Seed services
insert into public.services (name, description, price, icon, sort_order) values
('LMV Car Training','Comprehensive light motor vehicle training for beginners. 21-day course.','₹6,500','car',1),
('Two-Wheeler Training','Learn to ride scooter or motorcycle confidently with certified instructors.','₹3,500','bike',2),
('License Assistance','End-to-end help with learner''s license and permanent driving license.','₹1,500','badge',3),
('Refresher Course','Short course for licensed drivers wanting to brush up their skills.','₹2,500','refresh',4);
