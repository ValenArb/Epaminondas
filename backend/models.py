from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Table
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    pin_hash = Column(String) # Argon2 hash
    role = Column(String) # admin, seller, supervisor
    branch_id = Column(Integer, ForeignKey("branches.id"))
    is_active = Column(Boolean, default=True)
    
    branch = relationship("Branch")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_info = Column(String, nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, nullable=True)
    credit_limit = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    branch_id = Column(Integer, ForeignKey("branches.id"))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    isbn = Column(String, index=True, nullable=True)
    internal_code = Column(String, unique=True, index=True, nullable=True)
    cost = Column(Float)
    price = Column(Float)
    stock = Column(Float, default=0.0)
    min_stock = Column(Float, default=0.0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(Integer) # POS session local ID
    station_id = Column(String) # POS station identifier
    branch_id = Column(Integer, ForeignKey("branches.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total = Column(Float)
    payment_method = Column(String) # CASH, CARD, TRANSFER, CREDIT
    fiscal_status = Column(String, default="PENDING") # PENDING, COMPLETED, FAILED
    cae = Column(String, nullable=True) # For fiscal validation
    
    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(String, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Float)
    unit_price = Column(Float)
    
    sale = relationship("Sale", back_populates="items")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    payload = Column(JSON) # Detailed changes
    ip_address = Column(String)
    device_id = Column(String)

class OutboxMessage(Base):
    __tablename__ = "outbox_messages"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # WHATSAPP, EMAIL, FISCAL
    payload = Column(JSON)
    status = Column(String, default="PENDING") # PENDING, SENT, FAILED
    attempts = Column(Integer, default=0)
    last_attempt = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
