import { useSelector } from "react-redux";
import { formatDateDDMMYY } from "../../utils/formatDate";
import UpdateUserProfileModal from "../modals/UpdateUserProfileModal";
import { useState } from "react";
import UploadUserAvatarModal from "../modals/UploadUserAvatarModal";
import UpdateUserAddress from "../modals/UpdateUserAddress";

const Profile = () => {
  const { user, address } = useSelector((state) => state.auth);
  const [updateUserProfileModal, setUpdateUserProfileModal] = useState(false);
  const [uploadUserAvatarModal, setUploadUserAvatarModal] = useState(false);
  const [updataUserAddressModal, setUpdataUserAddressModa] = useState(false);
  console.log({ address });
  return (
    <div className="flex-1 flex flex-col gap-[20px] pl-[20px] overflow-hidden">
      {updateUserProfileModal && (
        <UpdateUserProfileModal
          currentData={user}
          closeModal={() => setUpdateUserProfileModal(false)}
        />
      )}
      {uploadUserAvatarModal && (
        <UploadUserAvatarModal
          closeModal={() => setUploadUserAvatarModal(false)}
        />
      )}
      {updataUserAddressModal && (
        <UpdateUserAddress closeModal={() => setUpdataUserAddressModa(false)} />
      )}
      <div className="w-full flex items-center gap-[20px] border-1 border-[#efefef] shadow rounded-lg p-[20px]">
        <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center border-[1px] border-[#ccc]">
          <img
            className="w-full h-full aspect-square rounded-full "
            src={user?.avatar.url}
            alt=""
          />
        </div>
        <div className="flex-1 flex flex-col gap-[5px]">
          <h1 className="text-[1rem] font-bold">{user?.fullName}</h1>
          <p className="text-sm">ID:{user?.ID}</p>
          <div className="text-sm text-dark-300 font-semibold">
            <div className="w-full flex items-center gap-[5px]">
              <span>Quyền:</span>
              {user.roles.map((role, index) => (
                <div key={index}>
                  {role === "user"
                    ? "Người dùng"
                    : role === "admin"
                    ? "Quản trị viên"
                    : "Bác sĩ"}
                  {user.roles.length > 1 ? "," : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="flex items-center border-[1px] border-dark-600 rounded-full py-[5px] px-[10px] gap-[5px] cursor-pointer"
          onClick={() => setUploadUserAvatarModal(true)}
        >
          <span className="text-sm">Đổi avatar</span>
          <i className="fa-solid fa-upload"></i>
        </div>
      </div>
      <div className="w-full flex flex-col items-center gap-[20px] border-1 border-[#efefef] shadow rounded-lg p-[20px]">
        <div className="w-full flex justify-between">
          <h1 className="font-bold">Thông tin cá nhân</h1>
          <div
            className="flex items-center border-[1px] border-dark-600 rounded-full py-[5px] px-[10px] gap-[5px] cursor-pointer"
            onClick={() => setUpdateUserProfileModal(true)}
          >
            <span className="text-sm">Cập nhật</span>
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
        </div>
        <div className="w-full flex   gap-[5px]">
          <div className="w-6/12 flex flex-col gap-[20px]">
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Họ và tên</p>
              <h3 className="text-[1rem] font-semibold">
                {user.fullName ? user.fullName : "Chưa cập nhật"}
              </h3>
            </div>
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Địa chỉ email</p>
              <h3 className="text-[1rem] font-semibold">
                {user.email ? user.email : "Chưa cập nhật"}
              </h3>
            </div>{" "}
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Giới tính</p>
              <div className="text-[1rem] font-semibold">
                <div
                  className={`flex items-center gap-[5px] ${
                    user.gender
                      ? user?.gender === "male"
                        ? "text-blue-500"
                        : user?.gender === "female"
                        ? "text-pink-500"
                        : "text-violet-500"
                      : ""
                  }`}
                >
                  {user.gender ? (
                    user?.gender === "male" ? (
                      <i className="fa-solid fa-mars"></i>
                    ) : user?.gender === "female" ? (
                      <i className="fa-solid fa-venus"></i>
                    ) : (
                      <i className="fa-solid fa-venus-mars"></i>
                    )
                  ) : (
                    ""
                  )}

                  <span className="  font-bold">
                    {user.gender
                      ? user?.gender === "male"
                        ? "Nam"
                        : user?.gender === "female"
                        ? "Nữ"
                        : "Khác"
                      : "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-6/12 flex flex-col gap-[20px]">
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Ngày sinh</p>
              <h3 className="text-[0.95rem] font-semibold">
                {user.dateOfBirth
                  ? formatDateDDMMYY(user?.dateOfBirth)
                  : "Chưa cập nhật"}
              </h3>
            </div>
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Số điện thoại</p>
              <h3 className="text-[0.95rem] font-semibold">
                {user?.phone ? user?.phone : "Chưa cập nhật"}
              </h3>
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="w-full flex flex-col items-center gap-[20px] border-1 border-[#efefef] shadow rounded-lg p-[20px]">
        <div className="w-full flex justify-between">
          <h1 className="font-bold">Địa chỉ</h1>
          <div
            className="flex items-center border-[1px] border-dark-600 rounded-full py-[5px] px-[10px] gap-[5px] cursor-pointer"
            onClick={() => setUpdataUserAddressModa(true)}
          >
            <span className="text-sm">Cập nhật</span>
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
        </div>
        <div className="w-full flex  gap-[5px]">
          <div className="w-6/12 flex flex-col gap-[20px]">
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Tỉnh</p>
              <h3 className="text-[1rem] font-semibold">
                {address?.province ? address.province.name : "Chưa cập nhật"}
              </h3>
            </div>
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Xã/Phường/Thị trấn</p>
              <h3 className="text-[1rem] font-semibold">
                {address?.ward ? address.ward.name : "Chưa cập nhật"}
              </h3>
            </div>
          </div>
          <div className="w-6/12 flex flex-col gap-[20px]">
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Quân/Huyện</p>
              <h3 className="text-[1rem] font-semibold">
                {address?.district ? address.district.name : "Chưa cập nhật"}
              </h3>
            </div>
            <div className="w-full flex flex-col gap-[3px]">
              <p className="text-sm ">Địa chỉ cụ thể</p>
              <h3 className="text-[1rem] font-semibold">
                {address?.specificAddress
                  ? address.specificAddress
                  : "Chưa cập nhật"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
