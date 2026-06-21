import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import type { Player } from "@data/games";
import { createRound, updateRound, type RoundWithId } from "@services/rounds";
import { useTranslate } from "@global/localization";

type Props = {
  opened: boolean;
  onClose: () => void;
  players: Player[];
  gameId: string;
  ownerId: string;
  nextRoundNumber: number;
  /** When set, the modal edits this round instead of creating a new one. */
  existing?: RoundWithId | null;
};

/** Quick-add amounts (UNO card values: action cards 20, wilds 50). */
const INCREMENTS = [1, 5, 10, 20, 50];

/** Compact styling so increment buttons don't inherit the theme's large buttons. */
const incButtonStyles = {
  root: {
    minHeight: "2.25rem",
    height: "2.25rem",
    paddingInline: "0.75rem",
    fontSize: "1rem",
  },
} as const;

/** Form with one points field per player. Lowest score wins the round. */
export default function RoundFormModal({
  opened,
  onClose,
  players,
  gameId,
  ownerId,
  nextRoundNumber,
  existing,
}: Props) {
  const { t } = useTranslate();
  const [values, setValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const initial: Record<string, number> = {};
    players.forEach((p) => {
      initial[p.id] =
        existing?.results.find((r) => r.playerId === p.id)?.points ?? 0;
    });
    setValues(initial);
  }, [opened, existing, players]);

  const bump = (id: string, inc: number) =>
    setValues((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + inc) }));
  const setVal = (id: string, val: number) =>
    setValues((prev) => ({ ...prev, [id]: val }));

  const handleSave = async () => {
    const results = players.map((p) => ({
      playerId: p.id,
      points: values[p.id] ?? 0,
    }));
    setSaving(true);
    try {
      if (existing) await updateRound(gameId, existing.id, results);
      else await createRound(ownerId, gameId, nextRoundNumber, results);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const title = existing
    ? `${t("Edit round")} ${existing.roundNumber}`
    : `${t("Round")} ${nextRoundNumber}`;

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text size="sm" c="dimmed">
          {t("Lowest score wins the round.")}
        </Text>

        {players.map((p) => (
          <Box key={p.id}>
            <Group justify="space-between" align="center" mb="0.5rem" wrap="nowrap">
              <Text fw={500}>{p.name}</Text>
              <NumberInput
                w={120}
                min={0}
                value={values[p.id] ?? 0}
                onChange={(v) => setVal(p.id, Number(v) || 0)}
              />
            </Group>
            <Group gap="0.5rem">
              {INCREMENTS.map((inc) => (
                <Button
                  key={inc}
                  variant="light"
                  styles={incButtonStyles}
                  onClick={() => bump(p.id, inc)}
                >
                  +{inc}
                </Button>
              ))}
              <Button
                variant="subtle"
                color="gray"
                styles={incButtonStyles}
                onClick={() => setVal(p.id, 0)}
              >
                {t("Clear")}
              </Button>
            </Group>
            <Divider mt="1rem" />
          </Box>
        ))}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            loading={saving}
            onClick={handleSave}
            disabled={players.length === 0}
          >
            {existing ? t("Save round") : t("Add round")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
