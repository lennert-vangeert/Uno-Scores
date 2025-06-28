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
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "@mantine/form";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { decideTextColor } from "@global/style/decideTextColor";
// @ts-ignore
import * as deck from "@letele/playing-cards";

type CardKey = keyof typeof deck;

type User = {
  id: number;
  name: string;
  score: number;
  card: CardKey;
};

const STORAGE_KEY_USERS = "users";
const STORAGE_KEY_NEXT_ID = "nextId";
const SHOW_CARDS = localStorage.getItem("showCards") === "true";

const Homepage = () => {
  const { mainMargin, gridCols, isTablet } = useSelector(
    (state: RootState) => state.ui
  );
  const theme = useMantineTheme();

  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      return raw ? (JSON.parse(raw) as User[]) : [];
    } catch {
      console.warn("Could not parse users from localStorage");
      return [];
    }
  });

  const [nextId, setNextId] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NEXT_ID);
      return raw ? parseInt(raw, 10) : 1;
    } catch {
      console.warn("Could not parse nextId from localStorage");
      return 1;
    }
  });

  const [showCards, setShowCards] = useState<boolean>(SHOW_CARDS);

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

  const allCardKeys = Object.keys(deck).filter(
    (k) => typeof deck[k as CardKey] === "function"
  ) as CardKey[];

  const getRandomCardKey = (): CardKey => {
    const idx = Math.floor(Math.random() * allCardKeys.length);
    return allCardKeys[idx];
  };

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
          <Button
            w={isTablet ? "100%" : "auto"}
            onClick={() => setOpenedModal("addUser")}
          >
            Voeg speler toe
          </Button>
          <Button
            variant="outline"
            w={isTablet ? "100%" : "auto"}
            onClick={() => setShowCards((prev) => !prev)}
          >
            {showCards ? "Verberg kaarten" : "Toon kaarten"}
          </Button>
        </Flex>

        {users.length > 0 ? (
          <Box mt="2rem" w="100%">
            <Title order={3} mb="2rem">
              Spelers
            </Title>
            <SimpleGrid cols={gridCols} mx="auto">
              {users.map((user, i) => {
                const CardSVG = deck[user.card];
                const bgColor =
                  theme.colors.cards[i % theme.colors.cards.length];
                return (
                  <MantineCard bg={bgColor} py="1rem" px="2rem" key={user.id}>
                    {showCards && (
                      <Box mb="2.5rem">
                        <CardSVG style={{ width: "100%", height: "100%" }} />
                      </Box>
                    )}
                    <Flex
                      c={decideTextColor(bgColor)}
                      justify="space-between"
                      align="center"
                    >
                      <Stack>
                        <Text size="sm">Speler</Text>
                        <Text>{user.name}</Text>
                      </Stack>
                      <Stack>
                        <Text size="sm">Score</Text>
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
              <Button
                onClick={() =>
                  setUsers((prev) => prev.map((u) => ({ ...u, score: 0 })))
                }
              >
                Reset scores
              </Button>
            </Center>
          </Box>
        ) : (
          <Center mt="2rem">
            <Text>Er zijn nog geen spelers toegevoegd.</Text>
          </Center>
        )}
      </Box>

      {/* Add User Modal */}
      <Modal
        opened={openedModal === "addUser"}
        onClose={() => setOpenedModal(null)}
        title="Voeg speler toe"
      >
        <form
          onSubmit={addUserForm.onSubmit((values) => {
            const newUser: User = {
              id: nextId,
              name: values.name,
              score: 0,
              card: getRandomCardKey(),
            };
            setUsers((prev) => [...prev, newUser]);
            setNextId((i) => i + 1);
            addUserForm.reset();
            setOpenedModal(null);
          })}
        >
          <TextInput
            withAsterisk
            label="Naam"
            placeholder="Voer naam in"
            {...addUserForm.getInputProps("name")}
          />
          <Button mt="2rem" w="100%" type="submit">
            Toevoegen
          </Button>
        </form>
      </Modal>

      {/* Change Score Modal */}
      <Modal
        opened={openedModal === "changeScore"}
        onClose={handleCloseChange}
        title="Verander score"
      >
        <Center>
          <Stack>
            <Text mb="1rem">Huidige score: {oldScore}</Text>
            <Text mb="1rem">Nieuwe score: {newScorePreview}</Text>
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
          label="Of voer een score in"
          placeholder="Voer score in"
          value={changeScoreForm.values.score}
          onChange={(val) =>
            changeScoreForm.setFieldValue("score", Number(val) || 0)
          }
          mb="1rem"
        />

        <Divider size={2} my="1rem" />
        <NumberInput
          label="Bedrag toevoegen"
          placeholder="Voer bedrag in"
          value={addAmount}
          onChange={(val) => setAddAmount(Number(val) || 0)}
          mb="1rem"
        />
        <Button w="100%" variant="outline" onClick={handleApplyAdd}>
          Voeg toe
        </Button>
        <Divider size={2} my="1rem" />
        <Flex mt="3rem" justify="space-between">
          <Button w="100%" onClick={handleSaveScore}>Score aanpassen</Button>
        </Flex>
      </Modal>
    </>
  );
};

export default Homepage;
