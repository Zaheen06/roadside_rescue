import os

# Files and folders to create
structure = [
    "layout.tsx",
    "page.tsx",
    "dashboard.tsx"
]

# Create each item
for item in structure:
    if "." in item:  
        # it's a file
        with open(item, "w") as f:
            f.write("")  # create empty file
        print(f"Created file: {item}")
    else:
        # it's a folder
        os.makedirs(item, exist_ok=True)
        print(f"Created folder: {item}")

print("All files and folders created successfully!")
