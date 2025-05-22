import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../services/auth.service";

const User = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log({ user });

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-[15px]">
      <div className="flex items-center gap-[5px]">
        <div className="w-[38px] h-[38px] flex items-center justify-center bg-dark-800 rounded-full relative cursor-pointer">
          <i className="fa-regular fa-bell text-xl"></i>
          <div className="w-[16px] h-[16px] absolute top-[2px] right-[2px] text-[0.5rem] bg-red-500 text-light-50 rounded-full flex items-center justify-center">
            {0}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[5px]">
        <div className="w-[38px] h-[38px] flex items-center justify-center bg-dark-800 rounded-full relative cursor-pointer">
          <i className="fa-regular fa-comment-dots text-xl"></i>
          <div className="w-[16px] h-[16px] absolute top-[2px] right-[2px] text-[0.5rem] bg-red-500 text-light-50 rounded-full flex items-center justify-center">
            {0}
          </div>
        </div>
      </div>
      <div className=" flex items-center gap-[5px]  group relative">
        <p className="truncate text-sm font-semibold">{user.fullName}</p>
        <div className="w-[38px] h-[38px]  flex items-center justify-center bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
          <img
            className="w-full h-full object-cover "
            src={user.avatar.url}
            alt=""
          />
          <div className="w-[16px] h-[16px] absolute bottom-[2px] right-[2px] text-[0.5rem] bg-dark-700 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-angle-down"></i>
          </div>
        </div>
        <div className=" absolute hidden group-hover:flex group-hover:flex-col top-[100%] right-[0%]  bg-light-50 rounded-sm shadow-md ">
          <div className="w-full flex items-center gap-[20px] px-[20px] py-[10px] border-b-[1px] border-dark-600">
            <div className="w-[52px] h-[52px]  flex items-center justify-center bg-dark-800 rounded-full  overflow-hidden relative cursor-pointer">
              <img
                className="w-full h-full object-cover "
                src={user.avatar.url}
                alt=""
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <h1 className="font-bold">{user.fullName}</h1>
              <p className="text-sm">ID:{user.ID}</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
          <div className="w-full flex justify-center items-center p-[10px]">
            <button
              className="w-full px-[10px] py-[8px] bg-dark-600 rounded-md text-sm text-light-50 font-bold cursor-pointer"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
