import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../../../services/doctor.service";
import Footer from "../../../pages/user/Footer";
import Loading from "../../../pages/Loading";
import { Link } from "react-router-dom";
import Banner from "../user/Banner";
import BookingBanner from "../../ui/banner/BookingBanner";
import { getProvinces } from "../../../services/address.service";

const BookExamination = () => {
  const dispatch = useDispatch();
  const { provinces } = useSelector((state) => state.address);
  const { loading, doctors, pagination } = useSelector((state) => state.doctor);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);
  // Local state for search functionality
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    specialty: "",
    search: "",
    page: 1,
    limit: 12,
  });
  useEffect(() => {
    dispatch(getProvinces());
  }, []);

  const handleSearchDoctors = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setSearchFilters((prev) => ({
        ...prev,
        search: value.trim(),
        page: 1,
      }));

      setIsSearching(!!value.trim());
    }, 500);
  };

  // Fetch doctors on component mount and when filters change
  useEffect(() => {
    dispatch(fetchDoctors(searchFilters));
  }, [searchFilters, dispatch]);

  // 👉 Dọn dẹp timeout khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchFilters((prev) => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setSearchFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle popular keyword clicks
  const handleKeywordClick = (keyword) => {
    setSearchFilters((prev) => ({
      ...prev,
      specialty: keyword,
      page: 1,
    }));
  };

  console.log({ searchFilters });

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <Header />
      <BookingBanner />

      {/* Search Section */}
      <div className="w-full flex bg-light-50">
        <div className="container flex flex-col mx-auto py-6 lg:py-10 px-4 lg:px-6 mt-2">
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2"
          >
            {/* Location Select */}
            <select
              className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700 w-full sm:w-auto"
              value={searchFilters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            >
              <option value="all">Địa điểm</option>
              {provinces?.map((province) => (
                <option key={province._id} value={province._id}>
                  {province.name}
                </option>
              ))}
            </select>

            {/* Specialty Select */}
            <select
              className="px-4 py-2 rounded-lg border border-dark-700 text-sm text-gray-700 w-full sm:w-auto"
              value={searchFilters.specialty}
              onChange={(e) => handleFilterChange("specialty", e.target.value)}
            >
              <option value="">Tất cả chuyên khoa</option>
              <option value="Tim mạch">Tim mạch</option>
              <option value="Nhi">Nhi</option>
              <option value="Sản phụ khoa">Sản phụ khoa</option>
              <option value="Nội tiết">Nội tiết</option>
              <option value="Da liễu">Da liễu</option>
              <option value="Thần kinh">Thần kinh</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Tìm kiếm với tên Bệnh viện hoặc Bác sĩ"
              className="flex-1 px-4 py-2 rounded-lg border border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              value={searchTerm}
              onChange={handleSearchDoctors}
            />

            {/* Search Button */}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Popular Keywords */}
          <div className="mt-4 flex items-start sm:items-center flex-wrap gap-2 text-sm">
            <span className="text-gray-500 font-medium whitespace-nowrap">
              Từ khóa Phổ Biến
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleKeywordClick("Nhi")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
              >
                Khám nhi
              </button>
              <button
                onClick={() => handleKeywordClick("Sản phụ khoa")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
              >
                Khám sản phụ khoa
              </button>
              <button
                onClick={() => handleKeywordClick("Tim mạch")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
              >
                Tim mạch
              </button>
              <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors">
                Xem tất cả
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="w-full flex bg-vivanta-100 pb-10 lg:pb-20">
        <div className="container flex flex-col mx-auto py-6 lg:py-10 px-4 lg:px-6 mt-2">
          {/* Section Title with Results Count */}
          <div className="w-full flex items-center justify-between text-lg lg:text-xl text-vivanta-cyan-500 py-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-user-doctor"></i>
              <h1 className="font-bold">Top bác sĩ nổi bật</h1>
            </div>
            {pagination && (
              <span className="text-sm text-gray-600">
                Tìm thấy {pagination.total} bác sĩ
              </span>
            )}
          </div>

          {/* No Results Message */}
          {doctors?.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-12 text-center">
              <i className="fa-solid fa-search text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Không tìm thấy bác sĩ nào
              </h3>
              <p className="text-gray-500">
                Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc
              </p>
            </div>
          ) : (
            <>
              {/* Doctors Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {doctors?.map((doctor) => (
                  <div key={doctor._id} className="w-full">
                    <div className="w-full h-full flex flex-col justify-between bg-light-50 rounded-md p-3 relative shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      {/* Doctor Info */}
                      <div className="w-full flex flex-col">
                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 text-xs flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
                          <span className="font-semibold">{doctor.rate}</span>
                          <span className="text-gray-400">/5</span>
                          <i className="fa-solid fa-star text-amber-400"></i>
                        </div>

                        {/* Doctor Avatar */}
                        <div className="w-full flex justify-center py-3">
                          <div className="relative">
                            <img
                              className="w-16 h-16 lg:w-20 lg:h-20 aspect-square object-cover rounded-full border-3 border-white shadow-md"
                              src={doctor.avatar.url}
                              alt={doctor.name}
                              onError={(e) => {
                                e.target.src = "/default-avatar.png"; // Fallback image
                              }}
                            />
                            {/* Online status indicator could be added here */}
                          </div>
                        </div>

                        {/* Doctor Details */}
                        <div className="w-full flex flex-col items-center py-3">
                          <h2 className="font-bold text-sm lg:text-base text-center line-clamp-2 mb-2">
                            {doctor.name}
                          </h2>
                          <div className="text-xs lg:text-sm py-1 text-center text-blue-600 font-medium">
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
                          <p
                            className="line-clamp-2 text-left"
                            title={doctor.infoClinic.clinicName}
                          >
                            {doctor.infoClinic.clinicName}
                          </p>
                        </div>

                        {/* Clinic Address */}
                        <div className="w-full flex gap-2 py-2 text-dark-400">
                          <i className="fa-solid fa-map-location-dot flex-shrink-0 mt-0.5"></i>
                          <p className="line-clamp-2 text-left">
                            {doctor.infoClinic.address.wardId.name},{" "}
                            {doctor.infoClinic.address.districtId.name},{" "}
                            {doctor.infoClinic.address.provinceId.name}
                          </p>
                        </div>

                        {/* Phone Number */}
                        <div className="w-full flex gap-2 py-2 text-dark-400">
                          <i className="fa-solid fa-phone flex-shrink-0 mt-0.5"></i>
                          <p className="text-left">{doctor.infoClinic.phone}</p>
                        </div>

                        {/* Booking Button */}
                        <Link
                          to={`/book-examination/info?name=${encodeURIComponent(
                            doctor.name
                          )}&id=${doctor._id}`}
                          className="w-full flex justify-center items-center border border-dark-800 bg-light-50 rounded-md py-2 lg:py-3 cursor-pointer hover:bg-vivanta-500 hover:text-light-50 font-bold text-xs lg:text-sm transition-all duration-300 mt-2"
                        >
                          <i className="fa-solid fa-calendar-plus mr-2"></i>
                          <span>Đặt lịch khám</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="w-full flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === pagination.page
                            ? "bg-blue-500 text-white"
                            : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookExamination;
