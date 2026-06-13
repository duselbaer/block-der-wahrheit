# ADR-009: Tool-Version-Management mit `mise`

**Datum:** 2026-06-13  
**Status:** akzeptiert  
**Kontext:** Reproduzierbare Entwicklungsumgebung

---

## Kontext

Das Projekt setzt Node.js 24 (LTS) voraus (`engines.node >= 24.0.0` in `package.json`) und nutzt Claude Code als CLI-Tool. Ohne explizites Version-Pinning können Entwickler unterschiedliche Node-Versionen verwenden und so schwer reproduzierbare Fehler produzieren.

---

## Entscheidung

**Wir verwenden [`mise`](https://mise.jdx.dev/) als Tool-Version-Manager.**

Die Konfiguration liegt in `mise.toml` im Projektstamm:

```toml
[tools]
claude = "latest"
node = "24"
```

---

## Begründung

1. **Einheitliche Umgebung:** Node 24 ist für alle Entwickler verpflichtend; `mise` stellt sicher, dass beim Betreten des Projektverzeichnisses automatisch die korrekte Version aktiviert wird.
2. **Claude Code als Projekt-Tool:** `claude = "latest"` macht Claude Code zur Projekt-Abhängigkeit — kein separates globales Install notwendig.
3. **Moderner `.tool-versions`-Ersatz:** `mise` ist kompatibler Nachfolger von `asdf`, unterstützt aber deutlich mehr Runtimes und ist schneller.
4. **Kein Commit von Node-Binaries:** Im Gegensatz zu `nvm` + `.nvmrc` aktiviert `mise` die Version automatisch ohne manuellen `nvm use`-Schritt.

---

## Konsequenzen

- **Positiv:** Neue Entwickler erhalten sofort die korrekte Node- und Claude-Version durch `mise install`.
- **Positiv:** CI/CD-Pipelines können ebenfalls `mise` nutzen und profitieren von identischen Versionen.
- **Negativ:** `mise` muss einmalig global installiert werden (`curl https://mise.run | sh`).
- **Voraussetzung:** Shell-Integration in `.bashrc`/`.zshrc` (`mise activate`) ist nötig, damit die automatische Versionsaktivierung greift.
