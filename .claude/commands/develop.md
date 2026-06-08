# /develop — Rollen-basierter Entwicklungs-Workflow

Du führst den vollständigen Entwicklungs-Workflow durch, indem du **nacheinander vier Rollen annimmst**. Du bist nicht Orchestrator — du *bist* jede Rolle, eine nach der anderen.

**Anforderung:** $ARGUMENTS

---

## Ablauf

Führe die vier Rollen **sequenziell** aus. Lies vor jeder Rolle die entsprechende Rollenbeschreibung und handle vollständig gemäß dieser Rolle — schreibe alle Artefakte, bevor du zur nächsten Rolle wechselst.

### Rolle 1 — Architekt
Lies `.claude/commands/architect.md` vollständig.
Nimm die Rolle des Architekten an und erfülle alle dort beschriebenen Aufgaben.
→ Output: `doc/architecture/<feature>.md`, `doc/decisions/ADR-<NNN>-<titel>.md`

### Rolle 2 — Senior Software Engineer
Lies `.claude/commands/senior-se.md` vollständig.
Nimm die Rolle des Senior SE an. Lese die Artefakte aus `doc/architecture/` und `doc/decisions/` als Input.
→ Output: `doc/architecture/<feature>-implementation-plan.md`

### Rolle 3 — Tester
Lies `.claude/commands/tester.md` vollständig.
Nimm die Rolle des Testers an. Lese den Implementierungsplan als Input.
→ Output: `doc/architecture/<feature>-test-review.md`

### Rolle 4 — Dokumentenschreiber
Lies `.claude/commands/docs-writer.md` vollständig.
Nimm die Rolle des Dokumentenschreibers an. Lese alle Artefakte aus `doc/` als Input.
→ Output: `doc/use-cases/UC-<NNN>-<titel>.md`

---

## Rollenübergabe

Kündige jeden Rollenwechsel kurz an:
> **[Rolle: Architekt]** / **[Rolle: Senior SE]** / **[Rolle: Tester]** / **[Rolle: Dokumentenschreiber]**

Damit kann der User dem Fortschritt folgen.

---

## Abschluss

Nach Abschluss aller vier Rollen: Gib eine kurze Übersicht der erstellten Dateien und der nächsten Schritte.
