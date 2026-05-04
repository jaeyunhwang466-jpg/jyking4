from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime
import uuid

app = FastAPI(title="KEEP Fitting Room Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 📋 상태 및 데이터 정의 ---

class FittingStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    COMPLETED = "completed"

class FittingRoomStatus(str, Enum):
    EMPTY = "EMPTY"
    IN_USE = "IN_USE"

class FittingRequest(BaseModel):
    request_id: str
    product_id: str
    product_name: str
    color: str
    size: str
    fitting_room_id: Optional[str] = None
    status: FittingStatus
    request_time: str
    session_id: str

class CreateRequestItem(BaseModel):
    product_id: str
    product_name: str
    color: str
    size: str
    fitting_room_id: Optional[str] = None
    status: FittingStatus = FittingStatus.PENDING
    session_id: str

class UpdateStatusBody(BaseModel):
    status: FittingStatus

# --- 🗄️ DB Mock Layer ---

fitting_rooms = {
    "1": {"id": "1", "status": FittingRoomStatus.EMPTY, "current_request_id": None},
    "2": {"id": "2", "status": FittingRoomStatus.EMPTY, "current_request_id": None},
    "3": {"id": "3", "status": FittingRoomStatus.EMPTY, "current_request_id": None},
}

requests_db: List[FittingRequest] = []

def db_get_available_room():
    for room_id in ["1", "2", "3"]: # 우선순위대로 확인
        if fitting_rooms[room_id]["status"] == FittingRoomStatus.EMPTY:
            return fitting_rooms[room_id]
    return None

def db_update_room(room_id: str, status: FittingRoomStatus, request_id: Optional[str]):
    if room_id in fitting_rooms:
        fitting_rooms[room_id]["status"] = status
        fitting_rooms[room_id]["current_request_id"] = request_id

# --- 📡 API Endpoints ---

@app.post("/api/requests", response_model=FittingRequest)
def create_request(item: CreateRequestItem):
    """[수동 배정] 고객 요청 시 배정하지 않고 대기(pending) 상태로 생성"""
    new_request = FittingRequest(
        request_id=f"req-{uuid.uuid4().hex[:8]}",
        product_id=item.product_id,
        product_name=item.product_name,
        color=item.color,
        size=item.size,
        fitting_room_id=None,
        status=FittingStatus.PENDING,
        request_time=datetime.now().isoformat(),
        session_id=item.session_id
    )
    requests_db.append(new_request)
    print(f"🔔 새로운 피팅 요청: {item.product_name} ({item.size}) - 세션: {item.session_id}")
    return new_request

@app.get("/api/requests")
def get_requests():
    return {"requests": requests_db}

@app.patch("/api/requests/{request_id}", response_model=FittingRequest)
def update_request_status(request_id: str, body: UpdateStatusBody):
    """[수동 배정] 직원이 수락(assigned) 버튼을 누를 때 빈 방 확인 후 배정"""
    request = next((r for r in requests_db if r.request_id == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")

    old_status = request.status
    new_status = body.status
    
    # 1. 수락(assigned) 처리 시 로직
    if new_status == FittingStatus.ASSIGNED and old_status == FittingStatus.PENDING:
        available_room = db_get_available_room()
        if not available_room:
            raise HTTPException(status_code=400, detail="현재 비어있는 피팅룸이 없습니다.")
        
        # 방 배정 및 상태 변경
        request.fitting_room_id = available_room["id"]
        request.status = FittingStatus.ASSIGNED
        db_update_room(available_room["id"], FittingRoomStatus.IN_USE, request_id)
        print(f"수동 배정 완료: 요청 {request_id} -> 방 {available_room['id']}")
    
    # 2. 완료(completed) 처리 시 로직
    elif new_status == FittingStatus.COMPLETED and old_status == FittingStatus.ASSIGNED:
        if request.fitting_room_id:
            db_update_room(request.fitting_room_id, FittingRoomStatus.EMPTY, None)
            print(f"방 반납 완료: 방 {request.fitting_room_id} 비워짐")
            request.fitting_room_id = None
        request.status = FittingStatus.COMPLETED
    
    # 3. 기타 상태 변경
    else:
        request.status = new_status
            
    return request

@app.get("/api/fitting-rooms")
def get_fitting_rooms():
    return {"rooms": list(fitting_rooms.values())}

@app.get("/admin/stats")
def get_admin_stats():
    return {
        "total": len(requests_db),
        "pending": len([r for r in requests_db if r.status == FittingStatus.PENDING]),
        "assigned": len([r for r in requests_db if r.status == FittingStatus.ASSIGNED]),
        "completed": len([r for r in requests_db if r.status == FittingStatus.COMPLETED]),
    }