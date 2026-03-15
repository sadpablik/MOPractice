from datetime import date

from pydantic import BaseModel, Field


class UserLoginRequest(BaseModel):
    login: str
    password: str


class UserResponse(BaseModel):
    full_name: str
    role: str


class ProductBase(BaseModel):
    article: str = Field(min_length=2, max_length=20)
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=2, max_length=500)
    manufacturer: str = Field(min_length=2, max_length=80)
    supplier: str = Field(min_length=2, max_length=80)
    price: float = Field(ge=0)
    unit: str = Field(min_length=1, max_length=20)
    stock_qty: int = Field(ge=0)
    discount_percent: int = Field(ge=0, le=100)
    image_url: str | None = None


class ProductCreateRequest(ProductBase):
    pass


class ProductUpdateRequest(ProductBase):
    pass


class ProductResponse(ProductBase):
    final_price: float


class OrderItem(BaseModel):
    article: str
    quantity: int = Field(gt=0)


class OrderBase(BaseModel):
    id: int = Field(gt=0)
    status: str = Field(min_length=2)
    pickup_address: str = Field(min_length=5)
    order_date: date
    delivery_date: date
    client_full_name: str | None = None
    receive_code: str = Field(min_length=3, max_length=10)
    items: list[OrderItem]


class OrderCreateRequest(OrderBase):
    pass


class OrderUpdateRequest(OrderBase):
    pass


class OrderResponse(OrderBase):
    pass
