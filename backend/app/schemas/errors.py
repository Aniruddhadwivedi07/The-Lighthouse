"""Stable JSON envelope for API errors."""

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    location: str
    message: str
    error_type: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
