import { AppShell, Box, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Footer from "../footer";
import Header from "../header";

// Redux
import ScrollToTop from "@common/scrollToTop";
import { AppDispatch } from "@global/store/store";
import {
  setGridCols,
  setIsBigTablet,
  setIsMobile,
  setIsSmallMobile,
  setIsTablet,
  setLastPageVisited,
  setMainMargin,
} from "@global/store/uiSlice";
import { useDispatch } from "react-redux";
import CookieBanner from "@common/cookieBanner";

type PageWrapperProps = {
  /** Children to be rendered inside the PageWrapper */
  children?: ReactNode;
};

/**
 * PageWrapper component
 * @param {PageWrapperProps} props - Props for the PageWrapper component
 * @returns {JSX.Element}
 * This component is used to wrap the main content of the application.
 * It also pushes various UI-related flags into Redux.
 */
const PageWrapper = ({ children }: PageWrapperProps) => {
  const theme = useMantineTheme();
  const { pathname } = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const previousPathRef = useRef<string | undefined>(undefined);

  // ----- MEDIA QUERY BOOLEANS -----
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isSmallMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
  const isBigTablet = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);

  const [opened, { close }] = useDisclosure(
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED") === -1
  );

  const margin = useMemo(() => {
    if (isMobile) return "1rem";
    if (isTablet) return "3.5rem";
    return "10rem";
  }, [isMobile, isTablet]);

  const gridCols = useMemo(() => {
    if (isTablet) return 1;
    if (isBigTablet) return 2;
    return 3;
  }, [isTablet, isBigTablet]);

  // Sync UI-related flags into Redux whenever any of these change
  useEffect(() => {
    dispatch(setIsMobile(isMobile));
    dispatch(setIsSmallMobile(isSmallMobile));
    dispatch(setIsTablet(isTablet));
    dispatch(setIsBigTablet(isBigTablet));
    dispatch(setGridCols(gridCols));
    dispatch(setMainMargin(margin));
  }, [
    dispatch,
    isMobile,
    isSmallMobile,
    isTablet,
    isBigTablet,
    gridCols,
    margin,
  ]);

  useEffect(() => {
    if (previousPathRef.current !== undefined) {
      dispatch(setLastPageVisited(previousPathRef.current));
    }
    previousPathRef.current = pathname;
  }, [pathname, dispatch]);

  return (
    <>
      <ScrollToTop />
      <AppShell>
        <Header />
        <Box>
          {/* Render direct children if provided, otherwise fallback to nested routes */}
          {children ?? <Outlet />}
        </Box>
        <Footer />
        <CookieBanner opened={opened} close={close} />
      </AppShell>
    </>
  );
};

export default PageWrapper;
