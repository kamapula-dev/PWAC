import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  HeaderInfoContainer,
  HeaderInfoText,
  HeaderInfoTitle,
  LogoSection,
  ViewHeaderContainer,
} from "../styles";
import { useIntl } from "react-intl";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  id: string;
}

const ViewHeader: React.FC<Props> = ({ setView, id }) => {
  const intl = useIntl();

  const handleClick = () => {
    setView("main");
  };
  return (
    <ViewHeaderContainer>
      <IconButton size="large" onClick={handleClick}>
        <ArrowBackIcon sx={{ color: "rgb(32, 33, 36)", fontSize: 24 }} />
      </IconButton>
      <LogoSection src="/icon.webp" />
      <HeaderInfoContainer>
        <HeaderInfoTitle>{intl.formatMessage({ id: "name" })}</HeaderInfoTitle>
        <HeaderInfoText>{intl.formatMessage({ id })}</HeaderInfoText>
      </HeaderInfoContainer>
    </ViewHeaderContainer>
  );
};

export default ViewHeader;
