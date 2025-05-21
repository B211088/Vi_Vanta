import {
  Pregnancy,
  VisitType,
  PregnancyVisit,
  PregnancyWeek,
  PregnancyVisitAddress,
} from "../models/index.js";

// Tính toán ngày dự sinh từ các thông tin đầu vào
const calculatePregnancyDates = (payload) => {
  const {
    lastMenstrualCyclesDate,
    menstrualCycleLength,
    conceptionDate,
    transferDate,
    embryoDay,
  } = payload;

  let calculatedDueDate = null;
  let calculatedConceptionDate = null;

  // Xử lý trường hợp IVF (phương pháp thụ tinh ống nghiệm)
  if (transferDate && embryoDay !== undefined) {
    const transferDateObj = new Date(transferDate);
    // Tính ngày dự sinh: ngày chuyển phôi + (266 - số ngày phôi phát triển)
    calculatedDueDate = new Date(transferDateObj);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + (266 - embryoDay));

    // Tính ngày thụ thai: ngày chuyển phôi - số ngày phôi phát triển
    calculatedConceptionDate = new Date(transferDateObj);
    calculatedConceptionDate.setDate(
      calculatedConceptionDate.getDate() - embryoDay
    );
  }
  // Xử lý trường hợp biết ngày thụ thai
  else if (conceptionDate) {
    calculatedConceptionDate = new Date(conceptionDate);
    // Tính ngày dự sinh: ngày thụ thai + 266 ngày
    calculatedDueDate = new Date(calculatedConceptionDate);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 266);
  }
  // Xử lý trường hợp biết ngày kinh cuối cùng
  else if (lastMenstrualCyclesDate) {
    const lmpDate = new Date(lastMenstrualCyclesDate);
    // Sử dụng chu kỳ 28 ngày nếu người dùng không nhập giá trị
    const cycleLength = menstrualCycleLength
      ? parseInt(menstrualCycleLength)
      : 28;
    // Tính ngày rụng trứng (ngày thụ thai dự kiến): LMP + (cycle length - 14)
    const ovulationOffset = cycleLength - 14;

    calculatedConceptionDate = new Date(lmpDate);
    calculatedConceptionDate.setDate(
      calculatedConceptionDate.getDate() + ovulationOffset
    );

    // Tính ngày dự sinh: LMP + 280 ngày (cách tính Naegele)
    calculatedDueDate = new Date(lmpDate);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 280);
  } else {
    throw new Error("Không đủ dữ liệu để tính ngày dự sinh và ngày thụ thai");
  }

  return {
    dueDate: calculatedDueDate,
    conceptionDate: calculatedConceptionDate,
  };
};

// tao một thông tin thai kỳ mới
export const createInfoPregnancyHandle = async (userId, payload) => {
  try {
    const {
      weightBeforePregnant,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    } = payload;

    // Tính toán ngày dự sinh và ngày thụ thai
    const { dueDate, conceptionDate: calculatedConceptionDate } =
      calculatePregnancyDates({
        lastMenstrualCyclesDate,
        menstrualCycleLength,
        conceptionDate,
        transferDate,
        embryoDay,
      });

    // Tạo đối tượng thông tin thai kỳ với đầy đủ dữ liệu
    const pregnancyInfo = new Pregnancy({
      userId,
      weightBeforePregnant,
      dueDate,
      // Sử dụng ngày thụ thai đã nhập hoặc đã tính toán
      conceptionDate: conceptionDate || calculatedConceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    });

    await pregnancyInfo.save();
    return pregnancyInfo;
  } catch (error) {
    console.error("Lỗi khi tạo thông tin thai kỳ:", error.message);
    throw error;
  }
};

// Lấy tất cả thông tin thai kỳ của người dùng
export const getAllInfoPregnanciesHandle = async (userId) => {
  try {
    const infoPregnancys = await Pregnancy.find({ userId }).select(
      "_id weightBeforePregnant dueDate conceptionDate"
    );
    return infoPregnancys;
  } catch (error) {}
};

// Lấy thông tin thai kỳ theo ID
export const getInfoPregnancyHandle = async (pregnancyId) => {
  try {
    const infoPregnancy = await Pregnancy.findById(pregnancyId).select(
      "-__v -createdAt -updatedAt"
    );
    return infoPregnancy;
  } catch (error) {}
};

// Cập nhật thông tin thai kỳ
export const updateInfoPregnancyHandle = async (pregnancyId, payload) => {
  try {
    const {
      weightBeforePregnant,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    } = payload;

    const dueDate = calculateDueDateFromInputs({
      lastMenstrualCyclesDate,
      cycle_length: menstrualCycleLength,
      conception_date: conceptionDate,
      transfer_date: transferDate,
      embryo_day: embryoDay,
    });

    const existing = await Pregnancy.findOne({ _id: pregnancyId });
    if (!existing) {
      throw new Error("Không tìm thấy thông tin thai kỳ để cập nhật");
    }

    const pregnancyInfo = {
      weightBeforePregnant,
      dueDate,
      conceptionDate,
      lastMenstrualCyclesDate,
      menstrualCycleLength,
      transferDate,
      embryoDay,
    };

    const pregnancyInfoUpdateUpdate = await Pregnancy.findByIdAndUpdate(
      pregnancyId,
      { $set: pregnancyInfo },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    return pregnancyInfoUpdateUpdate;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin thai kỳ:", error.message);
    throw error;
  }
};

// Xóa thông tin thai kỳ
export const deleteInfoPregnancyHandle = async (pregnancyId) => {
  try {
    const deleted = await Pregnancy.findByIdAndDelete(pregnancyId);
    if (!deleted) {
      throw new Error("Không tìm thấy thông tin thai kỳ để xóa");
    }
    return { message: "Xóa thông tin thai kỳ thành công" };
  } catch (error) {
    throw new Error("Lỗi khi xóa thông tin thai kỳ");
  }
};

// Lấy tất cả loại khám thai định kỳ
export const getVisitTypesHandle = async () => {
  try {
    const visitTypes = await VisitType.find();

    return visitTypes;
  } catch (error) {
    throw new Error("Lỗi khi lấy loại khám khám thai định kỳ");
  }
};

// Tạo một loại khám thai định kỳ mới
export const createVisitTypeHandle = async (payload) => {
  try {
    const { code, name, week, description, color, iconUrl } = payload;
    const createVisitType = new VisitType({
      code,
      name,
      week,
      description,
      color,
      iconUrl,
    });
    await createVisitType.save();
    return createVisitType;
  } catch (error) {
    throw new Error("Lỗi khi tạo loại khám khám thai định kỳ");
  }
};

// Cập nhật thông tin một loại khám thai định kỳ
export const updateVisitTypeHandle = async (visitTypeId, payload) => {
  try {
    const { code, name, week, description, color, iconUrl } = payload;
    const updateVisitType = {
      code,
      name,
      week,
      description,
      color,
      iconUrl,
    };

    const updateVisitTypeData = await VisitType.findByIdAndUpdate(
      { _id: visitTypeId },
      updateVisitType,
      { new: true }
    );
    if (!updateVisitTypeData) {
      throw new Error("Không tìm thấy loại khám thai định kỳ để cập nhật");
    }
    return updateVisitType;
  } catch (error) {
    console.error("Lỗi khi cập nhật loại khám thai định kỳ:", error.message);
    throw new Error("Lỗi khi cập nhật loại khám khám thai định kỳ");
  }
};

// Xóa một loại khám thai định kỳ
export const deletedVisitTypesHandle = async (visitTypeId) => {
  try {
    const deletedVisitType = await VisitType.findByIdAndDelete(visitTypeId);

    if (!deletedVisitType) {
      throw new Error("Không tìm thấy loại khám thai định kỳ để xóa");
    }

    return deletedVisitType._id;
  } catch (error) {
    console.error("Lỗi khi xóa loại khám thai định kỳ:", error.message);
    throw new Error("Lỗi khi xóa loại khám thai định kỳ");
  }
};

// Lấy danh sách các lần khám thai theo ID thai kỳ
export const getPregnancyVisitsHandle = async (pregnancyId) => {
  try {
    const visits = await PregnancyVisit.find({ pregnancyId })
      .populate("visitTypeId", "name week description")
      .select("-__v -createdAt -updatedAt");
    return visits;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lần khám thai:", error.message);
    throw new Error("Lỗi khi lấy danh sách lần khám thai");
  }
};

// Tạo một lần khám thai mới
export const createPregnancyVisitHandle = async (payload) => {
  try {
    const {
      pregnancyId,
      visitTypeId,
      title,
      date,
      result,
      note,
      imageUrls,
      status,
    } = payload;

    const newVisit = new PregnancyVisit({
      pregnancyId,
      visitTypeId,
      title,
      date,
      result,
      note,
      imageUrls,
      status,
    });

    await newVisit.save();
    return newVisit;
  } catch (error) {
    console.error("Lỗi khi tạo lần khám thai:", error.message);
    throw new Error("Lỗi khi tạo lần khám thai");
  }
};

// Cập nhật thông tin một lần khám thai
export const updatePregnancyVisitHandle = async (visitId, payload) => {
  try {
    const { title, date, result, note, imageUrls, status } = payload;

    const updatedVisit = await PregnancyVisit.findByIdAndUpdate(
      visitId,
      {
        $set: {
          title,
          date,
          result,
          note,
          imageUrls,
          status,
        },
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedVisit) {
      throw new Error("Không tìm thấy lần khám thai để cập nhật");
    }

    return updatedVisit;
  } catch (error) {
    console.error("Lỗi khi cập nhật lần khám thai:", error.message);
    throw new Error("Lỗi khi cập nhật lần khám thai");
  }
};

export const deletePregnancyVisitHandle = async (visitId) => {
  try {
    const deletedVisit = await PregnancyVisit.findByIdAndDelete(visitId);

    if (!deletedVisit) {
      throw new Error("Không tìm thấy lần khám thai để xóa");
    }

    return { message: "Xóa lần khám thai thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa lần khám thai:", error.message);
    throw new Error("Lỗi khi xóa lần khám thai");
  }
};

// Lấy danh sách các tuần thai kỳ theo ID thai kỳ
export const getPregnancyWeeksHandle = async () => {
  try {
    const weeks = await PregnancyWeek.find().select(
      "-__v -createdAt -updatedAt"
    );
    return weeks;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách các tuần thai kỳ:", error.message);
    throw new Error("Lỗi khi lấy danh sách các tuần thai kỳ");
  }
};

// Lấy thông tin tuần thai kỳ theo số tuần
export const getPregnancyWeekHandle = async (weekNumber) => {
  try {
    const week = await PregnancyWeek.find({ weekNumber }).select(
      "-__v -createdAt -updatedAt"
    );
    if (!week) {
      throw new Error("Không tìm thấy thông tin tuần thai kỳ");
    }
    return week;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tuần thai kỳ:", error.message);
    throw new Error("Lỗi khi lấy thông tin tuần thai kỳ");
  }
};

// Tạo một tuần thai kỳ mới
export const createPregnancyWeekHandle = async (payload) => {
  try {
    const {
      pregnancyId,
      weekNumber,
      fetalDevelopment,
      motherChanges,
      advice,
      imageUrl,
    } = payload;

    const newWeek = new PregnancyWeek({
      pregnancyId,
      weekNumber,
      fetalDevelopment,
      motherChanges,
      advice,
      imageUrl,
    });

    await newWeek.save();
    return newWeek;
  } catch (error) {
    console.error("Lỗi khi tạo tuần thai kỳ:", error.message);
    throw new Error("Lỗi khi tạo tuần thai kỳ");
  }
};

// Cập nhật thông tin một tuần thai kỳ
export const updatePregnancyWeekHandle = async (weekId, payload) => {
  try {
    const { weekNumber, fetalDevelopment, motherChanges, advice, imageUrl } =
      payload;

    const updatedWeek = await PregnancyWeek.findByIdAndUpdate(
      weekId,
      {
        $set: {
          weekNumber,
          fetalDevelopment,
          motherChanges,
          advice,
          imageUrl,
        },
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedWeek) {
      throw new Error("Không tìm thấy tuần thai kỳ để cập nhật");
    }

    return updatedWeek;
  } catch (error) {
    console.error("Lỗi khi cập nhật tuần thai kỳ:", error.message);
    throw new Error("Lỗi khi cập nhật tuần thai kỳ");
  }
};

// Xóa một tuần thai kỳ
export const deletePregnancyWeekHandle = async (weekId) => {
  try {
    const deletedWeek = await PregnancyWeek.findByIdAndDelete(weekId);

    if (!deletedWeek) {
      throw new Error("Không tìm thấy tuần thai kỳ để xóa");
    }

    return { message: "Xóa tuần thai kỳ thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa tuần thai kỳ:", error.message);
    throw new Error("Lỗi khi xóa tuần thai kỳ");
  }
};

// Tạo một địa chỉ khám thai mới
export const createPregnancyVisitAddressHandle = async (payload) => {
  try {
    const {
      pregnancyVisitId,
      phoneNumber,
      clinicName,
      wardId,
      districtId,
      provinceId,
    } = payload;

    const newAddress = new PregnancyVisitAddress({
      pregnancyVisitId,
      clinicName,
      phoneNumber,
      wardId,
      districtId,
      provinceId,
    });

    await newAddress.save();
    return newAddress;
  } catch (error) {
    console.error("Lỗi khi tạo địa chỉ khám thai:", error.message);
    throw new Error("Lỗi khi tạo địa chỉ khám thai");
  }
};

// Lấy danh sách tất cả địa chỉ khám thai
export const getAllPregnancyVisitAddressesHandle = async () => {
  try {
    const addresses = await PregnancyVisitAddress.find().select(
      "-__v -createdAt -updatedAt"
    );
    return addresses;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ khám thai:", error.message);
    throw new Error("Lỗi khi lấy danh sách địa chỉ khám thai");
  }
};

// Lấy thông tin địa chỉ khám thai theo ID
export const getPregnancyVisitAddressByIdHandle = async (addressId) => {
  try {
    const address = await PregnancyVisitAddress.findById(addressId).select(
      "-__v -createdAt -updatedAt"
    );

    if (!address) {
      throw new Error("Không tìm thấy địa chỉ khám thai");
    }

    return address;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin địa chỉ khám thai:", error.message);
    throw new Error("Lỗi khi lấy thông tin địa chỉ khám thai");
  }
};

// Cập nhật thông tin địa chỉ khám thai
export const updatePregnancyVisitAddressHandle = async (addressId, payload) => {
  try {
    const { phoneNumber, clinicName, wardId, districtId, provinceId } = payload;

    const updatedAddress = await PregnancyVisitAddress.findByIdAndUpdate(
      addressId,
      {
        $set: {
          clinicName,
          phoneNumber,
          wardId,
          districtId,
          provinceId,
        },
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedAddress) {
      throw new Error("Không tìm thấy địa chỉ khám thai để cập nhật");
    }

    return updatedAddress;
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ khám thai:", error.message);
    throw new Error("Lỗi khi cập nhật địa chỉ khám thai");
  }
};

// Xóa một địa chỉ khám thai
export const deletePregnancyVisitAddressHandle = async (addressId) => {
  try {
    const deletedAddress = await PregnancyVisitAddress.findByIdAndDelete(
      addressId
    );

    if (!deletedAddress) {
      throw new Error("Không tìm thấy địa chỉ khám thai để xóa");
    }

    return { message: "Xóa địa chỉ khám thai thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ khám thai:", error.message);
    throw new Error("Lỗi khi xóa địa chỉ khám thai");
  }
};
