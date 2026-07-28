with open("backend/models/User.js", "r") as f:
    model = f.read()

# I want to add new fields after 'title'.
insertion = """    isPublicProfile: { type: Boolean, default: false },
    services: { type: String, default: '' },
    experience: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    availability: { type: String, default: '' },"""

if "isPublicProfile" not in model:
    model = model.replace("    title: { type: String, default: '' },", f"    title: {{ type: String, default: '' }},\n{insertion}")

with open("backend/models/User.js", "w") as f:
    f.write(model)

