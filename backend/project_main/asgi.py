"""
ASGI config for project_main project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import OriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')

django_asgi_app = get_asgi_application()

# Import after Django setup to avoid ImproperlyConfigured error
from api import routing as api_routing
from django.conf import settings

# Note: deliberately NOT AllowedHostsOriginValidator — that checks the
# handshake's Origin header against ALLOWED_HOSTS, which lists this
# backend's own hostname(s), not the separately-hosted frontend origin.
# Using it here would reject every legitimate websocket connection from the
# frontend. OriginValidator checks against the same trusted origin list CORS
# already uses, which is the correct comparison for a split frontend/backend
# deployment.
application = ProtocolTypeRouter({
	'http': django_asgi_app,
	'websocket': OriginValidator(
		AuthMiddlewareStack(
			URLRouter(api_routing.websocket_urlpatterns)
		),
		settings.CORS_ALLOWED_ORIGINS,
	),
})
