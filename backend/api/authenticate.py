from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
import json

class MockUser:
    def __init__(self, id, email=None, name=None):
        self.id = id
        self.email = email
        self.name = name
        self.is_authenticated = True  # critical for IsAuthenticated

class SQLAlchemyJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Read JWT from HttpOnly cookie
        raw_token = request.COOKIES.get('access_token')
        
        if raw_token is None:
            return None  # No auth, let other auth classes try or return 401 with IsAuthenticated

        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid or expired access token') from e

        user = self.get_user(validated_token)
        return (user, validated_token)

    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
            email = validated_token.get('email')
            name = validated_token.get('name')
            return MockUser(user_id, email=email, name=name)
        except KeyError:
            raise exceptions.AuthenticationFailed('Token contained no user identifier')


class CookieRefreshTokenAuthentication(JWTAuthentication):
    """
    Custom authentication for token refresh endpoint to read refresh token from cookies
    """
    def authenticate(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token is None:
            return None
        
        try:
            # For refresh token, we don't validate the same way as access token
            # The TokenRefreshView will handle the validation
            # Just return a dummy user for DRF to proceed to the view
            return (MockUser(0, email='refresh'), {'refresh': refresh_token})
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid refresh token') from e