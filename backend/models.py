from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stories = relationship("Story", back_populates="author")
    editorships = relationship("Community", back_populates="editor")
    subscriptions = relationship("Subscription", back_populates="user")


class Community(Base):
    __tablename__ = "communities"

    id = Column(String, primary_key=True)  # slug, e.g. "flash-fiction"
    name = Column(String, nullable=False)
    tagline = Column(String)
    description = Column(Text)
    editor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    editor = relationship("User", back_populates="editorships")
    stories = relationship("Story", back_populates="community")
    subscriptions = relationship("Subscription", back_populates="community")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    community_id = Column(String, ForeignKey("communities.id"), nullable=False)
    tier = Column(String, default="free")  # free | paid
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "community_id"),)

    user = relationship("User", back_populates="subscriptions")
    community = relationship("Community", back_populates="subscriptions")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    excerpt = Column(Text)
    body = Column(Text)
    word_count = Column(Integer)
    community_id = Column(String, ForeignKey("communities.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending | approved | rejected
    featured = Column(Boolean, default=False)
    votes = Column(Integer, default=0)
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    community = relationship("Community", back_populates="stories")
    author = relationship("User", back_populates="stories")
