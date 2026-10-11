from pathlib import Path
root = Path(__file__).resolve().parent
repo = Path(input("Path to your BL-draft repository folder: ").strip().strip('"')).resolve()
player_file = repo / "js" / "players.js"
content = player_file.read_text(encoding="utf-8")
needle = 'nationality: null, weapons: [{"id":"tactical-planning"'
replacement = 'nationality: {"code":"MT","name":"Malta","basis":"nationality","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Marc_Snuffy","note":"Marc Snuffy is from the Republic of Malta."}}, weapons: [{"id":"tactical-planning"'
if content.count(needle) != 1 or 'name: "Marc Snuffy"' not in content:
    raise SystemExit("Expected latest-main Snuffy record not found exactly once; no changes made.")
content = content.replace(needle, replacement, 1)
player_file.write_text(content, encoding="utf-8")
flag_target = repo / "assets" / "flags" / "mt.svg"
flag_target.parent.mkdir(parents=True, exist_ok=True)
flag_target.write_bytes((root / "assets" / "flags" / "mt.svg").read_bytes())
print("Patched Marc Snuffy: Malta (MT) and added flag asset.")
