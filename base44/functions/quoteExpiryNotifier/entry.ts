import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().slice(0, 10);

    // Get all sent quotes expiring in the next 7 days
    const quotes = await base44.asServiceRole.entities.Quote.filter({ status: 'sent' });
    const expiringSoon = quotes.filter(q =>
      q.valid_until && q.valid_until >= todayStr && q.valid_until <= in7DaysStr
    );

    if (expiringSoon.length === 0) {
      return Response.json({ success: true, expiringSoon: 0, notified: 0 });
    }

    // Get all non-customer users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const staff = users.filter(u => u.role !== 'user' && u.email);

    const notifications = [];
    for (const quote of expiringSoon) {
      const daysLeft = Math.ceil((new Date(quote.valid_until) - now) / (1000 * 60 * 60 * 24));
      const urgency = daysLeft <= 1 ? 'error' : daysLeft <= 3 ? 'warning' : 'info';

      for (const user of staff) {
        notifications.push(
          base44.asServiceRole.entities.Notification.create({
            user_email: user.email,
            title: `Quote expiring ${daysLeft <= 1 ? 'TODAY' : `in ${daysLeft} days`}: ${quote.title}`,
            message: `Quote ${quote.quote_number} for ${quote.customer_name} expires on ${quote.valid_until} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left). Follow up to close the deal! Total: R${(quote.total || 0).toLocaleString()}`,
            type: urgency,
            category: 'customer',
            is_read: false,
            link_page: 'Quotes',
          })
        );
      }
    }

    await Promise.all(notifications);

    return Response.json({
      success: true,
      expiringSoon: expiringSoon.length,
      notified: staff.length,
      quotes: expiringSoon.map(q => ({ number: q.quote_number, customer: q.customer_name, expires: q.valid_until })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});