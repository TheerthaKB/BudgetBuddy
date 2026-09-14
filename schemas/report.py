from pydantic import BaseModel


class ReportCreate(BaseModel):
    user_id: int
    report_type: str
    report_period: str | None = None


class ReportResponse(ReportCreate):
    report_id: int

    class Config:
        from_attributes = True