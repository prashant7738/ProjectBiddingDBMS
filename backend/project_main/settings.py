from pathlib import Path
from datetime import timedelta

import os
import dj_database_url
import cloudinary



# FOR DOTENV
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-key-change-in-production")
CRON_SECRET = os.getenv("CRON_SECRET", "")






# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: don't run with debug turned on in production!
# Debug converted to boolen by comaparing with env variable (cause it is string)
DEBUG = os.getenv("DEBUG", "False") == "True"


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'api',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project_main.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI used by tranditional sychronous servers like (Gunicorn) but ASGI is used by modern async-capable server like (Daphne, Uvicorn) needed for websocket/channel
WSGI_APPLICATION = 'project_main.wsgi.application'
ASGI_APPLICATION = 'project_main.asgi.application'




# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# This only matter for production only 
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# For image upload -- cloudinary setup
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET')
}
CLOUDINARY_UPLOAD_FOLDER = os.getenv('CLOUDINARY_UPLOAD_FOLDER', 'auctions')

cloudinary.config(
    cloud_name=CLOUDINARY_STORAGE.get('CLOUD_NAME'),
    api_key=CLOUDINARY_STORAGE.get('API_KEY'),
    api_secret=CLOUDINARY_STORAGE.get('API_SECRET')
)

# For testing using default storage but for hosting we are using cloudinary

if DEBUG:
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"
else:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"


# Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}




REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=20),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=10),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
IS_PRODUCTION = os.getenv("IS_PRODUCTION", "False") == "True"

# 1. Allow cookies to be sent in cross-site requests
# For local dev over http, use Lax to avoid Secure+None rejection.
SESSION_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'
CSRF_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'

# 2. Cookies MUST be marked as Secure to allow 'SameSite=None'
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# 3. Explicitly allow credentials in CORS
CORS_ALLOW_CREDENTIALS = True

# 4. Use the specific frontend URL (Do NOT use '*')
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

# CORS Allowed Origins - only include production URLs
CORS_ALLOWED_ORIGINS = [FRONTEND_URL]

# Add localhost only in development mode
if DEBUG:
    CORS_ALLOWED_ORIGINS.append("http://localhost:5173")

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = [FRONTEND_URL, BACKEND_URL]

if DEBUG:
    CSRF_TRUSTED_ORIGINS.append("http://localhost:5173")

CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True  # Prevents JS from reading the cookie

# Admin allowlist for admin-only API access
ADMIN_EMAILS = [e.strip() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()]
ADMIN_USER_IDS = [int(uid.strip()) for uid in os.getenv("ADMIN_USER_IDS", "").split(",") if uid.strip()]




# PRODUCTION READY:
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]

# ALL IN ONE CODE FOR CONNECTING TO DATABASE

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL"
        )
    )
}


MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


# Security settings for production (only applied when DEBUG=False)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'