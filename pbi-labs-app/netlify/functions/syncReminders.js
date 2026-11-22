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
    if (!caller) {
      return json(401, {
        success: false,
        code: 'UNAUTHORIZED',
        error: 'Sign in again before saving reminders.'
      });
    }

    const tone = ['gentle', 'direct', 'urgent'].includes(body.tone) ? body.tone : 'direct';
    const rawLead = Number(body.leadDays);
    const leadDays = Number.isFinite(rawLead) ? Math.max(0, Math.min(14, Math.round(rawLead))) : 1;
    const language = body.language === 'es' ? 'es' : 'en';
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

    // Deduplicate by item_key and validate dates
    const rowMap = new Map();
    for (const item of items) {
      if (!item || !item.nextDate || !item.name) continue;
      const nextDate = String(item.nextDate).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) continue;
      const itemKey = String(item.itemKey || item.name).trim().slice(0, 80);
      if (!itemKey) continue;

      rowMap.set(itemKey, {
        email: caller.email,
        item_key: itemKey,
        name: String(item.name).trim().slice(0, 120),
        amount: Number(item.amount) || 0,
        next_date: nextDate,
        kind: 'liability',
        tone,
        lead_days: leadDays,
        language
      });
    }

    const rows = Array.from(rowMap.values());

    if (!rows.length) {
      const { error: deleteError } = await supabase
        .from('payment_reminders')
        .delete()
        .eq('email', caller.email);
      if (deleteError) throw deleteError;
      return json(200, { success: true });
    }

    // Upsert active reminders (preserves last_notified_on for unchanged items)
    const { error: upsertError } = await supabase
      .from('payment_reminders')
      .upsert(rows, { onConflict: 'email,item_key' });
    if (upsertError) throw upsertError;

    // Remove any reminders the user deleted from their list
    const activeKeys = new Set(rows.map((r) => r.item_key));
    const { data: existingRows, error: listError } = await supabase
      .from('payment_reminders')
      .select('id, item_key')
      .eq('email', caller.email);
    if (listError) throw listError;

    const staleIds = (existingRows || [])
      .filter((r) => !activeKeys.has(r.item_key))
      .map((r) => r.id);

    if (staleIds.length) {
      const { error: pruneError } = await supabase
        .from('payment_reminders')
        .delete()
        .in('id', staleIds);
      if (pruneError) throw pruneError;
    }

    return json(200, { success: true });
  } catch (error) {
    return publicError(error);
  }
};