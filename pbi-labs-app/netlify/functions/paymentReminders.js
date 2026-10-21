const { schedule } = require('@netlify/functions');
const webpush = require('web-push');
const {
  env,
  getSupabaseAdmin,
  daysUntil,
  buildReminderMessage
} = require('./_lib');

async function sendDueReminders() {
  const publicKey = env('VAPID_PUBLIC_KEY');
  const privateKey = env('VAPID_PRIVATE_KEY');
  const subject = env('VAPID_SUBJECT') || 'mailto:support@pbilabs.com';
  if (!publicKey || !privateKey) {
    console.log('Payment reminders skipped: VAPID keys are not set.');
    return { statusCode: 200, body: 'VAPID not configured' };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: reminders, error } = await supabase.from('payment_reminders').select('*');
  if (error) throw error;

  const due = (reminders || []).filter((item) => {
    const days = daysUntil(item.next_date);
    const lead = Number(item.lead_days);
    const window = Number.isFinite(lead) ? lead : 1;
    if (days === null || days < 0 || days > window) return false;
    return item.last_notified_on !== today;
  });

  if (!due.length) return { statusCode: 200, body: 'No reminders due' };

  const emails = [...new Set(due.map((item) => item.email))];
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('email', emails);
  if (subError) throw subError;

  const byEmail = {};
  (subscriptions || []).forEach((sub) => {
    if (!byEmail[sub.email]) byEmail[sub.email] = [];
    byEmail[sub.email].push(sub);
  });

  for (const item of due) {
    const targets = byEmail[item.email] || [];
    const days = daysUntil(item.next_date);
    const language = item.language === 'es' ? 'es' : 'en';
    const payload = JSON.stringify({
      title: language === 'es' ? 'Pago próximo' : 'Payment coming up',
      body: buildReminderMessage({
        tone: item.tone || 'direct',
        language,
        name: item.name,
        amount: item.amount,
        nextDate: item.next_date,
        days
      }),
      tag: `pbi-${item.item_key}-${item.next_date}`,
      url: '/'
    });

    let delivered = false;
    for (const target of targets) {
      try {
        await webpush.sendNotification(target.subscription, payload);
        delivered = true;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', target.endpoint);
        } else {
          console.error('Push failed', err.statusCode || err.message);
        }
      }
    }

    if (delivered) {
      await supabase.from('payment_reminders').update({ last_notified_on: today }).eq('id', item.id);
    }
  }

  return { statusCode: 200, body: `Processed ${due.length} reminders` };
}

exports.handler = schedule('0 13 * * *', async function scheduled() {
  try {
    return await sendDueReminders();
  } catch (error) {
    console.error('Scheduled reminders failed:', error.message);
    return { statusCode: 500, body: 'Reminder job failed' };
  }
});
