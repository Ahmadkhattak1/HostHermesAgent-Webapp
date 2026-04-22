"use client";

import { useState } from "react";
import styles from "@/app/console.module.css";

type SettingsBackButtonProps = {
  href: string;
};

export function SettingsBackButton({ href }: SettingsBackButtonProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  return (
    <button
      className={styles.settingsBackLink}
      disabled={isLeaving}
      onClick={() => {
        setIsLeaving(true);
        window.location.replace(href);
      }}
      type="button"
    >
      Back
    </button>
  );
}
