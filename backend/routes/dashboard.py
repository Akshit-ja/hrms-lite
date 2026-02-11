from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from database import get_db
from models import Employee, Attendance, AttendanceStatus

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()

    total_employees = db.query(Employee).count()

    departments = db.query(func.count(func.distinct(Employee.department))).scalar()

    total_present_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == AttendanceStatus.PRESENT)
        .count()
    )

    total_absent_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == AttendanceStatus.ABSENT)
        .count()
    )

    # Recent attendance records
    recent_attendance = (
        db.query(Attendance, Employee.full_name)
        .join(Employee, Attendance.employee_id == Employee.employee_id)
        .order_by(Attendance.date.desc())
        .limit(10)
        .all()
    )

    recent_records = [
        {
            "id": att.id,
            "employee_id": att.employee_id,
            "employee_name": name,
            "date": att.date.isoformat(),
            "status": att.status.value,
        }
        for att, name in recent_attendance
    ]

    # Department-wise employee count
    dept_breakdown = (
        db.query(Employee.department, func.count(Employee.id))
        .group_by(Employee.department)
        .all()
    )

    department_stats = [
        {"department": dept, "count": count} for dept, count in dept_breakdown
    ]

    return {
        "total_employees": total_employees,
        "department_count": departments or 0,
        "total_present_today": total_present_today,
        "total_absent_today": total_absent_today,
        "unmarked_today": total_employees - total_present_today - total_absent_today,
        "recent_attendance": recent_records,
        "department_stats": department_stats,
    }
