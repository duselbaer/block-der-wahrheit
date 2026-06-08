# /branch — Feature Branch nach Conventional Commits erstellen

Du erstellst einen Git-Feature-Branch, dessen Name dem **Conventional Commits**-Schema folgt.

**Feature / Beschreibung:** $ARGUMENTS

---

## Branch-Namensschema

```
<type>/<kurze-beschreibung-in-kebab-case>
```

### Typ-Prefix (identisch mit Conventional Commits)

| Typ        | Wann verwenden                          |
|------------|-----------------------------------------|
| `feat`     | Neue Funktion                            |
| `fix`      | Fehlerbehebung                           |
| `docs`     | Nur Dokumentation                        |
| `refactor` | Umstrukturierung ohne Funktionsänderung  |
| `test`     | Tests hinzufügen oder anpassen           |
| `chore`    | Tooling, Abhängigkeiten, Konfiguration   |
| `perf`     | Performance-Optimierung                  |
| `ci`       | CI/CD-Änderungen                         |

### Regeln für den Branch-Namen

- Nur Kleinbuchstaben, Ziffern und Bindestriche (`-`)
- Keine Leerzeichen, Unterstriche oder Sonderzeichen
- Kurz und aussagekräftig: 2–5 Wörter nach dem Präfix
- Maximal 50 Zeichen gesamt
- Kein Trailing-Dash

### Beispiele

```
feat/player-score-table
fix/zero-trick-round-calculation
test/store-localstorage-roundtrip
chore/add-vitest-config
refactor/extract-game-selectors
docs/add-adr-zustand-persistence
```

---

## Dein Ablauf

1. **Typ bestimmen:** Leite den passenden Typ aus `$ARGUMENTS` ab.
   - Falls unklar: frage einmalig nach.

2. **Branch-Namen ableiten:**
   - Kürze die Beschreibung auf das Wesentliche
   - Wandle in kebab-case um (Leerzeichen → `-`, Umlaute ersetzen: ä→ae, ö→oe, ü→ue, ß→ss)
   - Prüfe, ob der Name klar verständlich ist

3. **Aktuellen Branch prüfen:** Führe `git branch --show-current` aus.
   - Warnung ausgeben, wenn ungespeicherte Änderungen vorhanden sind (`git status`)

4. **Branch erstellen und wechseln:**
   ```bash
   git checkout -b <type>/<description>
   ```

5. **Bestätigung ausgeben:** Zeige den neuen Branch-Namen und den Ausgangsbranch.

---

## Ausgabe-Format

```
Branch erstellt: feat/player-score-table
Ausgangsbranch: main

Nächste Schritte:
  → Implementieren
  → /commit zum Committen nach Conventional Commits
```
