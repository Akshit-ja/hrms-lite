from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date

from database import get_db
from models import Employee, Attendance, AttendanceStatus
from schemas import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.get("/", response_model=List[AttendanceResponse])
def get_all_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return records


@router.get("/employee/{employee_id}", response_model=List[AttendanceResponse])
def get_employee_attendance(
    employee_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return records


@router.get("/employee/{employee_id}/summary")
def get_employee_attendance_summary(employee_id: str, db: Session = Depends(get_db)):
    """Get total present/absent days for an employee"""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    total_present = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id, Attendance.status == AttendanceStatus.PRESENT)
        .count()
    )
    total_absent = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id, Attendance.status == AttendanceStatus.ABSENT)
        .count()
    )

    return {
        "employee_id": employee_id,
        "employee_name": employee.full_name,
        "total_present": total_present,
        "total_absent": total_absent,
        "total_records": total_present + total_absent,
    }


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(record: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_id == record.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{record.employee_id}' not found",
        )

    # Check for duplicate entry
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == record.employee_id,
            Attendance.date == record.date,
        )
        .first()
    )

    if existing:
        # Update existing record
        existing.status = AttendanceStatus(record.status)
        db.commit()
        db.refresh(existing)
        return existing

    db_attendance = Attendance(
        employee_id=record.employee_id,
        date=record.date,
        status=AttendanceStatus(record.status),
    )

    try:
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance record already exists for this employee on this date",
        )

    return db_attendance
