import { Address, Ward, District, Province } from "../models/index.js";

export const getProvinces = async () => {
  try {
    const province = await Province.find().select("-__v -createdAt -updatedAt");
    return province;
  } catch (error) {
    throw new Error("không thể lấy tỉnh!");
  }
};

export const createProvince = async (payload) => {
  try {
    const savedProvinces = [];

    for (const province of payload) {
      const newProvince = new Province({ name: province });
      const savedProvince = await newProvince.save();
      savedProvinces.push(savedProvince);
    }

    return savedProvinces;
  } catch (error) {
    throw new Error("Không thể tạo tỉnh mới!");
  }
};

export const updateProvince = async (provinceId, data) => {
  try {
    const updatedProvince = await Province.findByIdAndUpdate(
      provinceId,
      { $set: data },
      { new: true }
    );
    return updatedProvince;
  } catch (error) {
    throw new Error("Không thể cập nhật tỉnh!");
  }
};

export const removeProvince = async (provinceId) => {
  try {
    const deletedProvince = await Province.findByIdAndDelete(provinceId);
    return deletedProvince;
  } catch (error) {
    throw new Error("Không thể xóa tỉnh!");
  }
};

export const getDistricts = async (provinceId) => {
  try {
    const district = await District.find({ provinceId }).select(
      "-__v -createdAt -updatedAt"
    );
    return district;
  } catch (error) {
    throw new Error("không thể lấy tỉnh!");
  }
};

export const createDistricts = async (payload) => {
  try {
    const savedDistricts = await Promise.all(
      payload.map((district) => {
        const newDistrict = new District(district);
        return newDistrict.save();
      })
    );

    return savedDistricts;
  } catch (error) {
    throw new Error("Không thể tạo danh sách quận/huyện!");
  }
};

export const updateDistrict = async (districtId, payload) => {
  try {
    const updatedDistrict = await District.findByIdAndUpdate(
      districtId,
      { $set: payload },
      { new: true }
    );
    return updatedDistrict;
  } catch (error) {
    throw new Error("Không thể cập nhật quận/huyện!");
  }
};

export const removeDistrict = async (districtId) => {
  try {
    const deletedDistrict = await District.findByIdAndDelete(districtId);
    return deletedDistrict;
  } catch (error) {
    throw new Error("Không thể xóa quận/huyện!");
  }
};

export const getWards = async (districtId) => {
  try {
    const ward = await Ward.find({ districtId }).select(
      "-__v -createdAt -updatedAt"
    );
    return ward;
  } catch (error) {
    throw new Error("không thể lấy tỉnh!");
  }
};

export const createWard = async (payload) => {
  try {
    const savedWards = await Promise.all(
      payload.map((ward) => {
        const newWard = new Ward(ward);
        return newWard.save();
      })
    );

    return savedWards;
  } catch (error) {
    throw new Error("Không thể tạo danh sách xã!");
  }
};

export const updateWard = async (wardId, payload) => {
  try {
    const updatedWard = await Ward.findByIdAndUpdate(
      wardId,
      { $set: payload },
      { new: true }
    );
    return updatedWard;
  } catch (error) {
    throw new Error("Không thể cập nhật phường/xã!");
  }
};

export const removeWard = async (wardId) => {
  try {
    const deletedWard = await Ward.findByIdAndDelete(wardId);
    return deletedWard;
  } catch (error) {
    throw new Error("Không thể xóa phường/xã!");
  }
};
