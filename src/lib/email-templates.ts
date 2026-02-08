export function recurringDueReminderTemplate(
  name: string,
  amount: number,
  dueDate: string
): string {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)

  const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">OSRK Payments</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Payment Reminder</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your recurring payment <strong>${name}</strong> of <strong>${formattedAmount}</strong> is due on <strong>${formattedDate}</strong>.
          </p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Payment:</strong> ${name}<br>
              <strong>Amount:</strong> ${formattedAmount}<br>
              <strong>Due Date:</strong> ${formattedDate}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            This is an automated reminder from OSRK Payments.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function sipProcessedTemplate(
  name: string,
  amount: number
): string {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">OSRK Payments</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">SIP Processed</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your SIP investment <strong>${name}</strong> of <strong>${formattedAmount}</strong> has been processed successfully.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;">
              <strong>Investment:</strong> ${name}<br>
              <strong>Amount:</strong> ${formattedAmount}<br>
              <strong>Status:</strong> Processed
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            This is an automated notification from OSRK Payments.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
