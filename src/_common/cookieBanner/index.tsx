import { RootState } from "@global/store/store";
import {
  Button,
  Flex,
  FocusTrap,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

type CookieBannerProps = {
  opened: boolean;
  close: () => void;
};

/**
 * CookieBanner
 * @param {CookieBannerProps} opened - Is the banner opened
 * @param {Function} close - Function to close the banner
 * @returns {JSX.Element | null}
 */
const CookieBanner = ({ opened, close }: CookieBannerProps) => {
  const theme = useMantineTheme();
  const { isTablet, isBigTablet } = useSelector((state: RootState) => state.ui);

  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (opened && acceptRef.current) {
      acceptRef.current.focus();
    }
  }, [opened]);

  const acceptAnalyticsCookies = useCallback(() => {
    document.cookie =
      "ANALYTICAL_COOKIES_ENABLED=true; path=/; max-age=2592000"; // 30 dagen
    close();
    window.location.reload();
  }, [close]);

  const rejectAnalyticsCookies = useCallback(() => {
    document.cookie =
      "ANALYTICAL_COOKIES_ENABLED=false; path=/; max-age=2592000"; // 30 dagen
    close();
    window.location.reload();
  }, [close]);

  if (!opened) {
    return null;
  }

  return (
    <FocusTrap active>
      <Paper
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        style={{
          position: "fixed",
          bottom: "2.5rem",
          right: "5vw",
          backgroundColor: theme.colors.gray[0],
          border: `1px solid ${theme.colors.gray[4]}`,
          padding: theme.spacing.md,
          width: isTablet ? "90vw" : "35vw",
          boxShadow: theme.shadows.sm,
          zIndex: 1000,
        }}
        bg={theme.colors.background[0]}
      >
        <Title
          id="cookie-banner-title"
          order={1}
          mb="1rem"
          size={theme.headings.sizes.h3.fontSize}
        >
          Deze website gebruikt cookies
        </Title>

        <Text>
          We gebruiken cookies om je gebruikservaring te verbeteren. Dit helpt
          ons om de website te verbeteren en je relevante informatie te bieden.
          We respecteren je privacy en gebruiken alleen de gegevens die we nodig
          hebben om de website te verbeteren.
        </Text>

        <Flex
          justify="space-between"
          direction={isBigTablet ? "column" : "row"}
          w="100%"
          mt="1rem"
          gap="1rem"
        >
          <Button
            w="100%"
            flex={1}
            onClick={acceptAnalyticsCookies}
            ref={acceptRef}
          >
            Accepteer
          </Button>
          <Button
            w="100%"
            flex={1}
            color="red"
            onClick={rejectAnalyticsCookies}
          >
            Weiger
          </Button>
        </Flex>
      </Paper>
    </FocusTrap>
  );
};

export default CookieBanner;
