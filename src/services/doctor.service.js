import Appointment from "../models/appointment.model.js";
import BookingService from "../models/bookingService.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import WorkingHour from "../models/workingHour.model.js";

import { ApiError } from "../utils/ApiResponse.js";

export const registerDoctor = async ({ payload, userId }) => {
  console.log("Service received payload:", JSON.stringify(payload, null, 2));

  const existed = await Doctor.findOne({ userId });
  if (existed) {
    throw new ApiError(400, "Bạn đã gửi yêu cầu hoặc đã là bác sĩ!");
  }

  // Ensure all required fields are present
  const doctorData = {
    userId,
    name: payload.name,
    avatar: payload.avatar,
    title: payload.title,
    info: payload.info,
    highlights: payload.highlights,
    infoClinic: {
      clinicName: payload.infoClinic.clinicName,
      phone: payload.infoClinic.phone,
      address: {
        specificAddress: payload.infoClinic.address.specificAddress,
        provinceId: payload.infoClinic.address.provinceId,
        districtId: payload.infoClinic.address.districtId,
        wardId: payload.infoClinic.address.wardId,
        // Optional fields
        ...(payload.infoClinic.address.province && {
          province: payload.infoClinic.address.province,
        }),
        ...(payload.infoClinic.address.district && {
          district: payload.infoClinic.address.district,
        }),
        ...(payload.infoClinic.address.ward && {
          ward: payload.infoClinic.address.ward,
        }),
      },
      // Optional clinic fields
      ...(payload.infoClinic.description && {
        description: payload.infoClinic.description,
      }),
      ...(payload.infoClinic.website && {
        website: payload.infoClinic.website,
      }),
    },
    // Optional array fields
    ...(payload.specialty && { specialty: payload.specialty }),
    ...(payload.targetPatients && { targetPatients: payload.targetPatients }),
    ...(payload.strengths && { strengths: payload.strengths }),
    ...(payload.experiences && { experiences: payload.experiences }),
    ...(payload.educations && { educations: payload.educations }),
    ...(payload.languages && { languages: payload.languages }),
    ...(payload.paymentMethods && { paymentMethods: payload.paymentMethods }),
    // Other optional fields
    ...(payload.description && { description: payload.description }),
    ...(payload.consultation_fee && {
      consultation_fee: payload.consultation_fee,
    }),
    ...(payload.years_of_experience && {
      years_of_experience: payload.years_of_experience,
    }),
    ...(payload.license_number && { license_number: payload.license_number }),
  };

  console.log(
    "Final doctor data before save:",
    JSON.stringify(doctorData, null, 2)
  );

  const doctor = new Doctor(doctorData);
  return await doctor.save();
};

export const getDoctors = async (query = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      location,
      specialty,
      sortBy = "createdAt",
      sortOrder = "desc",
      isAdmin = false,
    } = query;

    const filter = {};

    if (status && isAdmin) {
      filter.status = status;
    }
    if (search && search.trim() !== "") {
      const keyword = search.trim();
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { "infoClinic.clinicName": { $regex: keyword, $options: "i" } },
      ];
    }

    if (location && location !== "all") {
      filter["infoClinic.address.provinceId"] = location;
    }
    if (specialty && specialty !== "all") {
      filter["specialty"] = specialty;
    }
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("_id name userId specialty infoClinic rate avatar")
        .populate({
          path: "infoClinic.address.wardId",
          select: "name",
        })
        .populate({
          path: "infoClinic.address.districtId",
          select: "name",
        })
        .populate({
          path: "infoClinic.address.provinceId",
          select: "name",
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Doctor.countDocuments(filter),
    ]);
    return {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Lỗi trong doctorService.getDoctors:", error);
    throw new Error("Không thể lấy danh sách bác sĩ");
  }
};

export const getPendingDoctors = async () => {
  return Doctor.find({ status: "pending" })
    .populate({
      path: "infoClinic.address.wardId",
      select: "name",
    })
    .populate({
      path: "infoClinic.address.districtId",
      select: "name",
    })
    .populate({
      path: "infoClinic.address.provinceId",
      select: "name",
    })
    .lean();
};

export const approveDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { status: "active" },
    { new: true }
  );
  await User.findByIdAndUpdate(doctor.userId, {
    $addToSet: { roles: "doctor" },
  });
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
  return doctor;
};

export const updateWalletDoctor = async (doctorId, amount) => {
  console.log({ doctorId, amount });
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Không tìm thấy bác sĩ");
    }

    doctor.wallet += amount;
    await doctor.save();

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi cập nhật ví bác sĩ:", error);
    throw new Error("Lỗi khi cập nhật ví bác sĩ");
  }
};

export const rejectDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
  return doctor;
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id)
    .populate({
      path: "infoClinic.address.wardId",
      select: "name",
    })
    .populate({
      path: "infoClinic.address.districtId",
      select: "name",
    })
    .populate({
      path: "infoClinic.address.provinceId",
      select: "name",
    })
    .lean();
  const workingHour = await WorkingHour.find({
    doctorId: id,
    isActive: true,
  }).select("-timeSlots");
  const services = await BookingService.find({ doctorId: id, isActive: true });

  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");

  return { doctor: { ...doctor, services }, workingHour };
};

export const getDoctorSlotAvailability = async (id, date) => {
  if (!date) {
    throw new ApiError(400, "Thiếu ngày cần kiểm tra slot.");
  }

  const workingHours = await WorkingHour.find({ doctorId: id, isActive: true });

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  const dayWorkingHours = workingHours.filter((wh) => {
    const isMatchDay = wh.dayOfWeek === dayOfWeek;

    let isInDateRange = true;
    if (wh.startDate && wh.endDate) {
      const whStart = new Date(wh.startDate);
      const whEnd = new Date(wh.endDate);
      isInDateRange =
        !isNaN(whStart.getTime()) &&
        !isNaN(whEnd.getTime()) &&
        targetDate >= whStart &&
        targetDate <= whEnd;
    }

    return isMatchDay && isInDateRange;
  });

  const appointments = await Appointment.find({
    doctorId: id,
    date: {
      $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
      $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
    },
    status: { $in: ["pending", "confirmed", "in-progress"] },
  }).lean();

  const bookedSlots = new Set();
  const bookedSlotMap = new Map();

  appointments.forEach((appt) => {
    const key = `${appt.timeSlots.startTime}-${appt.timeSlots.endTime}`;
    bookedSlots.add(key);
    bookedSlotMap.set(key, {
      isBooked: true,
      bookedDate: appt.date,
      appointmentId: appt._id,
      status: appt.status,
      patientName: appt.patientName,
      patientPhone: appt.patientPhone,
    });
  });

  const availableSlots = [];

  for (const wh of dayWorkingHours) {
    for (const slot of wh.timeSlots) {
      if (!slot.isAvailable) continue;

      const slotKey = `${slot.startTime}-${slot.endTime}`;
      const isBooked = bookedSlots.has(slotKey);

      availableSlots.push({
        ...slot.toObject(),
        isBooked,
        isAvailableForBooking: !isBooked,
        bookingDetails: isBooked ? bookedSlotMap.get(slotKey) : null,
      });
    }
  }

  return {
    date: targetDate,
    availableSlots,
  };
};

// Nếu bạn chỉ muốn lấy slots available để booking
export const getAvailableSlotsOnly = async (id, date) => {
  const allSlots = await getDoctorSlotAvailability(id, date);

  return allSlots
    .map((wh) => ({
      ...wh,
      timeSlots: wh.timeSlots.filter((slot) => slot.isAvailableForBooking),
    }))
    .filter((wh) => wh.timeSlots.length > 0);
};

// Function để lấy thông tin chi tiết về slot đã được đặt
export const getBookedSlotsDetails = async (id, date) => {
  const allSlots = await getDoctorSlotAvailability(id, date);

  return allSlots
    .map((wh) => ({
      ...wh,
      timeSlots: wh.timeSlots.filter((slot) => slot.isBooked),
    }))
    .filter((wh) => wh.timeSlots.length > 0);
};
// Function để lấy slot availability cho nhiều ngày
export const getDoctorSlotAvailabilityRange = async (
  id,
  startDate,
  endDate
) => {
  const doctor = await Doctor.findById(id).populate("userId", "avatar").lean();
  const workingHours = await WorkingHour.find({ doctorId: id, isActive: true });
  const services = await BookingService.find({ doctorId: id, isActive: true });

  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Lấy tất cả appointments trong khoảng thời gian
  const existingAppointments = await Appointment.find({
    doctorId: id,
    date: {
      $gte: new Date(start.setHours(0, 0, 0, 0)),
      $lt: new Date(end.setHours(23, 59, 59, 999)),
    },
    status: { $in: ["pending", "confirmed", "in-progress"] },
  }).lean();

  // Group appointments by date
  const appointmentsByDate = {};
  existingAppointments.forEach((appointment) => {
    const dateKey = appointment.date.toISOString().split("T")[0];
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(appointment);
  });

  const dateRange = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const dayOfWeek = currentDate.getDay();
    const dateKey = currentDate.toISOString().split("T")[0];

    // Lấy working hours cho ngày này
    const dayWorkingHours = workingHours.filter(
      (wh) =>
        wh.dayOfWeek === dayOfWeek &&
        currentDate >= new Date(wh.startDate) &&
        currentDate <= new Date(wh.endDate)
    );

    // Tạo Set các slot đã được đặt cho ngày này
    const bookedSlots = new Set();
    if (appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey].forEach((appointment) => {
        const slotKey = `${appointment.timeSlots.startTime}-${appointment.timeSlots.endTime}`;
        bookedSlots.add(slotKey);
      });
    }

    // Thêm thông tin availability
    const workingHoursWithAvailability = dayWorkingHours.map((workingHour) => ({
      ...workingHour.toObject(),
      timeSlots: workingHour.timeSlots.map((slot) => {
        const slotKey = `${slot.startTime}-${slot.endTime}`;
        return {
          ...slot.toObject(),
          isBooked: bookedSlots.has(slotKey),
          isAvailableForBooking: slot.isAvailable && !bookedSlots.has(slotKey),
        };
      }),
    }));

    dateRange.push({
      date: new Date(currentDate),
      dayOfWeek,
      workingHours: workingHoursWithAvailability,
      totalSlots: dayWorkingHours.reduce(
        (total, wh) => total + wh.timeSlots.length,
        0
      ),
      availableSlots:
        dayWorkingHours.reduce(
          (total, wh) =>
            total + wh.timeSlots.filter((slot) => slot.isAvailable).length,
          0
        ) - bookedSlots.size,
      bookedSlots: bookedSlots.size,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    doctor: { ...doctor, services },
    dateRange,
    summary: {
      totalDays: dateRange.length,
      totalAvailableSlots: dateRange.reduce(
        (sum, day) => sum + day.availableSlots,
        0
      ),
      totalBookedSlots: dateRange.reduce(
        (sum, day) => sum + day.bookedSlots,
        0
      ),
    },
  };
};

export const getDoctorByUserId = async (userId) => {
  try {
    const doctor = await Doctor.findOne({ userId })
    .lean();
    if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");

    return doctor;
  } catch (error) {
    throw new ApiError(404, "Gặp lỗi khi lấy thông tin !");
  }
};

// Tạo lịch làm việc cho bác sĩ
export const createWorkingHour = async (workingHourData) => {
  const { doctorId, dayOfWeek, startDate, endDate, timeSlots } =
    workingHourData;

  // Kiểm tra bác sĩ có tồn tại không
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");

  // Kiểm tra ngày bắt đầu và kết thúc hợp lệ
  if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
    throw new ApiError(
      400,
      "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
    );
  }

  // Kiểm tra trùng lặp lịch làm việc trong khoảng thời gian này với cùng doctor + dayOfWeek
  const overlappingSchedule = await WorkingHour.findOne({
    doctorId,
    dayOfWeek,
    isActive: true,
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
    ],
  });

  if (overlappingSchedule) {
    throw new ApiError(
      400,
      "Đã tồn tại lịch làm việc trùng trong khoảng thời gian này"
    );
  }

  // Validate time slots
  if (Array.isArray(timeSlots) && timeSlots.length > 0) {
    for (const slot of timeSlots) {
      if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
        throw new ApiError(
          400,
          "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc trong các slot"
        );
      }
    }
  }

  // Tạo mới lịch làm việc
  const workingHour = new WorkingHour(workingHourData);
  return await workingHour.save();
};

// Lấy lịch làm việc của bác sĩ theo ID
export const getWorkingHoursByDoctorId = async (doctorId, query = {}) => {
  const { date, dayOfWeek, isActive = true } = query;

  const filter = { doctorId, isActive };

  if (date) {
    filter.date = new Date(date);
  }

  if (dayOfWeek !== undefined) {
    filter.dayOfWeek = dayOfWeek;
  }

  return await WorkingHour.find(filter)
    .select("-__v")
    .sort({ dayOfWeek: 1, date: 1 })
    .lean();
};

export const getMyWorkingHours = async (doctorId) => {
  const filter = { doctorId };

  return await WorkingHour.find(filter)
    .select("-__v")
    .sort({ dayOfWeek: 1, date: 1 })
    .lean();
};

// Lấy lịch làm việc theo khoảng thời gian
export const getWorkingHoursByDateRange = async (
  doctorId,
  startDate,
  endDate
) => {
  const filter = {
    doctorId,
    isActive: true,
    $or: [
      { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { date: { $exists: false } }, // Lịch theo ngày trong tuần
    ],
  };

  return await WorkingHour.find(filter)
    .populate("doctorId", "name specialty")
    .sort({ date: 1, dayOfWeek: 1 })
    .lean();
};

// Cập nhật lịch làm việc
export const updateWorkingHour = async (id, updateData) => {
  // Validate time slots nếu có cập nhật
  if (updateData.timeSlots && updateData.timeSlots.length > 0) {
    for (const slot of updateData.timeSlots) {
      if (slot.startTime >= slot.endTime) {
        throw new ApiError(
          400,
          "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
        );
      }
    }
  }

  const workingHour = await WorkingHour.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("doctorId", "name specialty");

  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");
  return workingHour;
};

export const deleteHardWorkingHour = async (id) => {
  const deleted = await WorkingHour.findByIdAndDelete(id).populate(
    "doctorId",
    "name specialty"
  );

  if (!deleted) {
    throw new ApiError(404, "Không tìm thấy lịch làm việc để xóa");
  }

  return {
    message: "Xóa lịch làm việc thành công",
    deleted,
  };
};

// Cập nhật trạng thái slot thời gian cụ thể
export const updateTimeSlotAvailability = async (
  workingHourId,
  slotIndex,
  isAvailable
) => {
  const workingHour = await WorkingHour.findById(workingHourId);
  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");

  if (!workingHour.timeSlots[slotIndex]) {
    throw new ApiError(404, "Không tìm thấy slot thời gian");
  }

  workingHour.timeSlots[slotIndex].isAvailable = isAvailable;
  await workingHour.save();

  return workingHour;
};

// Thêm slot thời gian vào lịch làm việc
export const addTimeSlot = async (workingHourId, timeSlot) => {
  // Validate time slot
  if (timeSlot.startTime >= timeSlot.endTime) {
    throw new ApiError(
      400,
      "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
    );
  }

  const workingHour = await WorkingHour.findById(workingHourId);
  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");

  // Kiểm tra trùng lặp thời gian
  const isOverlapping = workingHour.timeSlots.some((slot) => {
    return (
      (timeSlot.startTime >= slot.startTime &&
        timeSlot.startTime < slot.endTime) ||
      (timeSlot.endTime > slot.startTime && timeSlot.endTime <= slot.endTime) ||
      (timeSlot.startTime <= slot.startTime && timeSlot.endTime >= slot.endTime)
    );
  });

  if (isOverlapping) {
    throw new ApiError(400, "Slot thời gian bị trùng lặp với slot hiện có");
  }

  workingHour.timeSlots.push(timeSlot);
  await workingHour.save();

  return workingHour;
};

// Xóa slot thời gian
export const removeTimeSlot = async (workingHourId, slotIndex) => {
  const workingHour = await WorkingHour.findById(workingHourId);
  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");

  if (!workingHour.timeSlots[slotIndex]) {
    throw new ApiError(404, "Không tìm thấy slot thời gian");
  }

  workingHour.timeSlots.splice(slotIndex, 1);
  await workingHour.save();

  return workingHour;
};

// Xóa lịch làm việc (soft delete)
export const deleteWorkingHour = async (id) => {
  const workingHour = await WorkingHour.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");
  return workingHour;
};

// Lấy lịch làm việc theo ID
export const getWorkingHourById = async (id) => {
  const workingHour = await WorkingHour.findById(id)
    .populate("doctorId", "name specialty")
    .lean();

  if (!workingHour) throw new ApiError(404, "Không tìm thấy lịch làm việc");
  return workingHour;
};

// Lấy slot thời gian có sẵn cho đặt lịch
export const getAvailableTimeSlots = async (doctorId, date) => {
  const dayOfWeek = new Date(date).getDay();

  // Tìm lịch làm việc theo ngày cụ thể hoặc theo ngày trong tuần
  const workingHours = await WorkingHour.find({
    doctorId,
    isActive: true,
    $or: [{ date: new Date(date) }, { dayOfWeek, date: { $exists: false } }],
  }).lean();

  if (workingHours.length === 0) {
    return [];
  }

  // Lấy tất cả slot có sẵn
  const availableSlots = [];
  workingHours.forEach((workingHour) => {
    workingHour.timeSlots.forEach((slot) => {
      if (slot.isAvailable) {
        availableSlots.push({
          workingHourId: workingHour._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: workingHour.date || date,
        });
      }
    });
  });

  return availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

// Tạo lịch làm việc mặc định cho bác sĩ mới
export const createDefaultWorkingSchedule = async (doctorId) => {
  const defaultSchedules = [];

  // Tạo lịch từ thứ 2 đến thứ 6 (1-5)
  for (let day = 1; day <= 5; day++) {
    const timeSlots = [
      { startTime: "08:00", endTime: "08:30", isAvailable: true },
      { startTime: "08:30", endTime: "09:00", isAvailable: true },
      { startTime: "09:00", endTime: "09:30", isAvailable: true },
      { startTime: "09:30", endTime: "10:00", isAvailable: true },
      { startTime: "10:00", endTime: "10:30", isAvailable: true },
      { startTime: "14:00", endTime: "14:30", isAvailable: true },
      { startTime: "14:30", endTime: "15:00", isAvailable: true },
      { startTime: "15:00", endTime: "15:30", isAvailable: true },
      { startTime: "15:30", endTime: "16:00", isAvailable: true },
      { startTime: "16:00", endTime: "16:30", isAvailable: true },
    ];

    defaultSchedules.push({
      doctorId,
      dayOfWeek: day,
      timeSlots,
      isActive: true,
    });
  }

  return await WorkingHour.insertMany(defaultSchedules);
};

// Lấy thống kê lịch làm việc của bác sĩ
export const getWorkingHourStats = async (doctorId) => {
  const stats = await WorkingHour.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $unwind: "$timeSlots" },
    {
      $group: {
        _id: "$doctorId",
        totalSlots: { $sum: 1 },
        availableSlots: {
          $sum: { $cond: ["$timeSlots.isAvailable", 1, 0] },
        },
        bookedSlots: {
          $sum: { $cond: ["$timeSlots.isAvailable", 0, 1] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalSlots: 0,
      availableSlots: 0,
      bookedSlots: 0,
    }
  );
};

export const updateDoctorPaymentMethod = async (doctorId, payload) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { paymentMethod: payload } },
      { new: true }
    );

    if (!doctor) {
      throw new ApiError(
        404,
        "Không tìm thấy bác sĩ để cập nhật phương thức thanh toán"
      );
    }

    return doctor;
  } catch (error) {
    throw new ApiError(
      500,
      "Đã xảy ra lỗi khi cập nhật phương thức thanh toán"
    );
  }
};
