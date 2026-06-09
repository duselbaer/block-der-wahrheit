# ADR-008: Trennung von abandonGame() und resetGame() + Persistenz von lastPlayerNames

**Status:** Entschieden  
**Datum:** 2026-06-09

---

## Kontext

Wenn ein Spieler ein laufendes Spiel vorzeitig abbricht, soll er beim nächsten Setup die gleichen Spielernamen bereits eingetragen sehen. Der bisherige `resetGame()`-Aufruf setzt `game: null`, verwirft aber alle Spielerinformationen ersatzlos.

Gleichzeitig muss ein bewusstes „Neues Spiel starten" von der Startseite aus die alten Namen ebenfalls verwerfen können (opt-in-Neueingabe ist gewünscht, aber Vorausfüllen reicht).

---

## Entscheidung

1. **Neue Action `abandonGame()`** im `GameStore`: speichert die Spielernamen des laufenden Spiels in `lastPlayerNames: string[]`, setzt dann `game: null`.
2. **`resetGame()` bleibt unverändert** — wird weiterhin verwendet, wenn auf der Startseite „Neues Spiel starten" geklickt wird (setzt `game: null`, `lastPlayerNames` bleibt jedoch erhalten, denn die Startseite nutzt `abandonGame` nicht).
3. **`lastPlayerNames`** wird über den bestehenden `persist`-Middleware-Adapter von Zustand im `localStorage` gespeichert.
4. **`SetupPage`** initialisiert `names` mit `lastPlayerNames` aus dem Store (Fallback: `["", ""]`).

---

## Begründung

| Option | Beschreibung | Bewertung |
|--------|-------------|-----------|
| A (gewählt) | Neue `abandonGame()`-Action, `lastPlayerNames` im Store | Klare semantische Trennung; Setup-Seite bleibt einfach |
| B | `resetGame()` nimmt Parameter `keepPlayers: boolean` | Schlechtere API — Boolean-Parameter verschleiern Absicht |
| C | Spielernamen im `sessionStorage` der Setup-Seite lokal merken | Kein Persist über Tabs/Reload; erzeugt doppelte Wahrheitsquelle |

---

## Konsequenzen

**Positiv:**
- Klare Trennung von "Neues Spiel, neue Spieler" (`resetGame`) vs. "Spiel abgebrochen, selbe Spieler weiterspielen" (`abandonGame`)
- `lastPlayerNames` überlebt Browser-Reload, da im `localStorage` persistiert
- Kein Refactoring von bestehendem Code nötig (additive Änderung)

**Negativ:**
- Zwei ähnliche Actions im Store — muss sauber dokumentiert sein
- Setup-Seite hat jetzt eine externe Abhängigkeit zum Store (bisher nur `startGame`)
