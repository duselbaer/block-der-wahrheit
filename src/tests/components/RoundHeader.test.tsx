// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { RoundHeader } from "@/components/game/RoundHeader";

afterEach(cleanup);

describe("RoundHeader", () => {
  it("zeigt Rundennummer und Gesamtrunden an", () => {
    render(<RoundHeader roundNumber={3} totalRounds={10} cardCount={3} />);
    expect(screen.getByText(/Runde 3 von 10/i)).toBeDefined();
  });

  it("zeigt Kartenanzahl im Plural an", () => {
    render(<RoundHeader roundNumber={2} totalRounds={10} cardCount={3} />);
    expect(screen.getByText(/3 Karten pro Spieler/i)).toBeDefined();
  });

  it("zeigt Kartenanzahl im Singular bei 1 Karte", () => {
    render(<RoundHeader roundNumber={1} totalRounds={10} cardCount={1} />);
    expect(screen.getByText(/1 Karte pro Spieler/i)).toBeDefined();
  });
});
