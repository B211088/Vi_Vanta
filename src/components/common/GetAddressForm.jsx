import React, { useEffect, useState } from "react";
import { useTheme } from "../../hook/useTheme";
import { useDispatch, useSelector } from "react-redux";
import {
  getDistricts,
  getProvinces,
  getWards,
} from "../../services/address.service";

const GetAddressForm = ({ onChangeAddress }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { address } = useSelector((state) => state.auth);
  const { provinces, districts, wards } = useSelector((state) => state.address);
  const [currentAddress, setCurrentAddress] = useState({
    province: null,
    district: null,
    ward: null,
  });
  useEffect(() => {
    dispatch(getProvinces());
  }, [dispatch]);

  useEffect(() => {
    if (
      address?.province?._id &&
      address?.district?._id &&
      address?.ward?._id &&
      !currentAddress.province &&
      !currentAddress.district &&
      !currentAddress.ward
    ) {
      setCurrentAddress({
        province: address.province._id,
        district: address.district._id,
        ward: address.ward._id,
      });
    }
  }, [address]);

  useEffect(() => {
    if (currentAddress.province) {
      dispatch(getDistricts(currentAddress.province));
    }
  }, [currentAddress.province]);

  useEffect(() => {
    if (currentAddress.district) {
      dispatch(getWards(currentAddress.district));
    }
  }, [currentAddress.district]);

  const handleChangeProvince = (e) => {
    const provinceId = e.target.value;
    setCurrentAddress({
      province: provinceId,
      district: "",
      ward: "",
    });
  };

  const handleChangeDistrict = (e) => {
    const districtId = e.target.value;
    setCurrentAddress({
      ...currentAddress,
      district: districtId,
      ward: "",
    });
  };

  useEffect(() => {
    if (currentAddress) {
      const { province, district, ward } = currentAddress;
      onChangeAddress({ province, district, ward });
    }
  }, [currentAddress]);

  const handleChangeWard = (e) => {
    const wardId = e.target.value;
    setCurrentAddress({ ...currentAddress, ward: wardId });
  };

  return (
    <div className="w-full flex flex-col gap-[16px]">
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Tỉnh</span>
        <select
          className={`w-full flex items-center border-[1px] py-[6px] outline-none text-sm ${
            isDarkMode ? "border-dark-600" : "bg-dark-400 border-transparent"
          } rounded-sm`}
          value={currentAddress.province || ""}
          name="province"
          onChange={handleChangeProvince}
        >
          <option value="">Chọn tỉnh</option>
          {provinces?.map((province) => (
            <option key={province._id} value={province._id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Huyện</span>
        <select
          className={`w-full flex items-center border-[1px] py-[6px] outline-none text-sm ${
            isDarkMode ? "border-dark-600" : "bg-dark-400 border-transparent"
          } rounded-sm`}
          name="district"
          value={currentAddress.district || ""}
          onChange={handleChangeDistrict}
        >
          <option value="">Chọn huyện</option>
          {districts?.map((district) => (
            <option key={district._id} value={district._id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>{" "}
      <div className="w-full flex flex-col">
        <span className="text-sm font-bold pb-[5px]">Xã</span>
        <select
          className={`w-full flex items-center border-[1px] py-[6px] outline-none text-sm ${
            isDarkMode ? "border-dark-600" : "bg-dark-400 border-transparent"
          } rounded-sm`}
          name="ward"
          value={currentAddress.ward || ""}
          onChange={handleChangeWard}
        >
          <option value="">Chọn Xã</option>
          {wards?.map((ward) => (
            <option key={ward._id} value={ward._id}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GetAddressForm;
