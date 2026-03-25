
Action: file_editor create /app/backend/server.py --file-text "from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from PIL import Image, ImageDraw, ImageFont
import io
import aiofiles
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'rsencartes-neon-secret-key-2024')
JWT_ALGORITHM = \"HS256\"
JWT_EXPIRATION_HOURS = 24

# Create directories
UPLOAD_DIR = ROOT_DIR / \"uploads\"
OUTPUT_DIR = ROOT_DIR / \"output\"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title=\"RSEncartes API\", version=\"1.0.0\")

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    senha: str
    nome: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str
    email: str
    nome: str
    plano: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class ProdutoCreate(BaseModel):
    nome: str
    preco: float
    categoria: str
    validade: Optional[str] = None
    estoque: Optional[int] = 0

class ProdutoResponse(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str
    usuario_id: str
    nome: str
    preco: float
    img_url: Optional[str] = None
    categoria: str
    validade: Optional[str] = None
    estoque: int
    created_at: str

class TemplateResponse(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str
    nome: str
    descricao: str
    categoria: str
    config_json: dict
    img_preview: str
    ativo: bool

class EncarteCreate(BaseModel):
    template_id: str
    produtos_ids: List[str]
    titulo: Optional[str] = \"Ofertas da Semana\"

class EncarteResponse(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str
    usuario_id: str
    template_id: str
    titulo: str
    produtos_json: List[str]
    arquivo_url: str
    criado_em: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        \"user_id\": user_id,
        \"exp\": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = None):
    if not token:
        raise HTTPException(status_code=401, detail=\"Token não fornecido\")
    
    try:
        if token.startswith(\"Bearer \"):
            token = token[7:]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get(\"user_id\")
        user = await db.usuarios.find_one({\"id\": user_id}, {\"_id\": 0})
        if not user:
            raise HTTPException(status_code=401, detail=\"Usuário não encontrado\")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expirado\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Token inválido\")

# ==================== AUTH ROUTES ====================

@api_router.post(\"/auth/register\", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.usuarios.find_one({\"email\": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail=\"Email já cadastrado\")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        \"id\": user_id,
        \"email\": user_data.email,
        \"nome\": user_data.nome,
        \"senha_hash\": hash_password(user_data.senha),
        \"plano\": \"free\",
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    await db.usuarios.insert_one(user_doc)
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        nome=user_data.nome,
        plano=\"free\",
        created_at=user_doc[\"created_at\"]
    )
    return TokenResponse(token=token, user=user_response)

@api_router.post(\"/auth/login\", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.usuarios.find_one({\"email\": user_data.email}, {\"_id\": 0})
    if not user:
        raise HTTPException(status_code=401, detail=\"Credenciais inválidas\")
    
    if not verify_password(user_data.senha, user[\"senha_hash\"]):
        raise HTTPException(status_code=401, detail=\"Credenciais inválidas\")
    
    token = create_token(user[\"id\"])
    user_response = UserResponse(
        id=user[\"id\"],
        email=user[\"email\"],
        nome=user[\"nome\"],
        plano=user[\"plano\"],
        created_at=user[\"created_at\"]
    )
    return TokenResponse(token=token, user=user_response)

@api_router.get(\"/auth/me\", response_model=UserResponse)
async def get_me(authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    return UserResponse(
        id=user[\"id\"],
        email=user[\"email\"],
        nome=user[\"nome\"],
        plano=user[\"plano\"],
        created_at=user[\"created_at\"]
    )

# ==================== TEMPLATES ROUTES ====================

TEMPLATES_DEFAULT = [
    {
        \"id\": \"tpl-super-neon\",
        \"nome\": \"Super Neon\",
        \"descricao\": \"Template vibrante para supermercados com cores neon\",
        \"categoria\": \"Supermercado\",
        \"config_json\": {
            \"bg_color\": \"#000000\",
            \"accent_color\": \"#00ff41\",
            \"title_color\": \"#00ff41\",
            \"price_color\": \"#ffed00\",
            \"positions\": [
                {\"x\": 50, \"y\": 300, \"w\": 300, \"h\": 280},
                {\"x\": 400, \"y\": 300, \"w\": 300, \"h\": 280},
                {\"x\": 750, \"y\": 300, \"w\": 300, \"h\": 280},
                {\"x\": 50, \"y\": 650, \"w\": 300, \"h\": 280},
                {\"x\": 400, \"y\": 650, \"w\": 300, \"h\": 280},
                {\"x\": 750, \"y\": 650, \"w\": 300, \"h\": 280}
            ],
            \"fonts\": {\"title\": \"bold 72px Arial\", \"product\": \"bold 36px Arial\", \"price\": \"bold 48px Arial\"}
        },
        \"img_preview\": \"/api/static/templates/super-neon.png\",
        \"ativo\": True
    },
    {
        \"id\": \"tpl-hortifruti-verde\",
        \"nome\": \"Hortifruti Verde\",
        \"descricao\": \"Template especial para frutas e verduras\",
        \"categoria\": \"Hortifruti\",
        \"config_json\": {
            \"bg_color\": \"#001a00\",
            \"accent_color\": \"#00ff41\",
            \"title_color\": \"#00ff41\",
            \"price_color\": \"#ffed00\",
            \"positions\": [
                {\"x\": 50, \"y\": 350, \"w\": 480, \"h\": 350},
                {\"x\": 550, \"y\": 350, \"w\": 480, \"h\": 350},
                {\"x\": 50, \"y\": 750, \"w\": 480, \"h\": 350},
                {\"x\": 550, \"y\": 750, \"w\": 480, \"h\": 350}
            ],
            \"fonts\": {\"title\": \"bold 80px Arial\", \"product\": \"bold 40px Arial\", \"price\": \"bold 56px Arial\"}
        },
        \"img_preview\": \"/api/static/templates/hortifruti.png\",
        \"ativo\": True
    },
    {
        \"id\": \"tpl-farmacia-azul\",
        \"nome\": \"Farmácia Azul\",
        \"descricao\": \"Template clean para farmácias e drogarias\",
        \"categoria\": \"Farmácia\",
        \"config_json\": {
            \"bg_color\": \"#000a14\",
            \"accent_color\": \"#00d4ff\",
            \"title_color\": \"#00d4ff\",
            \"price_color\": \"#ffed00\",
            \"positions\": [
                {\"x\": 50, \"y\": 300, \"w\": 480, \"h\": 280},
                {\"x\": 550, \"y\": 300, \"w\": 480, \"h\": 280},
                {\"x\": 50, \"y\": 620, \"w\": 480, \"h\": 280},
                {\"x\": 550, \"y\": 620, \"w\": 480, \"h\": 280},
                {\"x\": 50, \"y\": 940, \"w\": 480, \"h\": 280},
                {\"x\": 550, \"y\": 940, \"w\": 480, \"h\": 280}
            ],
            \"fonts\": {\"title\": \"bold 68px Arial\", \"product\": \"bold 32px Arial\", \"price\": \"bold 44px Arial\"}
        },
        \"img_preview\": \"/api/static/templates/farmacia.png\",
        \"ativo\": True
    },
    {
        \"id\": \"tpl-atacado-vermelho\",
        \"nome\": \"Atacado Premium\",
        \"descricao\": \"Template impactante para atacadistas\",
        \"categoria\": \"Atacadista\",
        \"config_json\": {
            \"bg_color\": \"#0a0000\",
            \"accent_color\": \"#ff0040\",
            \"title_color\": \"#ff0040\",
            \"price_color\": \"#ffed00\",
            \"positions\": [
                {\"x\": 50, \"y\": 350, \"w\": 320, \"h\": 300},
                {\"x\": 390, \"y\": 350, \"w\": 320, \"h\": 300},
                {\"x\": 730, \"y\": 350, \"w\": 320, \"h\": 300},
                {\"x\": 50, \"y\": 700, \"w\": 320, \"h\": 300},
                {\"x\": 390, \"y\": 700, \"w\": 320, \"h\": 300},
                {\"x\": 730, \"y\": 700, \"w\": 320, \"h\": 300},
                {\"x\": 50, \"y\": 1050, \"w\": 320, \"h\": 300},
                {\"x\": 390, \"y\": 1050, \"w\": 320, \"h\": 300}
            ],
            \"fonts\": {\"title\": \"bold 76px Arial\", \"product\": \"bold 28px Arial\", \"price\": \"bold 40px Arial\"}
        },
        \"img_preview\": \"/api/static/templates/atacado.png\",
        \"ativo\": True
    },
    {
        \"id\": \"tpl-geral-multicolor\",
        \"nome\": \"Multicolor Geral\",
        \"descricao\": \"Template versátil para qualquer negócio\",
        \"categoria\": \"Geral\",
        \"config_json\": {
            \"bg_color\": \"#050505\",
            \"accent_color\": \"#00ff41\",
            \"secondary_color\": \"#00d4ff\",
            \"title_color\": \"#ffffff\",
            \"price_color\": \"#ffed00\",
            \"positions\": [
                {\"x\": 50, \"y\": 320, \"w\": 480, \"h\": 300},
                {\"x\": 550, \"y\": 320, \"w\": 480, \"h\": 300},
                {\"x\": 50, \"y\": 660, \"w\": 480, \"h\": 300},
                {\"x\": 550, \"y\": 660, \"w\": 480, \"h\": 300},
                {\"x\": 50, \"y\": 1000, \"w\": 480, \"h\": 300},
                {\"x\": 550, \"y\": 1000, \"w\": 480, \"h\": 300}
            ],
            \"fonts\": {\"title\": \"bold 72px Arial\", \"product\": \"bold 34px Arial\", \"price\": \"bold 48px Arial\"}
        },
        \"img_preview\": \"/api/static/templates/geral.png\",
        \"ativo\": True
    }
]

@api_router.get(\"/templates\", response_model=List[TemplateResponse])
async def get_templates():
    templates = await db.templates.find({\"ativo\": True}, {\"_id\": 0}).to_list(100)
    if not templates:
        # Insert default templates if none exist
        for tpl in TEMPLATES_DEFAULT:
            await db.templates.update_one({\"id\": tpl[\"id\"]}, {\"$set\": tpl}, upsert=True)
        templates = TEMPLATES_DEFAULT
    return templates

@api_router.get(\"/templates/{template_id}\", response_model=TemplateResponse)
async def get_template(template_id: str):
    template = await db.templates.find_one({\"id\": template_id}, {\"_id\": 0})
    if not template:
        # Check in defaults
        for tpl in TEMPLATES_DEFAULT:
            if tpl[\"id\"] == template_id:
                return tpl
        raise HTTPException(status_code=404, detail=\"Template não encontrado\")
    return template

# ==================== PRODUTOS ROUTES ====================

@api_router.post(\"/produtos\", response_model=ProdutoResponse)
async def create_produto(
    nome: str = Form(...),
    preco: float = Form(...),
    categoria: str = Form(...),
    validade: Optional[str] = Form(None),
    estoque: Optional[int] = Form(0),
    imagem: Optional[UploadFile] = File(None),
    authorization: str = None
):
    from fastapi import Header
    user = await get_current_user(authorization)
    
    produto_id = str(uuid.uuid4())
    img_url = None
    
    if imagem:
        ext = imagem.filename.split(\".\")[-1] if imagem.filename else \"png\"
        filename = f\"{produto_id}.{ext}\"
        filepath = UPLOAD_DIR / filename
        async with aiofiles.open(filepath, 'wb') as f:
            content = await imagem.read()
            await f.write(content)
        img_url = f\"/api/uploads/{filename}\"
    
    produto_doc = {
        \"id\": produto_id,
        \"usuario_id\": user[\"id\"],
        \"nome\": nome,
        \"preco\": preco,
        \"img_url\": img_url,
        \"categoria\": categoria,
        \"validade\": validade,
        \"estoque\": estoque,
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    await db.produtos.insert_one(produto_doc)
    
    return ProdutoResponse(**produto_doc)

@api_router.get(\"/produtos\", response_model=List[ProdutoResponse])
async def get_produtos(authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    produtos = await db.produtos.find({\"usuario_id\": user[\"id\"]}, {\"_id\": 0}).to_list(1000)
    return produtos

@api_router.get(\"/produtos/{produto_id}\", response_model=ProdutoResponse)
async def get_produto(produto_id: str, authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    produto = await db.produtos.find_one({\"id\": produto_id, \"usuario_id\": user[\"id\"]}, {\"_id\": 0})
    if not produto:
        raise HTTPException(status_code=404, detail=\"Produto não encontrado\")
    return produto

@api_router.put(\"/produtos/{produto_id}\", response_model=ProdutoResponse)
async def update_produto(
    produto_id: str,
    nome: str = Form(...),
    preco: float = Form(...),
    categoria: str = Form(...),
    validade: Optional[str] = Form(None),
    estoque: Optional[int] = Form(0),
    imagem: Optional[UploadFile] = File(None),
    authorization: str = None
):
    from fastapi import Header
    user = await get_current_user(authorization)
    
    produto = await db.produtos.find_one({\"id\": produto_id, \"usuario_id\": user[\"id\"]}, {\"_id\": 0})
    if not produto:
        raise HTTPException(status_code=404, detail=\"Produto não encontrado\")
    
    update_data = {
        \"nome\": nome,
        \"preco\": preco,
        \"categoria\": categoria,
        \"validade\": validade,
        \"estoque\": estoque
    }
    
    if imagem:
        ext = imagem.filename.split(\".\")[-1] if imagem.filename else \"png\"
        filename = f\"{produto_id}.{ext}\"
        filepath = UPLOAD_DIR / filename
        async with aiofiles.open(filepath, 'wb') as f:
            content = await imagem.read()
            await f.write(content)
        update_data[\"img_url\"] = f\"/api/uploads/{filename}\"
    
    await db.produtos.update_one({\"id\": produto_id}, {\"$set\": update_data})
    updated = await db.produtos.find_one({\"id\": produto_id}, {\"_id\": 0})
    return updated

@api_router.delete(\"/produtos/{produto_id}\")
async def delete_produto(produto_id: str, authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    
    result = await db.produtos.delete_one({\"id\": produto_id, \"usuario_id\": user[\"id\"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Produto não encontrado\")
    return {\"message\": \"Produto deletado com sucesso\"}

# ==================== ENCARTE GENERATOR ====================

def hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

async def generate_encarte_image(template: dict, produtos: list, titulo: str) -> str:
    \"\"\"Generate encarte image using Pillow\"\"\"
    config = template[\"config_json\"]
    
    # Create image (1080x1920 for signage)
    width, height = 1080, 1920
    img = Image.new('RGB', (width, height), color=hex_to_rgb(config.get(\"bg_color\", \"#000000\")))
    draw = ImageDraw.Draw(img)
    
    # Draw grid pattern
    accent_rgb = hex_to_rgb(config.get(\"accent_color\", \"#00ff41\"))
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=(*accent_rgb, 20), width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=(*accent_rgb, 20), width=1)
    
    # Draw title
    title_color = hex_to_rgb(config.get(\"title_color\", \"#00ff41\"))
    try:
        title_font = ImageFont.truetype(\"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf\", 72)
        product_font = ImageFont.truetype(\"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf\", 32)
        price_font = ImageFont.truetype(\"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf\", 48)
    except:
        title_font = ImageFont.load_default()
        product_font = ImageFont.load_default()
        price_font = ImageFont.load_default()
    
    # Title with glow effect
    draw.text((width//2, 100), titulo.upper(), fill=title_color, font=title_font, anchor=\"mm\")
    
    # Draw subtitle
    draw.text((width//2, 180), \"OFERTAS IMPERDÍVEIS\", fill=(255, 255, 255), font=product_font, anchor=\"mm\")
    
    # Draw products
    positions = config.get(\"positions\", [])
    price_color = hex_to_rgb(config.get(\"price_color\", \"#ffed00\"))
    
    for i, produto in enumerate(produtos):
        if i >= len(positions):
            break
        
        pos = positions[i]
        x, y, w, h = pos[\"x\"], pos[\"y\"], pos[\"w\"], pos[\"h\"]
        
        # Product card background
        draw.rectangle([x, y, x+w, y+h], fill=(10, 10, 10), outline=accent_rgb, width=2)
        
        # Product image placeholder or actual image
        img_area = (x+10, y+10, x+w-10, y+h-80)
        if produto.get(\"img_url\"):
            try:
                img_path = ROOT_DIR / produto[\"img_url\"].replace(\"/api/\", \"\")
                if img_path.exists():
                    prod_img = Image.open(img_path)
                    prod_img = prod_img.resize((w-20, h-100))
                    img.paste(prod_img, (x+10, y+10))
            except Exception as e:
                logging.error(f\"Error loading product image: {e}\")
                draw.rectangle(img_area, fill=(30, 30, 30))
        else:
            draw.rectangle(img_area, fill=(30, 30, 30))
        
        # Product name
        nome_truncado = produto[\"nome\"][:20] + \"...\" if len(produto[\"nome\"]) > 20 else produto[\"nome\"]
        draw.text((x + w//2, y + h - 60), nome_truncado, fill=(255, 255, 255), font=product_font, anchor=\"mm\")
        
        # Product price
        preco_str = f\"R$ {produto['preco']:.2f}\".replace(\".\", \",\")
        draw.text((x + w//2, y + h - 25), preco_str, fill=price_color, font=price_font, anchor=\"mm\")
    
    # Footer
    draw.text((width//2, height - 80), \"RSEncartes Neon\", fill=accent_rgb, font=product_font, anchor=\"mm\")
    draw.text((width//2, height - 40), \"www.studiorsdesign.com.br\", fill=(150, 150, 150), font=product_font, anchor=\"mm\")
    
    # Save image
    filename = f\"encarte-{uuid.uuid4().hex[:8]}.png\"
    filepath = OUTPUT_DIR / filename
    img.save(filepath, \"PNG\")
    
    return f\"/api/output/{filename}\"

@api_router.post(\"/encartes/gerar\", response_model=EncarteResponse)
async def gerar_encarte(encarte_data: EncarteCreate, authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    
    # Get template
    template = await db.templates.find_one({\"id\": encarte_data.template_id}, {\"_id\": 0})
    if not template:
        for tpl in TEMPLATES_DEFAULT:
            if tpl[\"id\"] == encarte_data.template_id:
                template = tpl
                break
    
    if not template:
        raise HTTPException(status_code=404, detail=\"Template não encontrado\")
    
    # Get products
    produtos = await db.produtos.find({
        \"id\": {\"$in\": encarte_data.produtos_ids},
        \"usuario_id\": user[\"id\"]
    }, {\"_id\": 0}).to_list(100)
    
    if not produtos:
        raise HTTPException(status_code=400, detail=\"Nenhum produto válido selecionado\")
    
    # Generate image
    arquivo_url = await generate_encarte_image(template, produtos, encarte_data.titulo or \"Ofertas da Semana\")
    
    # Save encarte record
    encarte_id = str(uuid.uuid4())
    encarte_doc = {
        \"id\": encarte_id,
        \"usuario_id\": user[\"id\"],
        \"template_id\": encarte_data.template_id,
        \"titulo\": encarte_data.titulo or \"Ofertas da Semana\",
        \"produtos_json\": encarte_data.produtos_ids,
        \"arquivo_url\": arquivo_url,
        \"criado_em\": datetime.now(timezone.utc).isoformat()
    }
    await db.encartes.insert_one(encarte_doc)
    
    return EncarteResponse(**encarte_doc)

@api_router.get(\"/encartes\", response_model=List[EncarteResponse])
async def get_encartes(authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    encartes = await db.encartes.find({\"usuario_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"criado_em\", -1).to_list(100)
    return encartes

@api_router.get(\"/encartes/{encarte_id}\", response_model=EncarteResponse)
async def get_encarte(encarte_id: str, authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    encarte = await db.encartes.find_one({\"id\": encarte_id, \"usuario_id\": user[\"id\"]}, {\"_id\": 0})
    if not encarte:
        raise HTTPException(status_code=404, detail=\"Encarte não encontrado\")
    return encarte

@api_router.delete(\"/encartes/{encarte_id}\")
async def delete_encarte(encarte_id: str, authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    result = await db.encartes.delete_one({\"id\": encarte_id, \"usuario_id\": user[\"id\"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Encarte não encontrado\")
    return {\"message\": \"Encarte deletado com sucesso\"}

# ==================== STATS ROUTE ====================

@api_router.get(\"/stats\")
async def get_stats(authorization: str = None):
    from fastapi import Header
    user = await get_current_user(authorization)
    
    produtos_count = await db.produtos.count_documents({\"usuario_id\": user[\"id\"]})
    encartes_count = await db.encartes.count_documents({\"usuario_id\": user[\"id\"]})
    
    return {
        \"produtos\": produtos_count,
        \"encartes\": encartes_count,
        \"plano\": user[\"plano\"]
    }

# ==================== STATIC FILES ====================

@api_router.get(\"/\")
async def root():
    return {\"message\": \"RSEncartes API v1.0 - Cyberpunk Neon Edition\"}

# Include the router in the main app
app.include_router(api_router)

# Mount static directories
app.mount(\"/api/uploads\", StaticFiles(directory=str(UPLOAD_DIR)), name=\"uploads\")
app.mount(\"/api/output\", StaticFiles(directory=str(OUTPUT_DIR)), name=\"output\")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"startup\")
async def startup_event():
    # Initialize default templates
    for tpl in TEMPLATES_DEFAULT:
        await db.templates.update_one({\"id\": tpl[\"id\"]}, {\"$set\": tpl}, upsert=True)
    logger.info(\"RSEncartes API started - Templates initialized\")

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
Observation: Overwrite successful: /app/backend/server.py
