export const resetPasswordTemplate = (resetURL: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset your password</title>
</head>

<body style="margin:0;padding:0;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f6f9fc;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;border:1px solid #e5e7eb;">

          <!-- Logo (optional) -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <!-- Replace with your logo -->
              <div style="font-weight:bold;font-size:18px;">Digital Menu</div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="font-size:22px;font-weight:bold;padding-bottom:12px;text-align:center;">
              Reset your password
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="font-size:15px;line-height:1.6;color:#444;text-align:center;padding-bottom:20px;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link will expire in <b>10 minutes</b>.
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:10px 0 26px;">
              <a href="${resetURL}"
                 style="
                   background:#111827;
                   color:#ffffff;
                   padding:12px 24px;
                   text-decoration:none;
                   border-radius:6px;
                   font-size:14px;
                   font-weight:bold;
                   display:inline-block;
                 ">
                 Reset password
              </a>
            </td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="font-size:13px;color:#666;text-align:center;padding-bottom:20px;">
              If the button doesn’t work, copy and paste this link into your browser:
              <br /><br />
              <a href="${resetURL}" style="color:#2563eb;word-break:break-all;">
                ${resetURL}
              </a>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="
              background:#f9fafb;
              border:1px solid #e5e7eb;
              border-radius:6px;
              padding:14px;
              font-size:13px;
              color:#555;
              line-height:1.5;
            ">
              <b>Didn’t request this?</b><br />
              You can safely ignore this email. Your password will not change unless you create a new one.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 0;">
              <hr style="border:none;border-top:1px solid #e5e7eb;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;font-size:12px;color:#888;line-height:1.6;">
              © ${new Date().getFullYear()} Digital Menu<br/>
              Need help? Contact your hotel support team.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};
