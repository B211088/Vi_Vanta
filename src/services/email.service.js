import { Code, User } from "../models/index.js";
import { transporter } from "../utils/mailer.js";

export const sendConfirmationCodeHandle = async (toEmail, code) => {
  const expirationTime = 2 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expirationTime);

  try {
    const confirmation = new Code({
      email: toEmail,
      code: code,
      expiresAt: expiresAt,
    });

    await confirmation.save();
    const mailOptions = {
      from: `"ViMedical" <${process.env.EMAIL_USERNAME}>`,
      to: toEmail,
      subject: "Xác thực tài khoản ViMedical",
      html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f7fb;
                  margin: 0;
                  padding: 0;
                }
                .email-container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h3 {
                  color: #4CAF50;
                  font-size: 24px;
                  text-align: center;
                }
                p {
                  font-size: 16px;
                  color: #333;
                  line-height: 1.5;
                  margin-bottom: 20px;
                }
                .code {
                  font-size: 22px;
                  font-weight: bold;
                  color: #007bff;
                  padding: 10px;
                  background-color: #f1f1f1;
                  border-radius: 5px;
                  text-align: center;
                }
                .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <h3>Xác thực tài khoản ViMedical</h3>
                <p>Chào bạn,</p>
                <p>Để xác thực tài khoản ViMedical của bạn, vui lòng nhập mã xác thực dưới đây:</p>
                <div class="code">${code}</div>
                <p>Mã có hiệu lực trong vòng 5 phút.</p>
                <div class="footer">
                  <p>Xin cảm ơn!</p>
                  <p>ViMedical Team</p>
                </div>
              </div>
            </body>
          </html>
        `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Không thể lưu mã xác nhận vào cơ sở dữ liệu.");
  }
};

export const confirmationCodeHandle = async (email, code) => {
  try {
    const confirmation = await Code.findOne({ email, code });

    if (!confirmation) {
      throw new Error("Mã xác nhận không đúng!");
    }

    const currentTime = new Date();
    if (confirmation.expiresAt < currentTime) {
      throw new Error("Mã xác nhận đã hết hạn!");
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { active: true } },
      { new: true }
    );

    if (!user) {
      throw new Error("Người dùng không tồn tại!");
    }

    await Code.deleteOne({ email, code });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
