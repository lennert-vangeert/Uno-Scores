import { Anchor, Button, Group } from "@mantine/core";
import { IconChartBar, IconMoon, IconSun } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import LanguageSelect from "@common/languageSelect";
import { UserMenu } from "@common/userMenu";
import { useTranslate } from "@global/localization";
import { useWakeLock } from "@global/hooks/useWakeLock";
import { RootState } from "@global/store/store";

/** Top bar shown on every signed-in page: brand, stats link, language, wake, user. */
export default function AppHeader() {
  const { t, tL } = useTranslate();
  const { wake, toggle, supported } = useWakeLock();
  const { mainMargin } = useSelector((s: RootState) => s.ui);

  return (
    <Group justify="space-between" wrap="nowrap" mx={mainMargin} py="md">
      <Anchor component={Link} to={tL("/")} fw={700} fz="1.75rem" underline="never">
        UNO
      </Anchor>
      <Group gap="sm" wrap="nowrap">
        <Button
          component={Link}
          to={tL("/stats")}
          variant="subtle"
          leftSection={<IconChartBar size={20} />}
          visibleFrom="xs"
        >
          {t("Stats")}
        </Button>
        <LanguageSelect />
        {supported && (
          <Button
            variant="outline"
            px="md"
            onClick={toggle}
            aria-label={t("Keep screen awake")}
          >
            {wake ? <IconSun /> : <IconMoon />}
          </Button>
        )}
        <UserMenu />
      </Group>
    </Group>
  );
}
