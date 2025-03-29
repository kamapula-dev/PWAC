import { useIntl } from "react-intl";
import BooksIcon from "../../shared/icons/BooksIcon";
import SearchIcon from "../../shared/icons/SearchIcon";
import AppsIcon from "../../shared/icons/AppsIcon";
import GamesIcon from "../../shared/icons/GamesIcon";

const Menu = ({
  dark,
  mainThemeColor,
  testDesign,
}: {
  dark: boolean;
  mainThemeColor?: string;
  testDesign?: boolean;
}) => {
  const intl = useIntl();
  return (
    <div className="h-[70px] box-border">
      <div
        style={dark ? { background: "#1e1f21" } : {}}
        className="fixed left-0 bottom-0 right-0 h-[58px] bg-[#f0f3f8] px-6 py-1.5 flex gap-5 max-w-[650px] mx-auto"
      >
        <div className="flex-1 flex flex-col items-center">
          <div></div>
          {testDesign ? (
            <svg
              width="24"
              height="30"
              viewBox="0 0 21 16"
              xmlns="http://www.w3.org/2000/svg"
              fill={dark ? "#DFDFDF" : "#605D64"}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.3 8.4C19.2169 7.65213 19.0648 6.90427 18.9009 6.09902C18.8676 5.93522 18.8338 5.76904 18.8 5.6L18.8 5.59986C18.7 5.1 18.7 5.09996 18.6 4.7L18.5 4.4C18.2 1.8 16 0 13.3 0H6.7C4.1 0 1.8 1.8 1.4 4.4C1.4 4.43174 1.4 4.4534 1.3968 4.47458C1.38993 4.52014 1.36826 4.56347 1.3 4.7C1.3 5.1 1.3 5.1 1.2 5.6C1.1 6.05 1.025 6.525 0.95 7C0.875 7.475 0.8 7.95 0.7 8.4C0.1 11.9 0 12.5 0 12.7C0 14.2 1.2 15.5 2.8 15.5C3.6 15.5 4.3 15.2 4.8 14.7L7.7 11.9H12.4L15.3 14.8C15.8 15.3 16.5 15.6 17.3 15.6C18.8 15.6 20.1 14.4 20.1 12.8C20.0055 12.5165 19.911 11.9651 19.3946 8.95177L19.3 8.4ZM13 5C13.4971 5 13.9 4.59706 13.9 4.1C13.9 3.60294 13.4971 3.2 13 3.2C12.5029 3.2 12.1 3.60294 12.1 4.1C12.1 4.59706 12.5029 5 13 5ZM15.8 6C15.8 6.49706 15.3971 6.9 14.9 6.9C14.4029 6.9 14 6.49706 14 6C14 5.50294 14.4029 5.1 14.9 5.1C15.3971 5.1 15.8 5.50294 15.8 6ZM10.5 5.4C10.2 5.7 10.2 6.3 10.5 6.6C10.8 6.9 11.4 6.9 11.7 6.6C12 6.3 12 5.7 11.7 5.4C11.4 5.1 10.9 5.1 10.5 5.4ZM13 8.8C13.4971 8.8 13.9 8.39706 13.9 7.9C13.9 7.40294 13.4971 7 13 7C12.5029 7 12.1 7.40294 12.1 7.9C12.1 8.39706 12.5029 8.8 13 8.8ZM6.4 3.5H7.6V5.4H9.5V6.6H7.6V8.5H6.4V6.6H4.5V5.4H6.4V3.5ZM16.5 13.3C16.7 13.5 16.9 13.6 17.2 13.6C17.8 13.6 18.2 13.2 18.2 12.6C18.2 12.7 16.8 4.8 16.8 4.7C16.5 3 15 1.8 13.3 1.8H6.7C4.9 1.8 3.5 3 3.2 4.7C3.2 4.8 1.8 12.7 1.8 12.7C1.8 13.3 2.3 13.7 2.8 13.7C3.1 13.7 3.3 13.6 3.5 13.4L6.9 10H13.1L13.4 10.2L16.5 13.3Z"
              ></path>
            </svg>
          ) : (
            <GamesIcon dark={dark} />
          )}

          <div
            style={{ fontWeight: 600, color: dark ? "#DFDFDF" : "#605D64" }}
            className="font-medium text-xs"
          >
            {intl.formatMessage({
              id: "games",
              defaultMessage: "Games",
            })}
          </div>
        </div>
        <div
          style={testDesign ? { width: "48px" } : {}}
          className="flex-1 flex flex-col items-center"
        >
          <AppsIcon mainThemeColor={mainThemeColor} dark={dark} />
          <div
            style={{
              fontWeight: 600,
              color: mainThemeColor || (dark ? "#A8C8FB" : "#056890"),
            }}
            className="font-medium text-xs"
          >
            {intl.formatMessage({
              id: "apps",
              defaultMessage: "Apps",
            })}
          </div>
        </div>

        {!testDesign && (
          <div className="flex-1 flex flex-col items-center">
            <SearchIcon dark={dark} />
            <div
              style={{
                fontWeight: 600,
                color: dark ? "#DFDFDF" : "#605D64",
              }}
              className="font-medium text-xs"
            >
              {intl.formatMessage({
                id: "search",
                defaultMessage: "Search",
              })}
            </div>
          </div>
        )}

        {testDesign && (
          <div className="flex-1 flex flex-col items-center">
            <svg
              width="24"
              height="30"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill={dark ? "#DFDFDF" : "#605D64"}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 2V22H21V2H3ZM5 20H19V4H5V20ZM9 7H6V5H9V7ZM18 7H15V5H18V7ZM6 19H9V17H6V19ZM18 19H15V17H18V19ZM15 15H18V13H15V15ZM9 15H6V13H9V15ZM15 11H18V9H15V11ZM9 11H6V9H9V11Z"
              ></path>
            </svg>

            <div
              style={{ fontWeight: 600, color: dark ? "#DFDFDF" : "#605D64" }}
              className="font-medium text-xs"
            >
              {intl.formatMessage({
                id: "films",
                defaultMessage: "Films",
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center">
          {testDesign ? (
            <svg
              width="24"
              height="30"
              viewBox="0 0 24 24"
              fill={dark ? "#DFDFDF" : "#605D64"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.4996 6.36584L14.001 7.65237V4H11.001V7.65075L12.4996 6.36584ZM10 2H11.001H14.001H15H16.998C18.6461 2 20.001 3.35397 20.001 5.002V18.998C20.001 20.646 18.6461 22 16.998 22H4V2H10ZM18.001 5.002C18.001 4.459 17.542 4 16.998 4H16.001V12L12.5 9L9.001 12V4H6V20H16.998C17.542 20 18.001 19.541 18.001 18.998V5.002Z"
              ></path>
            </svg>
          ) : (
            <BooksIcon dark={dark} />
          )}

          <div
            style={{ fontWeight: 600, color: dark ? "#DFDFDF" : "#605D64" }}
            className="font-medium text-xs"
          >
            {intl.formatMessage({
              id: "books",
              defaultMessage: "Books",
            })}
          </div>
        </div>

        {testDesign && (
          <div className="flex-1 flex flex-col items-center">
            <svg
              width="24"
              height="30"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill={dark ? "#DFDFDF" : "#605D64"}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9995 20.439C13.1543 20.787 17.2264 22 17.6293 22C18.4311 22 18.928 21.578 19.154 21.325C19.7049 20.7081 19.7029 20.0604 19.6999 19.0794L19.6999 19.074C19.6989 18.647 19.6299 16.111 19.6009 15.125C20.2258 14.252 21.8914 11.907 22.1604 11.5C22.7292 10.643 23.2201 9.901 22.8972 8.908C22.5724 7.90856 21.7594 7.61034 20.8112 7.26259L20.8096 7.262C20.3747 7.103 17.7853 6.254 16.8195 5.942C16.2026 5.107 14.518 2.848 14.221 2.476L14.2198 2.47445C13.5875 1.68311 13.0416 1 11.9995 1C10.9577 1 10.4108 1.684 9.77797 2.477C9.48103 2.848 7.79639 5.107 7.18052 5.942C6.21372 6.255 3.62427 7.103 3.18436 7.265C2.24156 7.61 1.42773 7.908 1.1028 8.908C0.779871 9.901 1.27077 10.643 1.83965 11.501C2.10059 11.894 3.77424 14.252 4.39911 15.125C4.37011 16.111 4.30113 18.646 4.29913 19.074V19.0741C4.29613 20.058 4.29415 20.708 4.84501 21.324C5.06996 21.576 5.56686 22 6.37069 22C6.7726 22 10.8447 20.787 11.9995 20.439ZM17.6018 15.1838C17.6437 16.6103 17.6991 18.7493 17.6999 19.0787C17.7021 19.8051 17.6963 19.9322 17.6736 19.9767C17.5616 19.9504 17.418 19.9144 17.2472 19.8699C16.8391 19.7634 16.2949 19.6126 15.6462 19.4271C14.6587 19.1447 13.4965 18.8013 12.5766 18.5241L11.9995 18.3502L11.4224 18.5241C10.5029 18.8012 9.34041 19.1447 8.35292 19.4271C7.7042 19.6126 7.16005 19.7634 6.75206 19.8699C6.58148 19.9145 6.43802 19.9504 6.32604 19.9766C6.30304 19.9326 6.2969 19.8071 6.29912 19.0801C6.30067 18.7488 6.35718 16.5803 6.39824 15.1838L6.41807 14.5095L6.02543 13.9609C5.19866 12.8058 3.70925 10.7011 3.50581 10.3947C3.01485 9.65422 2.98744 9.57977 3.00475 9.52653C3.02422 9.46662 3.06796 9.4373 3.87165 9.1432C4.20463 9.02058 6.39401 8.29883 7.79654 7.84477L8.40835 7.64669L8.79007 7.12916C9.57143 6.06978 11.1071 4.01707 11.3394 3.72674C11.8852 3.04281 11.9401 3 11.9995 3C12.049 3 12.0824 3.02198 12.403 3.40831C12.4693 3.48831 12.5251 3.55748 12.6586 3.72451C12.8889 4.01303 14.4014 6.03473 15.2108 7.1304L15.5929 7.64752L16.2047 7.84516C17.4867 8.25931 19.7877 9.01784 20.1229 9.1404L20.1237 9.1407C20.2142 9.17389 20.2145 9.17398 20.3015 9.20614C20.9377 9.44213 20.977 9.47051 20.9951 9.52605C21.0125 9.57968 20.9851 9.65415 20.4941 10.3939C20.2859 10.7088 18.8457 12.7438 17.9746 13.9609L17.5819 14.5095L17.6018 15.1838Z"
              ></path>
            </svg>

            <div
              style={{ fontWeight: 600, color: dark ? "#DFDFDF" : "#605D64" }}
              className="font-medium text-xs"
            >
              {intl.formatMessage({
                id: "kids",
                defaultMessage: "Kids",
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
