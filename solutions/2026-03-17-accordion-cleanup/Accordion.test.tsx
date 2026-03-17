import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Accordion, Faq } from "./Accordion";

// ── Accordion Tests ───────────────────────────────────────────────────

describe("Accordion", () => {
  const items = [
    { id: "a", title: "Section A", content: "Content for section A" },
    { id: "b", title: "Section B", content: "Content for section B" },
    { id: "c", title: "Section C", content: "Content for section C" },
  ];

  it("renders all item titles as buttons", () => {
    render(<Accordion items={items} />);

    expect(screen.getByRole("button", { name: /Section A/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Section B/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Section C/ })).toBeInTheDocument();
  });

  it("starts with all panels collapsed", () => {
    render(<Accordion items={items} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    expect(screen.queryByText("Content for section A")).not.toBeInTheDocument();
    expect(screen.queryByText("Content for section B")).not.toBeInTheDocument();
    expect(screen.queryByText("Content for section C")).not.toBeInTheDocument();
  });

  it("expands a panel when its trigger is clicked", async () => {
    render(<Accordion items={items} />);

    await userEvent.click(screen.getByRole("button", { name: /Section A/ }));

    expect(screen.getByRole("button", { name: /Section A/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText("Content for section A")).toBeInTheDocument();
  });

  it("collapses a panel when its trigger is clicked again", async () => {
    render(<Accordion items={items} />);

    const trigger = screen.getByRole("button", { name: /Section A/ });
    await userEvent.click(trigger);
    expect(screen.getByText("Content for section A")).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText("Content for section A")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("in single mode, opening one panel closes the other", async () => {
    render(<Accordion items={items} />);

    await userEvent.click(screen.getByRole("button", { name: /Section A/ }));
    expect(screen.getByText("Content for section A")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Section B/ }));
    expect(screen.queryByText("Content for section A")).not.toBeInTheDocument();
    expect(screen.getByText("Content for section B")).toBeInTheDocument();
  });

  it("in multiple mode, multiple panels can be open simultaneously", async () => {
    render(<Accordion items={items} allowMultiple />);

    await userEvent.click(screen.getByRole("button", { name: /Section A/ }));
    await userEvent.click(screen.getByRole("button", { name: /Section C/ }));

    expect(screen.getByText("Content for section A")).toBeInTheDocument();
    expect(screen.getByText("Content for section C")).toBeInTheDocument();
    expect(screen.queryByText("Content for section B")).not.toBeInTheDocument();
  });

  it("has correct aria-controls / aria-labelledby relationships", async () => {
    render(<Accordion items={items} />);

    await userEvent.click(screen.getByRole("button", { name: /Section A/ }));

    const trigger = screen.getByRole("button", { name: /Section A/ });
    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });
});

// ── FAQ Tests ─────────────────────────────────────────────────────────

describe("Faq", () => {
  const questions = [
    { question: "What is React?", answer: "A JavaScript library for building UI." },
    { question: "What is JSX?", answer: "A syntax extension for JavaScript." },
  ];

  it("renders all questions as buttons", () => {
    render(<Faq questions={questions} />);

    expect(screen.getByRole("button", { name: /What is React/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /What is JSX/ })).toBeInTheDocument();
  });

  it("expands only one answer at a time", async () => {
    render(<Faq questions={questions} />);

    await userEvent.click(screen.getByRole("button", { name: /What is React/ }));
    expect(screen.getByText("A JavaScript library for building UI.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /What is JSX/ }));
    expect(screen.queryByText("A JavaScript library for building UI.")).not.toBeInTheDocument();
    expect(screen.getByText("A syntax extension for JavaScript.")).toBeInTheDocument();
  });

  it("collapses the open answer when clicked again", async () => {
    render(<Faq questions={questions} />);

    const trigger = screen.getByRole("button", { name: /What is React/ });
    await userEvent.click(trigger);
    expect(screen.getByText("A JavaScript library for building UI.")).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(
      screen.queryByText("A JavaScript library for building UI.")
    ).not.toBeInTheDocument();
  });
});
