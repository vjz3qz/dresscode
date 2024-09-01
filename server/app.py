import secure
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.v1.views import router as v1_router
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# from backend.api.v2.views import router as v2_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",  # Add your origins here
    "http://127.0.0.1",
]

csp = secure.ContentSecurityPolicy().default_src("'self'").frame_ancestors("'none'")
hsts = secure.StrictTransportSecurity().max_age(31536000).include_subdomains()
referrer = secure.ReferrerPolicy().no_referrer()
cache_value = secure.CacheControl().no_cache().no_store().max_age(0).must_revalidate()
x_frame_options = secure.XFrameOptions().deny()

secure_headers = secure.Secure(
    csp=csp,
    hsts=hsts,
    referrer=referrer,
    cache=cache_value,
    xfo=x_frame_options,
)


@app.middleware("http")
async def set_secure_headers(request, call_next):
    response = await call_next(request)
    secure_headers.framework.fastapi(response)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=86400,
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    message = str(exc.detail)
    return JSONResponse({"message": message}, status_code=exc.status_code)



@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        body = await request.body()
        if request.headers.get('content-type') == 'application/json':
            print(f"Request body: {body.decode('utf-8')}")
        else:
            print("Request body contains binary data, logging is skipped.")
    except UnicodeDecodeError as e:
        logging.error(f"UnicodeDecodeError: {e}")
        print("Failed to decode request body, it may contain binary data.")

    response = await call_next(request)
    return response
    
# Include the versioned routers
app.include_router(v1_router, prefix="/v1")
# Include the versioned routers
# app.include_router(v2_router, prefix="/v2")

if __name__ == "__main__":
    import uvicorn

    # uvicorn.run(app)
    uvicorn.run(app, host="0.0.0.0", port=8000)
