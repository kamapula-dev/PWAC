import { useIntl } from "react-intl";
import BooksIcon from "../../shared/icons/BooksIcon";
import SearchIcon from "../../shared/icons/SearchIcon";
import AppsIcon from "../../shared/icons/AppsIcon";
import GamesIcon from "../../shared/icons/GamesIcon";

const Menu = ({
  dark,
  mainThemeColor,
}: {
  dark: boolean;
  mainThemeColor?: string;
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
          <GamesIcon dark={dark} />
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
        <div className="flex-1 flex flex-col items-center">
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
        <div className="flex-1 flex flex-col items-center">
          <SearchIcon dark={dark} />
          <div
            style={{ fontWeight: 600, color: dark ? "#DFDFDF" : "#605D64" }}
            className="font-medium text-xs"
          >
            {intl.formatMessage({
              id: "search",
              defaultMessage: "Search",
            })}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <BooksIcon dark={dark} />
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
      </div>
    </div>
  );
};

export default Menu;
