import React from "react";
import { Box, Image, useBreakpointValue } from "@chakra-ui/react";
import LogoImg from "../../images/logo.png";
import Logo2 from "../../images/logo2.png";
import { Link } from "react-router-dom";

const Logo = (props) => {
  const displayLogo = useBreakpointValue({ base: "none", lg: "block" });
  return (
    <Box {...props}>
      <Link to="/">
        <Image src={LogoImg} display={displayLogo} />
      </Link>
      <Image src={Logo2} display={displayLogo === "block" ? "none" : "block"} />
    </Box>
  );
};

export default Logo;
