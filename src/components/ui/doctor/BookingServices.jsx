import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckSquare,
  X,
  Upload,
  FileText,
  AlertTriangle,
  LucideEyeOff,
  Stethoscope,
} from "lucide-react";
import {
  fetchDoctorByUserId,
  getMyServices,
  createService,
  updateService,
  toggleServiceStatus,
  duplicateService,
  deleteService,
  bulkUpdateServices,
  exportServices,
  searchServices,
  getServiceStats,
  hardDeleteService,
} from "../../../services/doctor.service";
import { clearServiceMessages } from "../../../store/slices/doctor.slice";
import { useNotify } from "../../../hook/useNotify";

// Create/Edit Service Modal Component
const ServiceModal = ({ isOpen, onClose, service, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    reasons: [],
    isActive: true,
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [newReason, setNewReason] = useState("");

  const handleAddReason = () => {
    if (newReason.trim()) {
      setFormData((prev) => ({
        ...prev,
        reasons: [...prev.reasons, newReason.trim()],
      }));
      setNewReason("");
    }
  };
  const handleRemoveReason = (index) => {
    const updated = formData.reasons.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      reasons: updated,
    }));
  };

  useEffect(() => {
    if (service && isEditing) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        reasons: service.reasons,
        isActive: service.isActive ?? true,
        image: null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        reasons: [],
        isActive: true,
        image: null,
      });
    }
    setErrors({});
  }, [service, isEditing, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên dịch vụ là bắt buộc";
    if (!formData.description.trim())
      newErrors.description = "Mô tả là bắt buộc";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Giá phải lớn hơn 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        price: Number(formData.price),
      };
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0000001f] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên dịch vụ"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Mô tả chi tiết dịch vụ"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
                min="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Kích hoạt dịch vụ ngay
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? "Cập nhật" : "Tạo dịch vụ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal

const BookingServices = () => {
  const dispatch = useDispatch();
  const {
    services = [],
    doctor,
    serviceStats,
    loading,
    successMessage,
    error,
  } = useSelector((state) => state.doctor);

  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!doctor) {
      dispatch(fetchDoctorByUserId());
    }
  }, [dispatch, doctor]);

  useEffect(() => {
    if (doctor) {
      dispatch(getMyServices(doctor._id, {}));
      dispatch(getServiceStats(doctor._id));
    }
  }, [dispatch, doctor]);
  console.log({ doctor, serviceStats, services });
  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearServiceMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const displayServices = services.length > 0 ? services : [];

  // Filter services
  const filteredServices = displayServices.filter((service) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && service.isActive) ||
      (filterStatus === "inactive" && !service.isActive);
    return matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate statistics
  const stats = {
    total: displayServices.length,
    active: displayServices.filter((s) => s.isActive).length,
    inactive: displayServices.filter((s) => !s.isActive).length,
    totalRevenue: displayServices.reduce((sum, s) => sum + (s.revenue || 0), 0),
    totalBookings: displayServices.reduce(
      (sum, s) => sum + (s.bookingCount || 0),
      0
    ),
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSelectService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === paginatedServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(paginatedServices.map((s) => s._id));
    }
  };

  const handleCreateService = async (formData) => {
    try {
      const response = await dispatch(createService(doctor._id, formData));
      notifySuccess(response.data.message);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };

  const handleEditService = async (formData) => {
    try {
      const response = await dispatch(
        updateService(editingService._id, formData)
      );
      setShowEditModal(false);
      setEditingService(null);
      notifySuccess(response.data.message || "Cập nhật dịch vụ thành công!");
      dispatch(getMyServices(doctor._id, {}));
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      await dispatch(toggleServiceStatus(serviceId));
    } catch (error) {
      notifyError(
        error.response.data.message || "Đổi trạng thái dịch vụ thành công!"
      );
    }
  };

  const handleDuplicate = async (serviceId) => {
    try {
      await dispatch(duplicateService(serviceId));
    } catch (error) {
      console.error("Error duplicating service:", error);
    }
  };

  const handleDelete = async (service) => {
    try {
      const confirm = await notifyConfirm("Bạn có muốn ẩn dịch vụ này không!");
      if (confirm) {
        dispatch(deleteService(service._id));
      }
      notifySuccess("Ẩn dịch vụ thành công!");
    } catch (error) {
      notifyError(error.response.data.message || "Lỗi trong khi ẩn dịch vụ!");
    }
  };
  const handleHardDelete = async (service) => {
    try {
      const confirm = await notifyConfirm("Bạn có muốn xóa dịch vụ này không!");
      if (confirm) {
        dispatch(hardDeleteService(service._id));
      }
      notifySuccess("Xóa dịch vụ thành công!");
    } catch (error) {
      notifyError(error.response.data.message || "Lỗi trong khi xóa dịch vụ!");
    }
  };

  const handleExport = async () => {
    try {
      await dispatch(exportServices(doctor._id, "excel"));
    } catch (error) {
      console.error("Error exporting services:", error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      let updates = {};

      switch (action) {
        case "activate":
          updates = { isActive: true };
          break;
        case "deactivate":
          updates = { isActive: false };
          break;
        case "delete":
          // Handle bulk delete differently
          await dispatch(
            bulkUpdateServices({
              serviceIds: selectedServices,
              updates: { isDeleted: true },
            })
          );
          setSelectedServices([]);
          // Refresh services list
          dispatch(getMyServices(doctor._id, {}));
          return;
        default:
          return;
      }

      await dispatch(
        bulkUpdateServices({ serviceIds: selectedServices, updates })
      );
      setSelectedServices([]);
      // Refresh services list
      dispatch(getMyServices(doctor._id, {}));
    } catch (error) {
      console.error("Error bulk updating services:", error);
    }
  };

  // Handle search with debounce
  const handleSearch = async () => {
    if (doctor) {
      try {
        await dispatch(
          searchServices(doctor._id, {
            searchTerm,
            status: filterStatus,
            page: currentPage,
            limit: itemsPerPage,
          })
        );
      } catch (error) {
        console.error("Error searching services:", error);
      }
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (doctor && (searchTerm || filterStatus !== "all")) {
        handleSearch();
      } else if (doctor) {
        dispatch(getMyServices(doctor._id, {}));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterStatus, doctor, currentPage]);

  return (
    <div className="min-h-screen w-full">
      <div className="w-full p-6">
        {/* Header */}{" "}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dịch vụ</h1>
                <p className="text-gray-600">
                  Quản lý dịch vụ của bạn khám chữa bệnh của bạn
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={loading.export}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {loading.export ? "Đang xuất..." : "Xuất dữ liệu"}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm dịch vụ mới
              </button>
            </div>
          </div>
        </div>
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={loading.bulkUpdate}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  Kích hoạt ({selectedServices.length})
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  disabled={loading.bulkUpdate}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
                >
                  Tạm dừng ({selectedServices.length})
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={loading.bulkUpdate}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                  Xóa ({selectedServices.length})
                </button>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Hiển thị:{" "}
              <span className="font-semibold">{filteredServices.length}</span>{" "}
              dịch vụ
            </div>
          </div>
        </div>
        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading.fetch ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedServices.length ===
                              paginatedServices.length &&
                            paginatedServices.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dịch vụ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lượt đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service._id)}
                            onChange={() => handleSelectService(service._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {service.image && (
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {service.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(service.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.duration} phút
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.bookingCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(service.revenue || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(service._id)}
                            disabled={loading.toggle}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors disabled:opacity-50 ${
                              service.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {service.isActive ? "Hoạt động" : "Tạm dừng"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(service._id)}
                              disabled={loading.duplicate}
                              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                              title="Sao chép"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Phân tích"
                            >
                              <TrendingUp className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Ẩn"
                            >
                              <LucideEyeOff className="w-4 h-4 text-red-600" />
                            </button>{" "}
                            <button
                              onClick={() => handleHardDelete(service)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Xóa Vĩnh Viễn"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy dịch vụ
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== "all"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                      : "Bạn chưa có dịch vụ nào. Hãy tạo dịch vụ đầu tiên!"}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo dịch vụ đầu tiên
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Pagination */}
        {filteredServices.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredServices.length)}
              </span>{" "}
              trong{" "}
              <span className="font-medium">{filteredServices.length}</span> kết
              quả
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateService}
        isEditing={false}
      />

      <ServiceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingService(null);
        }}
        service={editingService}
        onSubmit={handleEditService}
        isEditing={true}
      />
    </div>
  );
};

export default BookingServices;
