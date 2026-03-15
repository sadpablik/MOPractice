from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.schemas import (
    OrderCreateRequest,
    OrderResponse,
    OrderUpdateRequest,
    ProductCreateRequest,
    ProductResponse,
    ProductUpdateRequest,
    UserLoginRequest,
    UserResponse,
)
from app.store import (
    authenticate,
    list_orders,
    list_products,
    put_order,
    put_product,
    remove_order,
    remove_product,
)

app = FastAPI(title="Shoe Store API", version="1.0.0")

PROJECT_ROOT = Path(__file__).resolve().parents[3]
IMPORT_DIR = PROJECT_ROOT / "import"

if IMPORT_DIR.exists():
    app.mount("/images", StaticFiles(directory=IMPORT_DIR), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=UserResponse)
def login(payload: UserLoginRequest) -> UserResponse:
    user = authenticate(payload.login, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    return user


@app.get("/products", response_model=list[ProductResponse])
def get_products() -> list[ProductResponse]:
    return list_products()


@app.post("/products", response_model=ProductResponse)
def create_product(payload: ProductCreateRequest) -> ProductResponse:
    final_price = round(payload.price * (1 - payload.discount_percent / 100), 2)
    product = ProductResponse(**payload.model_dump(), final_price=final_price)
    return put_product(payload.article, product)


@app.put("/products/{article}", response_model=ProductResponse)
def update_product(article: str, payload: ProductUpdateRequest) -> ProductResponse:
    final_price = round(payload.price * (1 - payload.discount_percent / 100), 2)
    product = ProductResponse(**payload.model_dump(), final_price=final_price)
    return put_product(article, product)


@app.delete("/products/{article}")
def delete_product(article: str) -> dict[str, str]:
    deleted = remove_product(article)
    if not deleted:
        raise HTTPException(status_code=409, detail="Товар участвует в заказе")
    return {"message": "Удалено"}


@app.get("/orders", response_model=list[OrderResponse])
def get_orders() -> list[OrderResponse]:
    return list_orders()


@app.post("/orders", response_model=OrderResponse)
def create_order(payload: OrderCreateRequest) -> OrderResponse:
    order = OrderResponse(**payload.model_dump())
    return put_order(payload.id, order)


@app.put("/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, payload: OrderUpdateRequest) -> OrderResponse:
    order = OrderResponse(**payload.model_dump())
    return put_order(order_id, order)


@app.delete("/orders/{order_id}")
def delete_order(order_id: int) -> dict[str, str]:
    remove_order(order_id)
    return {"message": "Удалено"}
