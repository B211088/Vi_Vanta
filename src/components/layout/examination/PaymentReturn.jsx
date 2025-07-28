import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleVNPayReturn } from "../../../services/booking.service";
import Header from "../Header";
import Footer from "../../../pages/user/Footer";
import { Check } from "lucide-react";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState("checking");
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");
  const [vnpayData, setVnpayData] = useState(null);
  const [serverVerified, setServerVerified] = useState(false);

  useEffect(() => {
    const processVNPayReturn = async () => {
      try {
        // 1. Extract VNPay parameters from URL
        const vnpayParams = extractVNPayParams();

        // 2. Set initial data for UI display
        const processedData = processVNPayParams(vnpayParams);
        setVnpayData(processedData);

        // 3. Call server verification API
        console.log("🔄 Calling server verification...");
        const serverResult = await dispatch(handleVNPayReturn(vnpayParams));

        if (serverResult.success) {
          console.log("✅ Server verification successful:", serverResult.data);
          setPaymentStatus("success");
          setMessage("Thanh toán thành công!");
          setServerVerified(true);

          // Update processed data with server response
          setVnpayData((prev) => ({
            ...prev,
            serverVerified: true,
            transactionId: serverResult.data.transactionId,
            isSuccess: true,
          }));
        } else {
          console.error("❌ Server verification failed:", serverResult.error);
          setPaymentStatus("failed");
          setMessage(serverResult.error || "Xác thực thanh toán thất bại");
          setServerVerified(false);

          setVnpayData((prev) => ({
            ...prev,
            serverVerified: false,
            isSuccess: false,
          }));
        }
      } catch (error) {
        console.error("❌ Error processing VNPay return:", error);
        setPaymentStatus("failed");
        setMessage("Có lỗi xảy ra khi xử lý thanh toán");
        setServerVerified(false);

        if (vnpayData) {
          setVnpayData((prev) => ({
            ...prev,
            serverVerified: false,
            isSuccess: false,
          }));
        }
      }
    };

    const extractVNPayParams = () => {
      // Extract all VNPay parameters from URL
      const vnpayParams = {};
      for (const [key, value] of searchParams.entries()) {
        if (key.startsWith("vnp_")) {
          vnpayParams[key] = value;
        }
      }

      console.log("🔍 Extracted VNPay params:", vnpayParams);
      return vnpayParams;
    };

    const processVNPayParams = (vnpayParams) => {
      // Process the parameters for UI display
      const processedData = {
        ...vnpayParams,
        amount: vnpayParams.vnp_Amount
          ? (parseInt(vnpayParams.vnp_Amount) / 100).toLocaleString("vi-VN")
          : "0",
        payDate: vnpayParams.vnp_PayDate
          ? formatPayDate(vnpayParams.vnp_PayDate)
          : "",
        orderInfo: vnpayParams.vnp_OrderInfo
          ? decodeURIComponent(vnpayParams.vnp_OrderInfo.replace(/\+/g, " "))
          : "",
        // Initial client-side check (will be overridden by server verification)
        isSuccess:
          vnpayParams.vnp_ResponseCode === "00" &&
          vnpayParams.vnp_TransactionStatus === "00",
        serverVerified: false,
      };

      return processedData;
    };

    const formatPayDate = (payDate) => {
      if (!payDate || payDate.length !== 14) return payDate;

      const year = payDate.substring(0, 4);
      const month = payDate.substring(4, 6);
      const day = payDate.substring(6, 8);
      const hour = payDate.substring(8, 10);
      const minute = payDate.substring(10, 12);
      const second = payDate.substring(12, 14);

      return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    // Start the verification process
    processVNPayReturn();
  }, [dispatch, searchParams]);

  const getErrorMessage = (responseCode) => {
    const errorMessages = {
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      10: "Đã giao hàng",
      11: "Giao dịch không thành công do: Tài khoản của khách hàng không đủ số dư",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      99: "Các lỗi khác",
    };

    return (
      errorMessages[responseCode] ||
      `Lỗi không xác định (Mã lỗi: ${responseCode})`
    );
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleRetryPayment = () => {
    navigate("/appointment-payment");
  };

  // Show loading while processing
  if (!vnpayData || paymentStatus === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            Đang xác nhận thanh toán với server...
          </p>
          <p className="text-sm text-gray-500">Vui lòng không đóng trang này</p>
        </div>
      </div>
    );
  }

  const isSuccess = vnpayData.isSuccess && serverVerified;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Status */}
          <div
            className={`p-6 text-center ${
              isSuccess ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="text-4xl mb-4">
              {isSuccess ? (
                <div className="w-full flex justify-center">
                  <div className=" border-7 border-green-500 rounded-full aspect-square p-3">
                    <Check className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              ) : (
                "❌"
              )}
            </div>
            <h1
              className={`text-2xl font-bold mb-2 ${
                isSuccess ? "text-green-800" : "text-red-800"
              }`}
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className={`${isSuccess ? "text-green-600" : "text-red-600"}`}>
              {isSuccess
                ? "Giao dịch đã được xử lý và xác nhận thành công"
                : message}
            </p>

            {/* Server verification status */}
            <div className="mt-3 text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  serverVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {serverVerified ? "✓ Đã xác thực " : "✗ Chưa xác thực "}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Thông tin giao dịch
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium">{vnpayData.vnp_TxnRef}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-lg text-green-600">
                    {vnpayData.amount} VNĐ
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">{vnpayData.payDate}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">{vnpayData.vnp_BankCode}</span>
                </div>

                {vnpayData.transactionId && (
                  <div className="flex justify-between py-2 border-b border-dark-800">
                    <span className="text-gray-600">ID Giao dịch:</span>
                    <span className="font-medium">
                      {vnpayData.transactionId}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Mã GD VNPay:</span>
                  <span className="font-medium">
                    {vnpayData.vnp_TransactionNo}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Mã GD Ngân hàng:</span>
                  <span className="font-medium">
                    {vnpayData.vnp_BankTranNo}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Loại thẻ:</span>
                  <span className="font-medium">{vnpayData.vnp_CardType}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-dark-800">
                  <span className="text-gray-600">Mã phản hồi:</span>
                  <span
                    className={`font-medium ${
                      isSuccess ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vnpayData.vnp_ResponseCode}
                  </span>
                </div>
              </div>
            </div>

            {vnpayData.orderInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <span className="text-gray-600">Thông tin đơn hàng:</span>
                <p className="font-medium mt-1">{vnpayData.orderInfo}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6">
            <div className="flex gap-4 justify-center">
              {isSuccess ? (
                <div className="w-full flex justify-center gap-3 items-center ">
                  <button
                    onClick={handleReturnHome}
                    className="px-6 py-3 bg-light-50 border-1 border-dark-600 text-dark-50 rounded-lg  transition-colors cursor-pointer"
                  >
                    Quay về trang chủ
                  </button>{" "}
                  <button
                    onClick={() => navigate("/book-examination")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Tiếp tục đặt
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleRetryPayment}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Thử lại thanh toán
                  </button>
                  <button
                    onClick={handleReturnHome}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Quay về trang chủ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentReturn;
