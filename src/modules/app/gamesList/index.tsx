import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { RootState } from "@global/store/store";
import { useAuth } from "@global/firebase/useAuth";
import { useTranslate } from "@global/localization";
import Head from "@global/head";
import {
  createGame,
  deleteGame,
  subscribeGames,
  type GameWithId,
} from "@services/games";

export default function GamesListPage() {
  const { user } = useAuth();
  const { t, tL } = useTranslate();
  const navigate = useNavigate();
  const { mainMargin, gridCols } = useSelector((s: RootState) => s.ui);

  const [games, setGames] = useState<GameWithId[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<GameWithId | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeGames(user.uid, setGames);
  }, [user]);

  const form = useForm({ mode: "uncontrolled", initialValues: { name: "" } });

  const { active, finished } = useMemo(() => {
    const a: GameWithId[] = [];
    const f: GameWithId[] = [];
    (games ?? []).forEach((g) => (g.status === "finished" ? f : a).push(g));
    return { active: a, finished: f };
  }, [games]);

  const handleCreate = form.onSubmit(async (values) => {
    if (!user) return;
    const name = values.name.trim() || t("New game");
    setCreating(true);
    try {
      const id = await createGame(user.uid, name);
      setCreateOpen(false);
      form.reset();
      navigate(tL(`/game/${id}`));
    } finally {
      setCreating(false);
    }
  });

  const handleDelete = async () => {
    if (!toDelete) return;
    await deleteGame(toDelete.id);
    setToDelete(null);
  };

  const renderCard = (g: GameWithId) => (
    <Card key={g.id} withBorder padding="lg">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <Title order={4}>{g.name}</Title>
        <Badge color={g.status === "active" ? "teal" : "gray"}>
          {g.status === "active" ? t("Active") : t("Finished")}
        </Badge>
      </Flex>
      <Text size="sm" c="dimmed">
        {g.players.length} {t("players")}
        {g.createdAt ? ` · ${dayjs(g.createdAt.toDate()).format("DD/MM/YYYY")}` : ""}
      </Text>
      <Group justify="space-between" mt="md">
        <Button onClick={() => navigate(tL(`/game/${g.id}`))}>{t("Open")}</Button>
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label={t("Delete game")}
          onClick={() => setToDelete(g)}
        >
          <IconTrash size={20} />
        </ActionIcon>
      </Group>
    </Card>
  );

  return (
    <>
      <Head title={t("Your games")} description="Your UNO games" SEODisabled />
      <Box mt="2rem" mx={mainMargin}>
        <Flex justify="space-between" align="center" mb="2rem" gap="md">
          <Title order={2}>{t("Your games")}</Title>
          <Button
            leftSection={<IconPlus size={20} />}
            onClick={() => setCreateOpen(true)}
          >
            {t("New game")}
          </Button>
        </Flex>

        {games === null ? (
          <Center mt="4rem">
            <Loader />
          </Center>
        ) : active.length === 0 && finished.length === 0 ? (
          <Center mt="2rem">
            <Text>{t("No games yet. Create your first one!")}</Text>
          </Center>
        ) : (
          <Stack gap="3rem">
            {active.length > 0 && (
              <Box>
                <Title order={3} mb="1rem">
                  {t("Active")}
                </Title>
                <SimpleGrid cols={gridCols}>{active.map(renderCard)}</SimpleGrid>
              </Box>
            )}
            {finished.length > 0 && (
              <Box>
                <Title order={3} mb="1rem">
                  {t("Finished")}
                </Title>
                <SimpleGrid cols={gridCols}>{finished.map(renderCard)}</SimpleGrid>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Create game modal */}
      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t("New game")}
        centered
      >
        <form onSubmit={handleCreate}>
          <TextInput
            label={t("Game name")}
            placeholder={t("e.g. Friday night")}
            {...form.getInputProps("name")}
          />
          <Button mt="2rem" w="100%" type="submit" loading={creating}>
            {t("Create game")}
          </Button>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        opened={!!toDelete}
        onClose={() => setToDelete(null)}
        title={t("Delete game")}
        centered
      >
        <Text mb="lg">
          {t("This permanently deletes the game and all its rounds.")}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setToDelete(null)}>
            {t("Cancel")}
          </Button>
          <Button color="red" onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
