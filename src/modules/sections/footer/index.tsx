import { RootState } from "@global/store/store";
import { Box, Title, useMantineTheme } from "@mantine/core";
import { useSelector } from "react-redux";

const Footer = () => {
  const { isTablet } = useSelector((state: RootState) => state.ui);
  const theme = useMantineTheme();
  return (
    <Box component="footer">
      <Title
        w="100%"
        ta="center"
        order={1}
        size={
          isTablet
            ? theme.headings.sizes.h5.fontSize
            : theme.headings.sizes.h3.fontSize
        }
        my=".75rem"
      >
        Made with ❤️ by Lennert
      </Title>
    </Box>
  );
};

export default Footer;
