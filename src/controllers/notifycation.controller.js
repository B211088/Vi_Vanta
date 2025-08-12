import { notificationService } from "../services/notifycation.service.js";

export const getNotifycationsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const notifications = await notificationService.getUserNotifications(
      userId,
      page,
      limit
    );
    res.status(200).json({
      success: true,
      message: "Lấy thông báo thành công",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông báo",
    });
  }
};
