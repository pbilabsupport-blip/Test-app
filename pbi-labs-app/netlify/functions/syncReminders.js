const {
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  assertReminderCaller,
  publicError
} = require('./_lib');

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event) || {};
    const supabase = getSupabaseAdmin();
    const caller = await assertReminderCaller(supabase, body);
    if (!caller) return json(401, { success: false, code: 'UNAUTHORIZED', error: 'Sign in again before saving reminders.' });

    const tone = ['gentle', 'direct', 'urgent'].includes(body.tone) ? body.tone : 'direct';
    const leadDays = Math.max(0, Math.min(14, Number(body.leadDays) || 1));
    const language = body.language === 'es' ? 'es' : 'en';
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

    const { error: deleteError } = await supabase.from('payment_reminders').delete().eq('email', caller.email);
    if (deleteError) throw deleteError;

    if (items.length) {
      const rows = items
        .filter((item) => item && item.nextDate && item.name)
        .map((item) => ({
          email: caller.email,
          item_key: String(item.itemKey || item.name).slice(0, 80),
          name: String(item.name).slice(0, 120),
          amount: Number(item.amount) || 0,
          next_date: String(item.nextDate).slice(0, 10),
          kind: 'liability',
          tone,
          lead_days: leadDays,
          language
        }));
      if (rows.length) {
        const { error } = await supabase.from('payment_reminders').insert(rows);
        if (error) throw error;
      }
    }

    return json(200, { success: true });
  } catch (error) {
    return publicError(error);
  }
};
