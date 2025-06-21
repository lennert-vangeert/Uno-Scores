import Head from "@global/head";
import { RootState } from "@global/store/store";
import {
  Box,
  Button,
  Card,
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
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "@mantine/form";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { decideTextColor } from "@global/style/decideTextColor";

type User = { id: number; name: string; score: number };

const STORAGE_KEY_USERS = "myapp_users";
const STORAGE_KEY_NEXT_ID = "myapp_nextId";

const Homepage = () => {
  const { mainMargin, gridCols } = useSelector((state: RootState) => state.ui);

  // Lazy-init users from localStorage (client only)
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

  // Lazy-init nextId from localStorage (client only)
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

  // Persist users
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      console.warn("Failed to save users to localStorage");
    }
  }, [users]);

  // Persist nextId
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId));
    } catch {
      console.warn("Failed to save nextId to localStorage");
    }
  }, [nextId]);

  // Modal & form state
  const [openedModal, setOpenedModal] = useState<
    "addUser" | "changeScore" | null
  >(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

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
    setOpenedModal("changeScore");
  };

  const handleSaveScore = () => {
    if (editingUserId === null) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUserId
          ? { ...u, score: changeScoreForm.values.score }
          : u
      )
    );
    changeScoreForm.reset();
    setEditingUserId(null);
    setOpenedModal(null);
  };

  const handleCloseChange = () => {
    changeScoreForm.reset();
    setEditingUserId(null);
    setOpenedModal(null);
  };

  const theme = useMantineTheme();
  return (
    <>
      <Head title="" description="This is the homepage" SEODisabled />
      <Box mt="5rem" mx={mainMargin}>
        <Button onClick={() => setOpenedModal("addUser")}>
          Voeg speler toe
        </Button>

        {users.length > 0 && (
          <Box mt="2rem" w="100%">
            <Title order={3} mb="2rem">Spelers</Title>
            <SimpleGrid mx="auto" cols={gridCols}>
              {users.map((user, i) => (
                <Card
                  bg={theme.colors.cards[i % theme.colors.cards.length]}
                  py="1rem"
                  px="2rem"
                  key={user.id}
                >
                  <Flex
                    c={decideTextColor(
                      theme.colors.cards[i % theme.colors.cards.length]
                    )}
                    justify="space-between"
                    align="center"
                  >
                    <Stack>
                      <Text>Speler</Text>
                      <Text>{user.name}</Text>
                    </Stack>
                    <Stack>
                      <Text>score</Text>
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
                </Card>
              ))}
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
        )}
      </Box>

      {/* Add User */}
      <Modal
        opened={openedModal === "addUser"}
        onClose={() => setOpenedModal(null)}
        title="Voeg speler toe"
      >
        <form
          onSubmit={addUserForm.onSubmit((values) => {
            setUsers((prev) => [
              ...prev,
              { id: nextId, name: values.name, score: 0 },
            ]);
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

      {/* Change Score */}
      <Modal
        opened={openedModal === "changeScore"}
        onClose={handleCloseChange}
        title="Verander score"
      >
        <Center>
          <Text mb="1rem">Huidige score: {changeScoreForm.values.score}</Text>
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
        <Button onClick={handleSaveScore} mt="2rem" w="100%">
          Klaar
        </Button>
      </Modal>
    </>
  );
};

export default Homepage;
