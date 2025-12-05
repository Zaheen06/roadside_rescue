import os

files = [
    "Header.tsx",
    "RequestForm.tsx",
    "Map.tsx"
]

for file in files:
    with open(file, "w") as f:
        f.write("")   # empty file
    print(f"Created file: {file}")

print("All files created successfully!")

