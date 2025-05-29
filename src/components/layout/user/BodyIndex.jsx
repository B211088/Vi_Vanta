import { useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";

const BodyIndex = () => {
  const location = useLocation();
  console.log({ location });
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
      <div className="  flex flex-col  gap-[10px]  px-[0px]">
        {routes.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`p-[10px] flex items-center gap-[10px]  rounded-lg border-1 border-dark-800  cursor-pointer ${
              location.pathname.includes(item.path)
                ? "bg-dark-900 font-bold"
                : "text-dark-400"
            }
            )}`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-sm truncate">{item.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default BodyIndex;

const routes = [
  {
    id: "calculate-bmi",
    icon: "fa-solid fa-gauge",
    path: "calculate-bmi",
    name: "Tính BMI",
  },
  {
    id: "calculate-emm",
    icon: "fa-solid fa-weight-scale",
    path: "calculate-emm",
    name: "Tính (BMR/TDEE)",
  },
  {
    id: "calculate-body-fat",
    icon: "fa-solid fa-gauge-simple-high",
    path: "calculate-body-fat",
    name: "Tính Body Fat",
  },
  {
    id: "calculate-whr",
    icon: "fa-solid fa-weight-hanging",
    path: "calculate-whr",
    name: "Tính WHR",
  },
];
