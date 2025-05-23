import { useEffect, useState } from "react";
import Modal from "../layout/Modal";
import GetAddressForm from "../common/GetAddressForm";
import { useTheme } from "../../hook/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { useNotify } from "../../hook/useNotify";
import { updateUserAddress } from "../../services/auth.service";

const UpdateUserAddress = ({ closeModal }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { address } = useSelector((state) => state.auth);
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { loading, error } = useSelector((state) => state.address);
  const [formData, setFormData] = useState({
    provinceId: address.province ? address.province._id : "",
    districtId: address.district ? address.district._id : "",
    wardId: address.ward ? address.ward._id : "",
    specificAddress: address?.specificAddress || "",
  });

  useEffect(() => {
    const { province, district, ward } = selectedAddress || {};
    setFormData((prev) => ({
      ...prev,
      provinceId: province || null,
      districtId: district || null,
      wardId: ward || null,
    }));
  }, [selectedAddress]);

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { provinceId, districtId, wardId, specificAddress } = formData;
    if (!provinceId || !districtId || !wardId) {
      notifyWarning("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    try {
      const response = await dispatch(
        updateUserAddress({
          ...formData,
          specificAddress: specificAddress.trim(),
        })
      );
      if (response.success) {
        notifySuccess("Cập nhật địa chỉ thành công");
        closeModal();
      } else {
        notifyError("Có lỗi xảy ra khi cập nhật.");
      }
    } catch (error) {
      notifyError(error.message || "Lỗi hệ thống.");
    }
  };

  return (
    <Modal closeModal={closeModal}>
      {" "}
      <div
        className="w-5/12 max-w-[600px] flex flex-col bg-light-50 p-[26px] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <h1 className="font-bold text-2xl pb-[20px]">
          Cập nhật địa chỉ của bạn
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-[25px]"
        >
          <GetAddressForm onChangeAddress={handleAddressChange} />
          <div className="w-full flex flex-col">
            <span className="text-sm font-bold pb-[5px]">Địa chỉ cụ thể</span>
            <div
              className={`w-full flex items-center border-[1px] ${
                isDarkMode
                  ? " border-dark-600 "
                  : "bg-dark-400 border-transparent"
              }  rounded-sm`}
            >
              <textarea
                className="flex-1 min-h-[80px] max-h-[120px] text-sm px-[5px] py-[8px] outline-none"
                placeholder="Nhập địa chỉ cụ thể của bạn"
                type="text"
                name="specificAddress"
                value={formData.specificAddress}
                onChange={handleChange}
              />
            </div>{" "}
          </div>{" "}
          <div className="w-full flex flex-col gap-[15px]">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
             ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-dark-600"} 
             transition-colors cursor-pointer`}
            >
              <span>{loading ? "Đang xử lý..." : "Xác nhận"}</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={closeModal}
              className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm border-[1px] border-dark-600 font-bold cursor-pointer `}
            >
              <span>Quay lại</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateUserAddress;
