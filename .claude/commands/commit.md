# /commit — Conventional Commit erstellen

Du erstellst einen Git-Commit nach dem **Conventional Commits**-Standard (https://www.conventionalcommits.org).

**Kontext / optionale Hinweise:** $ARGUMENTS

---

## Conventional Commits – Kurzreferenz

### Format

```
<type>[(<scope>)][!]: <description>

[optional body]

[optional footer(s)]
```

### Typen

| Typ        | Wann verwenden                                              |
|------------|-------------------------------------------------------------|
| `feat`     | Neue Funktion für den Nutzer                                |
| `fix`      | Fehlerbehebung für den Nutzer                               |
| `docs`     | Nur Dokumentation (kein Code)                               |
| `style`    | Formatierung, Whitespace, fehlende Semikola — kein Logik-Wechsel |
| `refactor` | Code-Umstrukturierung ohne neue Funktion oder Bug-Fix       |
| `perf`     | Performance-Verbesserung                                    |
| `test`     | Tests hinzufügen oder korrigieren                           |
| `chore`    | Build-Prozess, Abhängigkeiten, Tooling                      |
| `build`    | Build-System oder externe Abhängigkeiten                    |
| `ci`       | CI/CD-Konfiguration                                         |
| `revert`   | Rückgängigmachen eines früheren Commits                     |

### Breaking Change

- `!` nach dem Typ: `feat!: neues API-Format`
- Oder Footer: `BREAKING CHANGE: <Erklärung>`

### Regeln

- `description` im Imperativ, Kleinschreibung, kein Punkt am Ende
- Maximal 72 Zeichen in der ersten Zeile
- `scope` in Kleinbuchstaben, beschreibt den Bereich (z. B. `store`, `ui`, `domain`)
- Body erklärt das **Warum**, nicht das **Was** — wird durch den Code selbst beschrieben
- Body und Footer mit Leerzeile von der ersten Zeile trennen

---

## Dein Ablauf

1. **Änderungen analysieren:** Führe `git diff --staged` und `git status` aus.
   - Falls nichts staged ist: führe `git diff` aus (unstaged).
   - Falls `$ARGUMENTS` einen Hinweis enthält, berücksichtige ihn.

2. **Typ bestimmen:** Wähle den passenden Typ aus der Tabelle.
   - Bei Unklarheit: frage gezielt nach (maximal eine Frage).

3. **Scope bestimmen:** Nur wenn die Änderung klar einem Bereich zuzuordnen ist.

4. **Breaking Change prüfen:** Gibt es inkompatible API-Änderungen?

5. **Commit-Nachricht entwerfen:**
   - Erste Zeile: `type(scope): description` (≤ 72 Zeichen)
   - Body: nur wenn das Warum nicht aus dem Code hervorgeht
   - Footer: für Breaking Changes oder Issue-Referenzen (`Closes #NNN`)

6. **Commit ausführen:** Nutze ein HEREDOC, um Formatierung zu erhalten:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): description

   Optional body.

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```

7. **Ergebnis melden:** Zeige die finale Commit-Nachricht und den Hash.

---

## Beispiele

```
feat(store): add localStorage round-trip for game state
fix(score): handle zero-trick round correctly (0/0 → +20)
test(domain): add edge cases for calculateScore
chore: add vitest configuration
docs(decisions): add ADR-002 for zustand persistence
refactor(game): extract selectLeaderboard into selectors module
feat!: change scoring API — predicted is now required
```
