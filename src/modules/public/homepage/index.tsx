import Head from "@global/head";
import { RootState } from "@global/store/store";
import {
  Box,
  Button,
  Card as MantineCard,
  Center,
  Flex,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
  Divider,
  Group,
} from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm } from "@mantine/form";
import {
  IconCheck,
  IconEdit,
  IconMoon,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";
import { decideTextColor } from "@global/style/decideTextColor";
// @ts-ignore
import { notifications } from "@mantine/notifications";
import LanguageSelect from "@common/languageSelect";
import { useTranslate } from "@global/localization";

type User = {
  id: number;
  name: string;
  score: number;
};

const STORAGE_KEY_USERS = "users";
const STORAGE_KEY_NEXT_ID = "nextId";
const wakeSupported = "wakeLock" in navigator;

const Homepage = () => {
  const { mainMargin, gridCols, isTablet } = useSelector(
    (state: RootState) => state.ui
  );
  const theme = useMantineTheme();
  const { t } = useTranslate();
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      return raw ? (JSON.parse(raw) as User[]) : [];
    } catch {
      return [];
    }
  });

  const initialWake =
    typeof window !== "undefined" && localStorage.getItem("wake") === "true";
  const [wake, setWake] = useState<boolean>(initialWake);
  useEffect(() => {
    localStorage.setItem("wake", String(wake));
  }, [wake]);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const releaseHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      return;
    }

    const acquire = async () => {
      try {
        const sentinel = await (navigator as any).wakeLock.request("screen");
        wakeLockRef.current = sentinel;

        // define handler once
        const onRelease = () => {
          // only re‑acquire on real visibility changes, not manual toggles
          if (document.visibilityState === "visible" && wake) {
            acquire();
          }
        };

        // keep reference so we can detach it later
        releaseHandlerRef.current = onRelease;
        sentinel.addEventListener("release", onRelease);
      } catch (err) {}
    };

    const release = async () => {
      const sentinel = wakeLockRef.current;
      if (!sentinel) return;
      // remove listener so it won't fire us back
      if (releaseHandlerRef.current) {
        sentinel.removeEventListener("release", releaseHandlerRef.current);
        releaseHandlerRef.current = null;
      }
      await sentinel.release();
      wakeLockRef.current = null;
    };

    if (wake) {
      acquire();
    } else {
      release();
    }

    return () => {
      // on unmount, clean up
      if (wakeLockRef.current) {
        release();
      }
    };
  }, [wake]);

  // handle full-page visibility changes separately:
  useEffect(() => {
    const handleVisibility = () => {
      if (
        wake &&
        document.visibilityState === "visible" &&
        !wakeLockRef.current
      ) {
        // only re‑acquire when truly needed
        (navigator as any).wakeLock
          .request("screen")
          .then((sentinel: WakeLockSentinel) => {
            wakeLockRef.current = sentinel;
          });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [wake]);

  let oldScores: User[] | undefined = undefined;

  const [nextId, setNextId] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NEXT_ID);
      return raw ? parseInt(raw, 10) : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId));
  }, [nextId]);

  const [openedModal, setOpenedModal] = useState<
    "addUser" | "changeScore" | null
  >(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState<number>(0);

  const addUserForm = useForm({
    mode: "uncontrolled",
    initialValues: { name: "" },
    validate: { name: (v) => (v.trim() ? null : "Naam is verplicht") },
  });

  const changeScoreForm = useForm({
    mode: "uncontrolled",
    initialValues: { score: 0 },
  });

  const openChangeScore = (user: User) => {
    setEditingUserId(user.id);
    changeScoreForm.setFieldValue("score", user.score);
    setAddAmount(0);
    setOpenedModal("changeScore");
  };

  const handleApplyAdd = () => {
    const newScore = changeScoreForm.values.score + addAmount;
    changeScoreForm.setFieldValue("score", newScore);
    setAddAmount(0);
  };

  const handleSaveScore = () => {
    if (editingUserId === null) return;
    const finalScore = changeScoreForm.values.score + addAmount;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUserId ? { ...u, score: finalScore } : u
      )
    );
    changeScoreForm.reset();
    setAddAmount(0);
    setEditingUserId(null);
    setOpenedModal(null);
  };

  const handleCloseChange = () => {
    changeScoreForm.reset();
    setAddAmount(0);
    setEditingUserId(null);
    setOpenedModal(null);
  };

  const handleUndoReset = () => {
    if (!oldScores) return;
    setUsers(oldScores);
    notifications.clean();
    notifications.show({
      title: t("Reset undone"),
      message: t("The scores have been restored."),
      color: "blue",
      autoClose: 5000,
      icon: <IconCheck color="blue" />,
    });
  };
  const resetScores = () => {
    oldScores = users;
    setUsers((prev) => prev.map((u) => ({ ...u, score: 0 })));
    notifications.show({
      title: t("Scores reset"),
      message: (
        <Box>
          <Button variant="outline" onClick={handleUndoReset}>
            {t("Undo")}
          </Button>
        </Box>
      ),
      color: "red",
      autoClose: 5000,
      icon: <IconTrash color="black" />,
    });
  };

  const editingUser = users.find((u) => u.id === editingUserId);
  const oldScore = editingUser?.score ?? 0;
  const newScorePreview = changeScoreForm.values.score + addAmount;

  return (
    <>
      <Head title="" description="This is the homepage" SEODisabled />
      <Box mt="5rem" mx={mainMargin}>
        <Flex
          direction={isTablet ? "column" : "row"}
          gap="2rem"
          justify="space-between"
          align="center"
          mb="2rem"
        >
          {!isTablet && (
            <Button
              w={isTablet ? "100%" : "auto"}
              onClick={() => setOpenedModal("addUser")}
            >
              {t("Add player")}
            </Button>
          )}
          <Group>
            {isTablet && (
              <Button
                w={isTablet ? "100%" : "auto"}
                onClick={() => setOpenedModal("addUser")}
              >
                {t("Add player")}
              </Button>
            )}
            <LanguageSelect />
            {!wakeSupported ? null : (
              <Button
                variant="outline"
                w={isTablet ? "100%" : "auto"}
                onClick={() => setWake((prev) => !prev)}
              >
                {wake ? <IconSun /> : <IconMoon />}
              </Button>
            )}
          </Group>
        </Flex>

        {users.length > 0 ? (
          <Box mt="2rem" w="100%">
            <Title order={3} mb="2rem">
              {t("Players")}
            </Title>
            <SimpleGrid cols={gridCols} mx="auto">
              {users.map((user, i) => {
                const bgColor =
                  theme.colors.cards[i % theme.colors.cards.length];
                return (
                  <MantineCard bg={bgColor} py="1rem" px="2rem" key={user.id}>
                    <Flex
                      c={decideTextColor(bgColor)}
                      justify="space-between"
                      align="center"
                    >
                      <Stack>
                        <Text size="sm">{t("Player")}</Text>
                        <Text>{user.name}</Text>
                      </Stack>
                      <Stack>
                        <Text size="sm">{t("Score")}</Text>
                        <Text>{user.score}</Text>
                      </Stack>
                      <Stack>
                        <IconEdit
                          style={{ cursor: "pointer" }}
                          onClick={() => openChangeScore(user)}
                        />
                        <IconTrash
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setUsers((prev) =>
                              prev.filter((u) => u.id !== user.id)
                            )
                          }
                        />
                      </Stack>
                    </Flex>
                  </MantineCard>
                );
              })}
            </SimpleGrid>
            <Center mt="5rem">
              <Button onClick={resetScores}>{t("Reset scores")}</Button>
            </Center>
          </Box>
        ) : (
          <Center mt="2rem">
            <Text>{t("No players added yet.")}</Text>
          </Center>
        )}
      </Box>

      {/* Add User Modal */}
      <Modal
        opened={openedModal === "addUser"}
        onClose={() => setOpenedModal(null)}
        title={t("Add player")}
        centered
      >
        <form
          onSubmit={addUserForm.onSubmit((values) => {
            const newUser: User = {
              id: nextId,
              name: values.name,
              score: 0,
            };
            setUsers((prev) => [...prev, newUser]);
            setNextId((i) => i + 1);
            addUserForm.reset();
            setOpenedModal(null);
          })}
        >
          <TextInput
            withAsterisk
            label={t("Name")}
            placeholder={t("Enter name")}
            {...addUserForm.getInputProps("name")}
          />
          <Button mt="2rem" w="100%" type="submit">
            {t("Add")}
          </Button>
        </form>
      </Modal>

      {/* Change Score Modal */}
      <Modal
        opened={openedModal === "changeScore"}
        onClose={handleCloseChange}
        title={`${t("Change score for")} ${editingUser?.name || ""}`}
      >
        <Center>
          <Stack gap="0">
            <Text mb="1rem">
              {t("Current score")}: {oldScore}
            </Text>
            <Text mb="1rem">
              {t("New score")}: {newScorePreview}
            </Text>
          </Stack>
        </Center>

        <Flex justify="center" gap="1rem" mb="1rem" wrap="wrap">
          {[1, 5, 10].map((inc) => (
            <Button
              key={inc}
              onClick={() =>
                changeScoreForm.setFieldValue(
                  "score",
                  changeScoreForm.values.score + inc
                )
              }
            >
              +{inc}
            </Button>
          ))}
        </Flex>

        <NumberInput
          label={t("Or enter a score")}
          placeholder={t("Enter score")}
          value={changeScoreForm.values.score}
          onChange={(val) =>
            changeScoreForm.setFieldValue("score", Number(val) || 0)
          }
          mb="1rem"
        />

        <Divider size={2} my="1rem" />
        <NumberInput
          label={t("Amount to add")}
          placeholder={t("Enter amount")}
          value={addAmount}
          onChange={(val) => setAddAmount(Number(val) || 0)}
          mb="1rem"
        />
        <Button w="100%" variant="outline" onClick={handleApplyAdd}>
          {t("Add")}
        </Button>
        <Divider size={2} my="1rem" />
        <Flex mt="3rem" justify="space-between">
          <Button w="100%" onClick={handleSaveScore}>
            {t("Adjust score")}
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default Homepage;
