from pydantic import BaseModel
from typing import Dict

class DashboardStats(BaseModel):
    total: int
    by_status: Dict[str, int]
    by_category: Dict[str, int]
    overdue: int