import { ActionIcon, Anchor, Button, Group, Tooltip } from "@mantine/core";
import { IconChartBar, IconMoon, IconSun } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserMenu } from "@common/userMenu";
import { useTranslate } from "@global/localization";
import { useWakeLock } from "@global/hooks/useWakeLock";
import { RootState } from "@global/store/store";

/**
 * Top bar shown on every signed-in page. Responsive: the Stats label collapses
 * to an icon on phones and all controls are compact icon buttons so the row
 * never overflows a narrow screen.
 */
export default function AppHeader() {
  const { t, tL } = useTranslate();
  const { enabled, toggle, supported } = useWakeLock();
  const { mainMargin } = useSelector((s: RootState) => s.ui);

  return (
    <Group justify="space-between" wrap="nowrap" gap="xs" mx={mainMargin} py="md">
      <Anchor
        component={Link}
        to={tL("/")}
        fw={700}
        fz="1.5rem"
        underline="never"
      >
        UNO
      </Anchor>

      <Group gap="xs" wrap="nowrap">
        {/* Stats — labelled from sm up, icon-only on phones */}
        <Button
          component={Link}
          to={tL("/stats")}
          variant="subtle"
          leftSection={<IconChartBar size={20} />}
          visibleFrom="sm"
        >
          {t("Stats")}
        </Button>
        <ActionIcon
          component={Link}
          to={tL("/stats")}
          variant="subtle"
          size={42}
          radius="md"
          hiddenFrom="sm"
          aria-label={t("Stats")}
        >
          <IconChartBar size={22} />
        </ActionIcon>

        {supported && (
          <Tooltip
            label={enabled ? t("Screen stays awake") : t("Keep screen awake")}
            withArrow
          >
            <ActionIcon
              variant={enabled ? "filled" : "outline"}
              size={42}
              radius="md"
              onClick={toggle}
              aria-label={t("Keep screen awake")}
            >
              {enabled ? <IconSun size={22} /> : <IconMoon size={22} />}
            </ActionIcon>
          </Tooltip>
        )}

        <UserMenu />
      </Group>
    </Group>
  );
}
