import { Button, Group, Menu } from "@mantine/core";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./languageSelect.module.css";
import { IconWorld } from "@tabler/icons-react";
import FlagUk from "./_assets/uk.svg?react";
import FlagBE from "./_assets/belgium.svg?react";
import { useSelector } from "react-redux";
import { RootState } from "@global/store/store";

const LanguageSelect = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18next.language);
  const navigate = useNavigate();

  const { isTablet } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const handleLanguageChangeEvent = () => {
      setCurrentLanguage(i18next.language);
    };

    i18next.on("languageChanged", handleLanguageChangeEvent);
    return () => {
      i18next.off("languageChanged", handleLanguageChangeEvent);
    };
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18next.changeLanguage(lang);
    navigate(`/${lang}`);
  };

  return (
    <Group style={{ width: isTablet ? "100%" : undefined }}>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            style={{
              width: isTablet ? "100%" : "auto",
            }}
            leftSection={
              currentLanguage === "nl" ? (
                <FlagBE width={32} />
              ) : (
                <FlagUk width={32} />
              )
            }
            variant="outline"
          >
            <IconWorld
              stroke={1}
              style={{
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              size={32}
            />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            className={styles.menuItem}
            h="2rem"
            onClick={() => handleLanguageChange("en")}
          >
            English
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            h="2rem"
            onClick={() => handleLanguageChange("nl")}
          >
            Nederlands
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default LanguageSelect;
