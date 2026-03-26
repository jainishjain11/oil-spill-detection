import os

DATA_PATH = "data/raw/"

print("Classes found:", os.listdir(DATA_PATH))

for cls in os.listdir(DATA_PATH):
    path = os.path.join(DATA_PATH, cls)
    print(f"{cls} → {len(os.listdir(path))} images")