const template = (code, name, subject) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background-color: #233866;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      color: #233866;
    }
    .activation-button {
      display: inline-block;
      background-color: #233866;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .activation-button:hover {
      background-color: #0056b3;
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f4f4f4;
      font-size: 14px;
      color: #777777;
    }
    .email-footer a {
      color: #233866;
      text-decoration: none;
    }
    .activation-button a {
      color : white ;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>
    <div class="email-body">
      <h2>Hello ${name},</h2>
      ${typeof Number(code) == "number" ? 
        `<p>Thank you for signing up with E-commerce store. To complete your registration and start using your account, please get code to activate your account:</p>`
            :
        `<p>There is verify link for reset your password</p>`}
      <h2 class="activation-button">${code}</h2>
      <p>If you did not sign up for this account, please ignore this email.</p>
      <p>Best regards,<br>E-commerce store Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} E-commerce store. All rights reserved.</p>
      <p><a href="[SupportLink]">Contact Support</a> | <a href="[UnsubscribeLink]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

module.exports = template