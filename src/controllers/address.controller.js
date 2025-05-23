import {
  getProvinces,
  getDistricts,
  getWards,
  createProvince,
  updateProvince,
  removeProvince,
  createDistricts,
  createWard,
} from "../services/address.service.js";

export const provinces = async (req, res) => {
  try {
    let provinces = await getProvinces();
    provinces = provinces.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json({ provinces });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const districts = async (req, res) => {
  const { provinceId } = req.params;
  try {
    const districts = await getDistricts(provinceId);
    res.status(200).json({ districts });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const wards = async (req, res) => {
  const { districtId } = req.params;
  try {
    const wards = await getWards(districtId);
    res.status(200).json({ wards });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createProvinceHandler = async (req, res) => {
  try {
    const province = await createProvince(req.body.provinces);
    res.status(201).json(province);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProvinceHandler = async (req, res) => {
  try {
    const updatedProvince = await updateProvince(req.params.id, req.body);
    res.status(200).json(updatedProvince);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeProvinceHandler = async (req, res) => {
  try {
    const deletedProvince = await removeProvince(req.params.id);
    res.status(200).json(deletedProvince);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createDistrictsHandler = async (req, res) => {
  try {
    const districts = await createDistricts(req.body.districts);
    res.status(201).json(districts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createWardsHandler = async (req, res) => {
  try {
    const wards = await createWard(req.body.wards);
    res.status(201).json(wards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
