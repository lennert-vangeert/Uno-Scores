import { useState } from "react";
import {
  Button,
  Center,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandGoogle, IconCards } from "@tabler/icons-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@global/firebase/useAuth";
import { useTranslate } from "@global/localization";
import Head from "@global/head";

/** Google-only sign-in screen. Signed-in users are bounced to the games list. */
export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t, tL } = useTranslate();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={tL("/")} replace />;
  }

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate(tL("/"));
    } catch {
      notifications.show({
        color: "red",
        message: t("Sign in failed. Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head
        title={t("Sign in")}
        description="Sign in to the UNO scorekeeper"
        SEODisabled
      />
      <Center mih="100vh" p="lg">
        <Paper withBorder p="2.5rem" maw={420} w="100%">
          <Stack align="center" gap="lg">
            <ThemeIcon size={64} radius="xl" variant="light">
              <IconCards size={36} />
            </ThemeIcon>
            <Title order={2} ta="center">
              {t("UNO Scorekeeper")}
            </Title>
            <Text c="dimmed" ta="center">
              {t("Sign in to save your games and keep your stats.")}
            </Text>
            <Button
              fullWidth
              size="md"
              loading={submitting}
              leftSection={<IconBrandGoogle size={18} />}
              onClick={handleGoogle}
            >
              {t("Continue with Google")}
            </Button>
          </Stack>
        </Paper>
      </Center>
    </>
  );
}
