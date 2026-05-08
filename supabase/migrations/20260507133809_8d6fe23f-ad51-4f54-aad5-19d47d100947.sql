
create policy "media all" on public.media for all using (true) with check (true);
create policy "services all" on public.services for all using (true) with check (true);
create policy "settings all" on public.site_settings for all using (true) with check (true);
create policy "contact all" on public.contact_enquiries for all using (true) with check (true);
create policy "appointment all" on public.appointment_enquiries for all using (true) with check (true);

insert into public.media (type, url, title, sort_order) values
('photo','/seed/1.jpg','Driving lesson with instructor',1),
('photo','/seed/2.jpg','Our training fleet',2),
('photo','/seed/3.jpg','Open road practice',3),
('photo','/seed/4.jpg','Student receiving license',4);
