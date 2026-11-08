import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { umami } from "../../shared/analytics";
import { useAppStore } from "../../shared/state/store";
import { text } from "../../text/en";
import { AnalyticsNotice } from "./AnalyticsNotice";

const words = text.analyticsNotice;

function analyticsScript() {
  return document.head.querySelector(`script[src="${umami.src}"]`);
}

function notice() {
  return screen.getByRole("dialog", { name: words.title });
}

afterEach(() => {
  analyticsScript()?.remove();
});

describe("analytics notice", () => {
  it("shows a modal notice to a new player and does not load analytics", () => {
    render(<AnalyticsNotice />);
    expect(notice()).toHaveProperty("open", true);
    expect(notice()).toHaveAccessibleDescription(words.body);
    expect(analyticsScript()).toBeNull();
  });

  it("closes, saves the OK and loads analytics after the OK", async () => {
    const user = userEvent.setup();
    render(<AnalyticsNotice />);
    await user.click(screen.getByRole("button", { name: words.ok }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useAppStore.getState().cookieBanner).toBe(true);
    expect(analyticsScript()).not.toBeNull();
  });

  it("does not show to a returning player, and loads analytics at once", () => {
    useAppStore.getState().acknowledgeNotice();
    render(<AnalyticsNotice />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(analyticsScript()).not.toBeNull();
  });

  it("stays open after the Escape key", () => {
    render(<AnalyticsNotice />);
    const isNotStopped = fireEvent(notice(), new Event("cancel", { cancelable: true }));
    expect(isNotStopped).toBe(false);
    expect(notice()).toHaveProperty("open", true);
  });

  it("opens again when the browser closes it without the OK", () => {
    render(<AnalyticsNotice />);
    act(() => {
      (notice() as HTMLDialogElement).close();
    });
    expect(notice()).toHaveProperty("open", true);
    expect(analyticsScript()).toBeNull();
  });
});
