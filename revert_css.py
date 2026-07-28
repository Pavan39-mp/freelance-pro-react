import re

with open('src/index.css', 'r') as f:
    css = f.read()

root_match = re.search(r':root\s*\{([^}]+)\}', css)
dark_match = re.search(r'\.dark\s*\{([^}]+)\}', css)

root_vars = root_match.group(1).strip()
dark_vars = dark_match.group(1).strip()

new_css = css.replace(root_match.group(1), f"\n  /* DARK THEME (Default) */\n  {dark_vars}\n")
new_css = new_css.replace(dark_match.group(0), f".light {{\n  /* LIGHT THEME */\n  {root_vars}\n}}")

with open('src/index.css', 'w') as f:
    f.write(new_css)
