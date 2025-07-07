import { Link, Outlet, useLocation } from "react-router-dom";

const Articles = () => {
  const location = useLocation();
  return (
    <div className="flex-1 flex flex-col  gap-[10px] overflow-hidden ">
      <div className="  flex items-center  gap-[10px]  px-[0px]">
        {routes.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`px-[15px] py-[6px] flex items-center gap-[10px]  rounded-md border-1  cursor-pointer ${
              location.pathname.includes(item.path)
                ? "border-blue-500 text-blue-500 font-bold"
                : "text-dark-400  border-dark-800"
            }
            )}`}
          >
            {item.icon ? <i className={`${item.icon} text-md`}></i> : ""}
            <span className="text-sm truncate">{item.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default Articles;

const routes = [
  {
    id: "list-all",
    icon: "fa-solid fa-book",
    path: "list-all",
    name: "Tất cả",
  },
  {
    id: "create",
    icon: null,
    path: "create",
    name: "Thêm bài viết",
  },
  {
    id: "disease-categories",
    icon: null,
    path: "disease-categories",
    name: "Phân loại thực phẩm",
  },
];
