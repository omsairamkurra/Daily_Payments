import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'OSRK Payments <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
