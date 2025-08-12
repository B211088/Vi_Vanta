import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiResponse.js";

class NotificationService {
  // Tạo notification mới
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();

    // Có thể tích hợp với push notification, email, SMS ở đây
    await this.sendPushNotification(notification);

    return notification;
  }

  // Gửi push notification (placeholder)
  async sendPushNotification(notification) {
    // Integration với Firebase Cloud Messaging, OneSignal, etc.
    console.log(`Push notification sent to user ${notification.userId}:`, {
      title: notification.title,
      message: notification.message,
    });
  }

  // Lấy notifications của user
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
      unreadCount,
    };
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new ApiError(404, "Không tìm thấy thông báo");
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return true;
  }

  // Xóa notification
  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({
      _id: notificationId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, "Không tìm thấy thông báo");
    }

    return true;
  }

  // Gửi notification nhắc nhở lịch khám
  async sendAppointmentReminder(appointment) {
    const reminderTime = new Date(appointment.date);
    reminderTime.setHours(reminderTime.getHours() - 2); // Nhắc trước 2 tiếng

    if (new Date() >= reminderTime) {
      await this.createNotification({
        userId: appointment.userId,
        title: "Nhắc nhở lịch khám",
        message: `Bạn có lịch khám vào lúc ${
          appointment.time
        } ngày ${appointment.date.toLocaleDateString("vi-VN")}`,
        type: "reminder",
        relatedId: appointment._id,
        relatedModel: "Appointment",
      });
    }
  }

  // Gửi notification khi có cập nhật từ bác sĩ
  async notifyPatientUpdate(appointment, updateType, message) {
    await this.createNotification({
      userId: appointment.userId,
      title: `Cập nhật từ bác sĩ`,
      message: message,
      type: "appointment",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });
  }
}

export const notificationService = new NotificationService();
