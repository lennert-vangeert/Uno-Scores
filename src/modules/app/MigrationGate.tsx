import { useEffect, useState } from "react";
import { Button, Group, List, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@global/firebase/useAuth";
import { useTranslate } from "@global/localization";
import {
  dismissMigration,
  hasLocalData,
  migrateLocalToFirestore,
  migrationDismissed,
  readLocalUsers,
} from "@services/migration";

/**
 * Shown once after the first sign-in when a legacy localStorage scoreboard is
 * present: offers to import it as an active game (totals kept as baseline).
 * Migrating clears the local keys; skipping sets a dismissed flag so it stops
 * nagging.
 */
export default function MigrationGate() {
  const { user } = useAuth();
  const { t, tL } = useTranslate();
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locals] = useState(() => readLocalUsers());

  useEffect(() => {
    if (user && hasLocalData() && !migrationDismissed()) setOpened(true);
  }, [user]);

  const handleSkip = () => {
    dismissMigration();
    setOpened(false);
  };

  const handleImport = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const id = await migrateLocalToFirestore(user.uid, t("Imported game"));
      setOpened(false);
      notifications.show({
        color: "teal",
        message: t("Your scores were imported."),
      });
      navigate(tL(`/game/${id}`));
    } catch {
      notifications.show({
        color: "red",
        message: t("Import failed. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleSkip}
      title={t("Import your local scores?")}
      centered
    >
      <Text mb="sm">{t("We found a saved scoreboard on this device:")}</Text>
      <List mb="lg">
        {locals.map((u) => (
          <List.Item key={u.id}>
            {u.name} — {u.score}
          </List.Item>
        ))}
      </List>
      <Text size="sm" c="dimmed" mb="lg">
        {t(
          "We'll create a game with these players and their current totals so you can keep playing."
        )}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={handleSkip}>
          {t("Skip")}
        </Button>
        <Button loading={busy} onClick={handleImport}>
          {t("Import")}
        </Button>
      </Group>
    </Modal>
  );
}
