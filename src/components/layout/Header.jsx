import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "./Container";
import { Heart, Menu, Search, X } from "lucide-react";
import User from "../ui/User";
import { useTheme } from "../../hook/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { searchArticles } from "../../services/article.service";
import { useRef } from "react";
import { getNotifycationsByUser } from "../../services/notifycation.service";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { searchResults } = useSelector((state) => state.article);

  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchValue, setSearchValue] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (searchResults) setSearchValue(searchResults);
  }, [searchResults]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchArticle = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        if (!value || value.trim() === "") {
          setIsSearching(false);
          setSearchValue([]);
        } else {
          setIsSearching(true);
          await dispatch(
            searchArticles({
              page,
              limit,
              search: value,
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
    }, 500);
  };

  const handleSearchResultClick = () => {
    // Clear search results when clicking on an item
    setSearchValue([]);
    setSearchTerm("");
  };

  const handleSearchIconClick = () => {
    if (searchTerm.trim() !== "") {
      // Navigate to search page with search term
      setSearchValue([]);
      setSearchTerm("");
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { to: "/topics", label: "Chuyên mục", icon: "fa-solid fa-list" },
    {
      to: "/book-examination",
      label: "Đặt lịch khám",
      icon: "fa-solid fa-calendar-check",
    },
    { to: "/tools/all", label: "Công cụ sức khỏe", icon: "fa-solid fa-tools" },
  ];

  return (
    <Container>
      <div className="w-full flex justify-between items-center py-3 px-3 md:px-5 font-nunito border-b-1 border-dashed border-dark-700">
        {/* Logo Section */}
        <div className="flex items-center lg:pr-30 pr-10">
          <Link to="/" className="flex items-center space-x-1">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              VIVANTA
            </h1>
          </Link>
        </div>

        {/* Search Box */}
        <div className="w-3/12 hidden  lg:flex items-center gap-2 border-1 border-dark-700 rounded-md py-1.5 pl-2 relative">
          <input
            className="flex-1 outline-none text-sm"
            type="text"
            placeholder="Tìm kiếm bài viết...."
            value={searchTerm}
            onChange={handleSearchArticle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.trim() !== "") {
                handleSearchIconClick();
              }
            }}
          />
          <Link
            to={searchTerm.trim() !== "" ? "/search" : "#"}
            state={{ searchValue: searchTerm }}
            className="px-2 cursor-pointer"
            onClick={handleSearchIconClick}
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && searchTerm.trim() !== "" && (
            <div className="absolute w-full top-[110%] right-0 flex flex-col gap-1 bg-light-50 border-1 border-dark-800 shadow-lg rounded-lg z-30 max-h-96 overflow-y-auto sidebar-scroll-none">
              {searchResults.map((article) => {
                return (
                  <Link
                    key={article._id}
                    to="/search"
                    state={{
                      searchValue: searchTerm,
                      selectedArticle: article,
                    }}
                    className="p-2 flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                    onClick={handleSearchResultClick}
                  >
                    <img
                      className="w-20 h-12 object-cover rounded-md flex-shrink-0"
                      src={article?.thumbnail?.url}
                      alt={article?.title || "Article thumbnail"}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <h1 className="text-sm line-clamp-2 font-bold text-gray-800">
                        {article.title}
                      </h1>
                      <p className="text-xs line-clamp-1 text-gray-600 mt-1">
                        {article.summary}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {/* View All Results Link */}
              {searchResults.length >= 5 && (
                <Link
                  to="/search"
                  state={{ searchValue: searchTerm }}
                  className="p-3 text-center text-sm font-medium text-vivanta-500 hover:bg-vivanta-50 transition-colors duration-200 border-t border-gray-200"
                  onClick={handleSearchResultClick}
                >
                  Xem tất cả kết quả cho "{searchTerm}"
                </Link>
              )}
            </div>
          )}

          {/* No Results Message */}
          {isSearching &&
            searchResults.length === 0 &&
            searchTerm.trim() !== "" && (
              <div className="absolute w-full top-[110%] right-0 bg-light-50 border-1 border-dark-800 shadow-lg rounded-lg z-30 p-4 text-center text-gray-500 text-sm">
                Không tìm thấy bài viết nào cho "{searchTerm}"
              </div>
            )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-end gap-4 flex-1">
          <ul className="flex items-center gap-6 text-sm font-bold">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex gap-1 items-center cursor-pointer hover:text-vivanta-emerald-500 transition-all duration-300 ease-in-out"
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Vivanta AI Button */}
          <div
            className={`flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md ${
              location.pathname === "/vivanta-ai"
                ? "bg-dark-800 font-bold text-dark-50"
                : "text-gray-600"
            } cursor-pointer border-[1px] border-dark-700 font-bold shadow-sm rounded-full px-6 xl:px-10  py-2`}
          >
            <Link
              to="/vivanta-ai"
              className="flex items-center gap-[5px] truncate"
            >
              <i className="fa-solid fa-hexagon-nodes text-vivanta-500"></i>
              <span className="text-sm">Vivanta AI</span>
            </Link>
          </div>

          {/* User Section */}
          {user ? (
            <User />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="flex items-center gap-2 border-1 border-dark-700 rounded-md truncate text-sm py-2 px-3 text-dark-400 font-bold hover:bg-gray-50 transition-colors"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span className="hidden xl:block">Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile/Tablet Right Section */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Vivanta AI Button - Mobile/Tablet */}
          <Link
            to="/vivanta-ai"
            className={`flex  w-10 h-10   items-center justify-center transition-all duration-300 ease-in-out ${
              location.pathname === "/vivanta-ai"
                ? "bg-dark-800 text-dark-50"
                : "text-gray-600"
            } cursor-pointer border-[1px] border-dark-700 shadow-sm aspect-square rounded-full p-2`}
          >
            <i className="fa-solid fa-hexagon-nodes text-vivanta-500 text-lg"></i>
          </Link>

          {/* User Section - Mobile/Tablet */}
          {user ? (
            <User />
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center justify-center border-1 border-dark-700 rounded-md p-2 text-dark-400 hover:bg-gray-50 transition-colors"
            >
              <i className="fa-solid fa-right-to-bracket text-lg"></i>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-[#00000045] bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0000001e] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } ${!isDarkMode ? " text-white" : "bg-white text-gray-900"}`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-gray-100 dark:hover:bg-teal-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 py-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-gray-100 dark:hover:bg-teal-50 transition-colors"
                  >
                    <i className={`${item.icon} w-5 text-vivanta-500`}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Vivanta AI in Mobile Menu */}
                <Link
                  to="/vivanta-ai"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors ${
                    location.pathname === "/vivanta-ai"
                      ? "bg-vivanta-50 text-vivanta-700 dark:bg-vivanta-900 dark:text-vivanta-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-400"
                  }`}
                >
                  <i className="fa-solid fa-hexagon-nodes w-5 text-vivanta-500"></i>
                  <span>Vivanta AI</span>
                </Link>
              </nav>
            </div>

            {/* Mobile Menu Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {!user && (
                <Link
                  to="/auth/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-vivanta-500 text-white rounded-md font-medium hover:bg-vivanta-600 transition-colors"
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Header;
