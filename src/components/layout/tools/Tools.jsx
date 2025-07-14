import Footer from "../../../pages/user/Footer";
import Header from "../Header";

import { Outlet } from "react-router-dom";

const Tools = () => {
  return (
    <div className="w-full flex flex-col font-nunito min-h-screen bg-light-50">
      <Header />
      <div className="container mx-auto  pb-18 ">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Tools;
