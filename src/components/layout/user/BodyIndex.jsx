import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

const BodyIndex = () => {
  const {
    loading,
    error,
    bmiRecord,
    bmiRecords,
    emmRecord,
    bodyFatRecord,
    whrRecord,
  } = useSelector((state) => state.bodyIndex);
  return (
    <div className="flex-1 flex  gap-[10px] overflow-hidden ">
      <div className="w-1/12 max-w-[80px] flex flex-col  gap-[10px]  px-[10px]">
        <Link
          to="calculate-bmi"
          className=" aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer"
        >
          <i className="fa-solid fa-gauge"></i>
        </Link>
        <div className="aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer">
          <i className="fa-solid fa-weight-scale"></i>
        </div>
        <div className="aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer">
          <i className="fa-solid fa-gauge-simple-high"></i>
        </div>
      </div>
      <div className="flex-1 flex   gap-[10px]  ">
        <div className="w-7/12 flex flex-col border-1 border-[#efefef] shadow rounded-lg  p-[10px]">
          <Outlet />
        </div>
        <div className="w-5/12 flex border-1 border-[#efefef] shadow rounded-lg  p-[10px]"></div>
      </div>
    </div>
  );
};

export default BodyIndex;
