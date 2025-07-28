import cron from "node-cron";
import Appointment from "../models/appointment.model.js";

// Chạy mỗi phút
cron.schedule("* * * * *", async () => {
  const now = new Date();

  const expiredAppointments = await Appointment.find({
    paymentMethod: { $ne: "cash" },
    paymentStatus: "unpaid",
    status: "pending",
    paymentExpireAt: { $lt: now },
  });
  console.log(`Đang cron server`);
  for (const appointment of expiredAppointments) {
    appointment.status = "canceled";
    await appointment.save();
    console.log(`Đã tự động hủy appointment ${appointment._id}`);
  }
});
