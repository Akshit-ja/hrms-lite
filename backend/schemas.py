from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional
import re


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Employee ID is required")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Full name is required")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Email is required")
        v = v.strip().lower()
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Department is required")
        return v.strip()


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Employee ID is required")
        return v.strip()

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("Present", "Absent"):
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str

    model_config = {"from_attributes": True}


class AttendanceWithEmployee(AttendanceResponse):
    employee_name: Optional[str] = None


class DashboardSummary(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    department_count: int
