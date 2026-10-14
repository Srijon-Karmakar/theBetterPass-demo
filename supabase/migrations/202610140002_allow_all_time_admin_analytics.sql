-- "All time" on the admin analytics dashboard asks for a range of several years. The summary function refused
-- anything longer than 400 days, so raise that limit. The function is rewritten in place from its installed
-- definition, so this works whichever earlier version of it is currently deployed. Permissions are kept.
do $$
declare
    fn_def text;
begin
    select pg_get_functiondef('public.admin_analytics_summary(timestamptz, timestamptz, text)'::regprocedure)
    into fn_def;

    fn_def := replace(fn_def, 'interval ''400 days''', 'interval ''4000 days''');
    execute fn_def;
end;
$$;
