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
    dispatch(fetchDoctors({ page: 1, limit: 12 }));
  }, []);

  if (loading.fetch) {
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
        <div className="container flex flex-col mx-auto py-6 lg:py-10 px-4 lg:px-6 mt-2">
          {/* Search Bar - Responsive */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
            {/* Location Select */}
            <select className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700 w-full sm:w-auto">
              <option value="">Tất cả vị trí</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hcm">TP.HCM</option>
            </select>

            {/* Specialty Select */}
            <select className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700 w-full sm:w-auto">
              <option value="">Tất cả chuyên khoa</option>
              <option value="nhi">Nhi</option>
              <option value="san">Sản phụ khoa</option>
              <option value="noitiet">Nội tiết</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Tìm kiếm với tên Bệnh viện"
              className="flex-1 px-4 py-2 rounded-lg border border-dark-700 text-sm focus:outline-none min-w-0"
            />

            {/* Search Button */}
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              Tìm kiếm
            </button>
          </div>

          {/* Popular Keywords - Responsive */}
          <div className="mt-4 flex items-start sm:items-center flex-wrap gap-2 text-sm">
            <span className="text-gray-500 font-medium whitespace-nowrap">
              Từ khóa Phổ Biến
            </span>
            <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="w-full flex bg-vivanta-100 pb-10 lg:pb-20">
        <div className="container flex flex-col mx-auto py-6 lg:py-10 px-4 lg:px-6 mt-2">
          {/* Section Title */}
          <div className="w-full flex items-center gap-2 text-lg lg:text-xl text-vivanta-cyan-500 py-3">
            <i className="fa-solid fa-user-doctor"></i>
            <h1 className="font-bold">Top bác sĩ nổi bật</h1>
          </div>

          {/* Doctors Grid - Responsive */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {doctors?.map((doctor) => (
              <div key={doctor._id} className="w-full">
                <div className="w-full h-full flex flex-col justify-between bg-light-50 rounded-md p-3 relative shadow-sm hover:shadow-md transition-shadow">
                  {/* Doctor Info */}
                  <div className="w-full flex flex-col">
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 text-xs flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
                      <span>{doctor.rate}/5</span>
                      <i className="fa-solid fa-star text-amber-300"></i>
                    </div>

                    {/* Doctor Avatar */}
                    <div className="w-full flex justify-center py-3">
                      <img
                        className="w-16 h-16 lg:w-20 lg:h-20 aspect-square object-cover rounded-full border-2 border-gray-200"
                        src={doctor.userId.avatar.url}
                        alt={doctor.name}
                      />
                    </div>

                    {/* Doctor Details */}
                    <div className="w-full flex flex-col items-center py-3">
                      <h1 className="font-bold text-sm lg:text-base text-center line-clamp-2">
                        {doctor.name}
                      </h1>
                      <div className="text-xs lg:text-sm py-1 text-center text-gray-600">
                        {doctor.specialty.map((spec, index) => (
                          <span key={index}>
                            {spec}
                            {index !== doctor.specialty.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clinic Info & Booking Button */}
                  <div className="w-full flex flex-col items-center bg-dark-900 text-xs lg:text-sm p-3 rounded-sm">
                    {/* Clinic Name */}
                    <div className="w-full flex gap-2 py-2 text-dark-400">
                      <i className="fa-solid fa-hospital flex-shrink-0 mt-0.5"></i>
                      <p className="line-clamp-2 text-left">
                        {doctor.infoClinic.clinicName}
                      </p>
                    </div>

                    {/* Clinic Address */}
                    <div className="w-full flex gap-2 py-2 text-dark-400">
                      <i className="fa-solid fa-map-location-dot flex-shrink-0 mt-0.5"></i>
                      <p className="line-clamp-2 text-left">
                        {doctor.infoClinic.address}
                      </p>
                    </div>

                    {/* Booking Button */}
                    <Link
                      to={`/book-examination/info?name=${doctor.name}&id=${doctor._id}`}
                      className="w-full flex justify-center items-center border border-dark-800 bg-light-50 rounded-md py-2 lg:py-3 cursor-pointer hover:bg-vivanta-500 hover:text-light-50 font-bold text-xs lg:text-sm transition-colors mt-2"
                    >
                      <span>Đặt lịch khám</span>
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
