from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .db import init_db
from .logger import log_info, log_error
from .routers import ai, forge, progress, projects, content, auth, notifications, settings, health


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="AlgoQuest API", version="0.3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def payload_size_limit_middleware(request: Request, call_next):
    # Enforce 1MB limit for POST/PUT/PATCH
    if request.method in ("POST", "PUT", "PATCH"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1 * 1024 * 1024:
            log_error(
                "Payload too large",
                path=request.url.path,
                size=content_length,
                limit="1MB"
            )
            return Response(content="Payload too large", status_code=413)
    
    return await call_next(request)


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    import time
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time = (time.perf_counter() - start_time) * 1000
    log_info(
        f"{request.method} {request.url.path}",
        status=response.status_code,
        latency=f"{process_time:.2f}ms"
    )
    
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422, content={"detail": "Validation failed", "errors": exc.errors()}
    )


app.include_router(health.router)
app.include_router(content.router)
app.include_router(progress.router)
app.include_router(settings.router)
app.include_router(projects.router)
app.include_router(forge.router)
app.include_router(ai.router)
app.include_router(auth.router)
app.include_router(notifications.router)
