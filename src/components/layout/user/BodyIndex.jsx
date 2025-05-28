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
        <Link
          to="calculate-emm"
          className="aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer"
        >
          <i className="fa-solid fa-weight-scale"></i>
        </Link>
        <Link
          to="calculate-body-fat"
          className="aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer"
        >
          <i className="fa-solid fa-gauge-simple-high"></i>
        </Link>{" "}
        <Link
          to="calculate-whr"
          className="aspect-square flex items-center justify-center rounded-lg border-1 border-dark-800 text-xl cursor-pointer"
        >
          <i className="fa-solid fa-gauge-simple-high"></i>
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default BodyIndex;
