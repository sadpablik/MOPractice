from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "app.db"
IMPORT_DIR = BASE_DIR / "import"
ASSETS_DIR = BASE_DIR / "assets"
PRODUCT_IMAGES_DIR = ASSETS_DIR / "product_images"
DEFAULT_IMAGE_PATH = IMPORT_DIR / "picture.png"
APP_ICON_PATH = IMPORT_DIR / "Icon.ico"
LOGO_PATH = IMPORT_DIR / "Icon.png"

PRIMARY_BG = "#FFFFFF"
SECONDARY_BG = "#7FFF00"
ACCENT_BG = "#00FA9A"
DISCOUNT_BG = "#2E8B57"
OUT_OF_STOCK_BG = "#BDE9FF"
