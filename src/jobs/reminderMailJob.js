import cron from "node-cron";
import { MedicationReminderItem, User, Medication } from "../models/index.js";
import { transporter } from "../utils/mailer.js";

// Hàm gửi mail
const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    html,
  });
};

// Hàm kiểm tra có phải ngày nhắc nhở không
function isReminderToday(reminder, now) {
  if (reminder.repeat === "daily") return true;
  if (reminder.repeat === "day_of_weekly") {
    // 0: Chủ nhật, 1: Thứ 2, ...
    return reminder.daysOfWeek.includes(now.getDay());
  }
  if (reminder.repeat === "specific_date") {
    if (!reminder.startDate || !reminder.intervalDays) return false;
    const start = new Date(reminder.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diffDays % reminder.intervalDays === 0 && diffDays >= 0;
  }
  return false;
}

// Chạy mỗi 5 phút
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const nowHM = now.toTimeString().slice(0, 5); // "HH:MM"

  // Lấy các nhắc nhở còn hiệu lực
  const reminders = await MedicationReminderItem.find({
    isActive: true,
    status: "pending",
  }).lean();

  for (const reminder of reminders) {
    if (!isReminderToday(reminder, now)) continue;
    // Kiểm tra từng mốc remindAt
    for (const r of reminder.remindAt) {
      if (r.time === nowHM) {
        // Lấy user
        const user = await User.findById(reminder.userId).lean();
        if (!user || !user.email) continue;
        // Lấy tên thuốc
        let medName = "";
        if (reminder.medicationId) {
          const med = await Medication.findById(reminder.medicationId).lean();
          medName = med ? med.name : "";
        }
        // Gửi mail với giao diện đẹp
        await sendMail({
          to: user.email,
          subject: "Nhắc nhở uống thuốc",
          html: `
          <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 32px;">
              <h2 style="color: #1976d2; text-align: center; margin-bottom: 16px;">💊 Nhắc nhở uống thuốc</h2>
              <p style="font-size: 16px; color: #333;">
                Xin chào <b>${user.fullName || user.email}</b>,
              </p>
              <p style="font-size: 16px; color: #333;">
                Đây là nhắc nhở uống thuốc của bạn: 
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #555;">Tên thuốc:</td>
                  <td style="padding: 8px 0; color: #222;"><b>${medName}</b></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555;">Liều lượng:</td>
                  <td style="padding: 8px 0; color: #222;"><b>${
                    reminder.dosageAmount
                  } ${reminder.dosageUnit}</b></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555;">Thời gian uống:</td>
                  <td style="padding: 8px 0; color: #222;"><b>${r.time}</b></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555;">Ghi chú:</td>
                  <td style="padding: 8px 0; color: #222;">${
                    reminder.note || "Không có"
                  }</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:5173" style="background: #1976d2; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Xem chi tiết trên ViVanta
                </a>
              </div>
              <p style="font-size: 13px; color: #888; margin-top: 32px; text-align: center;">
                Nếu bạn không muốn nhận email này, vui lòng kiểm tra lại cài đặt nhắc nhở trên hệ thống.
              </p>
            </div>
          </div>
          `,
        });
      }
    }
  }
});
