import React from "react";
import Header from "../Header";
import { useDispatch, useSelector } from "react-redux";
import { useDebugValue } from "react";
import { useEffect } from "react";
import { fetchDoctors } from "../../../services/doctor.service";
import Footer from "../../../pages/user/Footer";
import Loading from "../../../pages/Loading";
import { Link } from "react-router-dom";
import Banner from "../user/Banner";
import BookingBanner from "../../ui/banner/BookingBanner";

const BookExamination = () => {
  const dispatch = useDispatch();
  const { loading, doctors, pagination } = useSelector((state) => state.doctor);
  useEffect(() => {
    dispatch(fetchDoctors({ page: 1, limit: 10 }));
  }, []);

  if (loading) {
    return (
      <div className="">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />
      <BookingBanner />
      <div className="w-full flex bg-light-50">
        <div className="container flex flex-col mx-auto py-10 px-6 mt-2">
          {/* Thanh tìm kiếm */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-2 flex-wrap">
            <select className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700">
              <option value="">Tất cả vị trí</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hcm">TP.HCM</option>
              {/* Thêm các vị trí khác nếu cần */}
            </select>

            <select className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700">
              <option value="">Tất cả chuyên khoa</option>
              <option value="nhi">Nhi</option>
              <option value="san">Sản phụ khoa</option>
              <option value="noitiet">Nội tiết</option>
            </select>

            <input
              type="text"
              placeholder="Tìm kiếm với tên Bệnh viện"
              className="flex-1 px-4 py-2 rounded-lg border border-dark-700 text-sm focus:outline-none"
            />

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">
              Tìm kiếm
            </button>
          </div>

          {/* Từ khóa phổ biến */}
          <div className="mt-4 flex items-center flex-wrap gap-2 text-sm">
            <span className="text-gray-500 font-medium">Từ khóa Phổ Biến</span>
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700">
              Khám nhi
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700">
              Khám sản phụ khoa
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700">
              Gói khám sức khỏe
            </button>
            <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-blue-100">
              Xem tất cả
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex  bg-vivanta-100 pb-20">
        <div className="container flex flex-col mx-auto py-10 px-6 mt-2">
          <div className="w-full flex items-center gap-2 text-xl  text-vivanta-cyan-500 py-3">
            <i className="fa-solid fa-user-doctor"></i>
            <h1 className="font-bold">Top bác sĩ nổi bật</h1>
          </div>
          <div className="w-full h-full flex flex-wrap">
            {doctors?.map((doctor) => (
              <div key={doctor._id} className="w-3/12  min-h-full pr-3 pt-2 ">
                <div className="w-full min-h-full flex flex-col justify-between  bg-light-50 rounded-md p-3 relative">
                  <div className="w-full  flex flex-col ">
                    <div className="absolute top-2 right-2 text-xs flex items-center gap-1">
                      <span>{doctor.rate}/5</span>
                      <i className="fa-solid fa-star text-amber-300"></i>
                    </div>
                    <div className="w-full flex justify-center py-3">
                      <img
                        className="w-16 h-16 aspect-square object-cover rounded-full"
                        src={doctor.userId.avatar.url}
                        alt=""
                      />
                    </div>
                    <div className="w-full flex flex-col items-center py-3">
                      <h1 className="font-bold text-sm ">{doctor.name}</h1>
                      <div className="text-xs py-1">
                        {doctor.specialty.map((spec, index) => (
                          <span key={index}>
                            {spec}
                            {index !== doctor.specialty.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-col  items-center bg-dark-900 text-xs p-3 rounded-sm">
                    <div className="w-full flex  gap-2 py-2 text-dark-400">
                      <i className="fa-solid fa-hospital"></i>
                      <p className="h-6 line-clamp-2">
                        {doctor.infoClinic.clinicName}
                      </p>
                    </div>
                    <div className="w-full flex  gap-2 py-2 text-dark-400">
                      <i className="fa-solid fa-map-location-dot"></i>
                      <p className="line-clamp-2">
                        {doctor.infoClinic.address}
                      </p>
                    </div>{" "}
                    <Link
                      to={`/book-examination/info?name=${doctor.name}&id=${doctor._id}`}
                      className="w-full flex justify-center items-center border-1 border-dark-800 bg-light-50 rounded-md py-2 cursor-pointer hover:bg-vivanta-500 hover:text-light-50 font-bold"
                    >
                      <span> Đặt lịch khám</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookExamination;
