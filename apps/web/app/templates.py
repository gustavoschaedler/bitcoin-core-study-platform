"""Single Jinja2Templates instance, mounted at /app/app/templates."""

from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="/app/app/templates")
