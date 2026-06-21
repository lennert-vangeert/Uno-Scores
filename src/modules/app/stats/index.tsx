import {
  Box,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCrown, IconFlame } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { RootState } from "@global/store/store";
import { useTranslate } from "@global/localization";
import Head from "@global/head";
import { useStats } from "@global/hooks/useStats";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card withBorder padding="lg">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Title order={3}>{value}</Title>
    </Card>
  );
}

export default function StatsPage() {
  const { t } = useTranslate();
  const { mainMargin, gridCols } = useSelector((s: RootState) => s.ui);
  const { stats, loading } = useStats();

  return (
    <>
      <Head title={t("Stats")} description="Your UNO stats" SEODisabled />
      <Box mt="2rem" mx={mainMargin}>
        <Title order={2} mb="2rem">
          {t("Stats")}
        </Title>

        {loading ? (
          <Center mt="4rem">
            <Loader />
          </Center>
        ) : !stats || stats.roundsPlayed === 0 ? (
          <Center mt="2rem">
            <Text>{t("Play some rounds to see your stats.")}</Text>
          </Center>
        ) : (
          <Stack gap="2rem">
            {/* Headline: most points in one round (worst hand) */}
            {stats.mostPointsInRound && (
              <Card withBorder padding="xl">
                <Group gap="xs" mb="xs">
                  <IconFlame size={20} />
                  <Text size="sm" c="dimmed">
                    {t("Most points in one round")}
                  </Text>
                </Group>
                <Title order={1}>{stats.mostPointsInRound.points}</Title>
                <Text fw={600}>{stats.mostPointsInRound.playerName}</Text>
                <Text size="sm" c="dimmed">
                  {stats.mostPointsInRound.gameName} · {t("Round")}{" "}
                  {stats.mostPointsInRound.roundNumber}
                </Text>
              </Card>
            )}

            {/* Aggregates */}
            <SimpleGrid cols={gridCols}>
              <StatCard label={t("Games played")} value={String(stats.gamesPlayed)} />
              <StatCard label={t("Rounds played")} value={String(stats.roundsPlayed)} />
              <StatCard
                label={t("Average points per round")}
                value={
                  stats.avgPointsPerRound === null
                    ? "—"
                    : stats.avgPointsPerRound.toFixed(1)
                }
              />
              <StatCard
                label={t("Lowest game total")}
                value={
                  stats.lowestGameTotal
                    ? `${stats.lowestGameTotal.value} · ${stats.lowestGameTotal.playerName}`
                    : "—"
                }
              />
            </SimpleGrid>

            {/* Round wins leaderboard */}
            {stats.roundWins.length > 0 && (
              <Box>
                <Title order={3} mb="1rem">
                  {t("Round wins")}
                </Title>
                <Stack gap="xs">
                  {stats.roundWins.map((row, i) => (
                    <Card key={row.name} withBorder padding="sm">
                      <Group justify="space-between">
                        <Group gap="xs">
                          {i === 0 && <IconCrown size={18} />}
                          <Text fw={500}>{row.name}</Text>
                        </Group>
                        <Text>
                          {row.wins} {t("wins")}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </>
  );
}
