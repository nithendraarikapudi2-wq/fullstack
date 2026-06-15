import json
import base64
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="Knowledge Portal API Gateway")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_BOOT_URL = "http://localhost:8010"
NODE_JS_URL = "http://localhost:8020"

client = httpx.AsyncClient()

def decode_jwt_claims(auth_header: str):
    """
    Safely decode JWT claims without verification.
    The downstream services will perform cryptographic verification.
    """
    if not auth_header or not auth_header.startswith("Bearer "):
        return {}
    
    token = auth_header.split(" ")[1]
    parts = token.split(".")
    if len(parts) != 3:
        return {}
    
    try:
        # Pad payload base64 string
        payload_b64 = parts[1]
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        claims = json.loads(payload_bytes.decode("utf-8"))
        return {
            "X-User-Email": claims.get("sub", ""),
            "X-User-Role": claims.get("role", ""),
            "X-User-Name": claims.get("name", "")
        }
    except Exception as e:
        print(f"Error decoding JWT in Gateway: {e}")
        return {}

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def route_request(request: Request, path: str):
    # Determine the target backend URL
    if path.startswith("comments"):
        target_url = f"{NODE_JS_URL}/api/{path}"
    else:
        target_url = f"{SPRING_BOOT_URL}/api/{path}"
        
    # Prepare query parameters
    params = dict(request.query_params)
    
    # Get request body if any
    body = await request.body()
    
    # Copy headers and inject JWT claims as headers
    headers = dict(request.headers)
    
    # Remove Host header to prevent reverse-proxy hostname issues
    headers.pop("host", None)
    
    # Extract claims from Authorization header and inject them
    auth_header = headers.get("authorization")
    claims = decode_jwt_claims(auth_header)
    for key, val in claims.items():
        if val:
            headers[key] = val
            
    # Forward the request to the backend microservice
    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            params=params,
            headers=headers,
            content=body,
            timeout=10.0
        )
        
        # Build response to frontend
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except httpx.RequestError as exc:
        return Response(
            content=f"Gateway routing error: {str(exc)}",
            status_code=502
        )
