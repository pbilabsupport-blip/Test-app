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
    if (!caller) return json(401, { success: false, code: 'UNAUTHORIZED', error: 'Sign in again before enabling push.' });

    const subscription = body.subscription;
    if (!subscription || !subscription.endpoint) {
      return json(400, { success: false, code: 'BAD_REQUEST', error: 'Missing push subscription.' });
    }

    const tone = ['gentle', 'direct', 'urgent'].includes(body.tone) ? body.tone : 'direct';
    const leadDays = Math.max(0, Math.min(14, Number(body.leadDays) || 1));
    const row = {
      email: caller.email,
      endpoint: subscription.endpoint,
      subscription,
      tone,
      lead_days: leadDays,
      language: body.language === 'es' ? 'es' : 'en',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('push_subscriptions').upsert([row], { onConflict: 'endpoint' });
    if (error) throw error;
    return json(200, { success: true });
  } catch (error) {
    return publicError(error);
  }
};
