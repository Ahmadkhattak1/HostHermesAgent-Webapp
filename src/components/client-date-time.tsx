"use client";

import { useSyncExternalStore } from "react";

type ClientDateTimeProps = {
  value: string;
};

const STABLE_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  year: "numeric",
});

function formatStableDateTime(value: string) {
  return STABLE_DATE_TIME_FORMATTER.format(new Date(value));
}

function formatBrowserDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function ClientDateTime({ value }: ClientDateTimeProps) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const renderedValue = isHydrated
    ? formatBrowserDateTime(value)
    : formatStableDateTime(value);

  return (
    <time dateTime={value} suppressHydrationWarning>
      {renderedValue}
    </time>
  );
}
