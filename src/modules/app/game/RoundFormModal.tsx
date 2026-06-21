import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
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
          <NumberInput
            key={p.id}
            label={p.name}
            min={0}
            value={values[p.id] ?? 0}
            onChange={(v) =>
              setValues((prev) => ({ ...prev, [p.id]: Number(v) || 0 }))
            }
          />
        ))}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button loading={saving} onClick={handleSave} disabled={players.length === 0}>
            {existing ? t("Save round") : t("Add round")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
