import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconCrown,
  IconEdit,
  IconFlagCheck,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@global/store/store";
import { useAuth } from "@global/firebase/useAuth";
import { useTranslate } from "@global/localization";
import Head from "@global/head";
import { decideTextColor } from "@global/style/decideTextColor";
import {
  finishGame,
  makePlayer,
  reopenGame,
  setPlayers,
  subscribeGame,
  type GameWithId,
} from "@services/games";
import {
  deleteRound,
  subscribeRounds,
  type RoundWithId,
} from "@services/rounds";
import {
  computeTotals,
  rankAscending,
  roundWinnerIds,
} from "@global/game/totals";
import RoundFormModal from "./RoundFormModal";

export default function GamePage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const { t, tL } = useTranslate();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { mainMargin, gridCols } = useSelector((s: RootState) => s.ui);

  const [game, setGame] = useState<GameWithId | null | undefined>(undefined);
  const [rounds, setRounds] = useState<RoundWithId[]>([]);

  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [roundOpen, setRoundOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<RoundWithId | null>(null);
  const [roundToDelete, setRoundToDelete] = useState<RoundWithId | null>(null);

  useEffect(() => {
    if (!gameId) return;
    const u1 = subscribeGame(gameId, setGame);
    const u2 = subscribeRounds(gameId, setRounds);
    return () => {
      u1();
      u2();
    };
  }, [gameId]);

  const playerForm = useForm({
    mode: "uncontrolled",
    initialValues: { name: "" },
  });

  const ranked = useMemo(
    () => (game ? rankAscending(computeTotals(game.players, rounds)) : []),
    [game, rounds]
  );

  const editable = game?.status === "active";
  const playedRounds = rounds.length > 0;
  const lowest = ranked[0]?.total;
  const leaderIds =
    playedRounds && ranked.length > 0
      ? ranked.filter((r) => r.total === lowest).map((r) => r.id)
      : [];
  const nextRoundNumber = rounds.length
    ? Math.max(...rounds.map((r) => r.roundNumber)) + 1
    : 1;

  const handleAddPlayer = playerForm.onSubmit(async (values) => {
    if (!game) return;
    const name = values.name.trim();
    if (!name) return;
    await setPlayers(game.id, [...game.players, makePlayer(name)]);
    playerForm.reset();
    setAddPlayerOpen(false);
  });

  const handleRemovePlayer = async (playerId: string) => {
    if (!game) return;
    await setPlayers(
      game.id,
      game.players.filter((p) => p.id !== playerId)
    );
  };

  const handleDeleteRound = async () => {
    if (!gameId || !roundToDelete) return;
    await deleteRound(gameId, roundToDelete.id);
    setRoundToDelete(null);
  };

  const openNewRound = () => {
    setEditingRound(null);
    setRoundOpen(true);
  };
  const openEditRound = (round: RoundWithId) => {
    setEditingRound(round);
    setRoundOpen(true);
  };

  if (game === undefined) {
    return (
      <Center mt="5rem">
        <Loader />
      </Center>
    );
  }

  if (game === null) {
    return (
      <Center mt="5rem">
        <Stack align="center">
          <Text>{t("Game not found.")}</Text>
          <Button onClick={() => navigate(tL("/"))}>{t("Back to games")}</Button>
        </Stack>
      </Center>
    );
  }

  const nameOf = (playerId: string) =>
    game.players.find((p) => p.id === playerId)?.name;

  return (
    <>
      <Head title={game.name} description="UNO game" SEODisabled />
      <Box mt="1.5rem" mx={mainMargin}>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate(tL("/"))}
          px={0}
        >
          {t("Back to games")}
        </Button>

        <Flex
          justify="space-between"
          align="center"
          gap="md"
          mt="sm"
          mb="2rem"
          wrap="wrap"
        >
          <Group gap="sm">
            <Title order={2}>{game.name}</Title>
            <Badge color={editable ? "teal" : "gray"} size="lg">
              {editable ? t("Active") : t("Finished")}
            </Badge>
          </Group>
          <Group>
            {editable ? (
              <Button
                variant="outline"
                leftSection={<IconFlagCheck size={18} />}
                onClick={() => finishGame(game.id)}
              >
                {t("Finish game")}
              </Button>
            ) : (
              <Button
                variant="outline"
                leftSection={<IconPlayerPlay size={18} />}
                onClick={() => reopenGame(game.id)}
              >
                {t("Reopen game")}
              </Button>
            )}
          </Group>
        </Flex>

        {/* Scoreboard */}
        <Group justify="space-between" mb="1rem">
          <Title order={3}>{t("Standings")}</Title>
          {editable && (
            <Group>
              <Button
                variant="light"
                leftSection={<IconUserPlus size={18} />}
                onClick={() => setAddPlayerOpen(true)}
              >
                {t("Add player")}
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={openNewRound}
                disabled={game.players.length === 0}
              >
                {t("New round")}
              </Button>
            </Group>
          )}
        </Group>

        {game.players.length === 0 ? (
          <Center mt="2rem">
            <Text>{t("No players yet. Add some to start scoring.")}</Text>
          </Center>
        ) : (
          <SimpleGrid cols={gridCols}>
            {ranked.map((row, i) => {
              const bg = theme.colors.cards[i % theme.colors.cards.length];
              const fg = decideTextColor(bg);
              const isLeader = leaderIds.includes(row.id);
              return (
                <Card bg={bg} key={row.id} py="1rem" px="1.5rem">
                  <Flex c={fg} justify="space-between" align="center" gap="sm">
                    <Stack gap={2}>
                      <Group gap={6}>
                        {isLeader && <IconCrown size={18} />}
                        <Text fw={600}>{row.name}</Text>
                      </Group>
                      <Text size="sm">
                        {t("Total")}: {row.total}
                      </Text>
                    </Stack>
                    {editable && (
                      <ActionIcon
                        variant="transparent"
                        c={fg}
                        aria-label={t("Remove player")}
                        onClick={() => handleRemovePlayer(row.id)}
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        <Divider my="3rem" />

        {/* Round history */}
        <Title order={3} mb="1rem">
          {t("Rounds")}
        </Title>
        {rounds.length === 0 ? (
          <Center mt="1rem">
            <Text c="dimmed">{t("No rounds played yet.")}</Text>
          </Center>
        ) : (
          <Stack>
            {rounds.map((round) => {
              const winners = roundWinnerIds(round.results);
              return (
                <Card key={round.id} withBorder padding="md">
                  <Flex justify="space-between" align="center" mb="sm">
                    <Text fw={600}>
                      {t("Round")} {round.roundNumber}
                    </Text>
                    {editable && (
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          aria-label={t("Edit round")}
                          onClick={() => openEditRound(round)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label={t("Delete round")}
                          onClick={() => setRoundToDelete(round)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Flex>
                  <Group gap="xs">
                    {round.results.map((r) => {
                      const name = nameOf(r.playerId);
                      if (!name) return null;
                      const won = winners.includes(r.playerId);
                      return (
                        <Badge
                          key={r.playerId}
                          variant={won ? "filled" : "light"}
                          color={won ? "teal" : "gray"}
                          leftSection={won ? <IconCrown size={12} /> : undefined}
                        >
                          {name}: {r.points}
                        </Badge>
                      );
                    })}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Add player modal */}
      <Modal
        opened={addPlayerOpen}
        onClose={() => setAddPlayerOpen(false)}
        title={t("Add player")}
        centered
      >
        <form onSubmit={handleAddPlayer}>
          <TextInput
            withAsterisk
            label={t("Name")}
            placeholder={t("Enter name")}
            {...playerForm.getInputProps("name")}
          />
          <Button mt="2rem" w="100%" type="submit">
            {t("Add")}
          </Button>
        </form>
      </Modal>

      {/* New / edit round modal */}
      <RoundFormModal
        opened={roundOpen}
        onClose={() => setRoundOpen(false)}
        players={game.players}
        gameId={game.id}
        ownerId={user?.uid ?? game.ownerId}
        nextRoundNumber={nextRoundNumber}
        existing={editingRound}
      />

      {/* Delete round confirm */}
      <Modal
        opened={!!roundToDelete}
        onClose={() => setRoundToDelete(null)}
        title={t("Delete round")}
        centered
      >
        <Text mb="lg">
          {t("This removes the round and recalculates totals and stats.")}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setRoundToDelete(null)}>
            {t("Cancel")}
          </Button>
          <Button color="red" onClick={handleDeleteRound}>
            {t("Delete")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
