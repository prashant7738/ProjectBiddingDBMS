# this is created to create a mock user

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

class MockUser:
    def __init__(self, user_id):
        self.id = user_id
        self.is_authenticated = True

class SQLAlchemyJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
            # We return a simple object with the ID from the token
            # This avoids searching the Django auth_user table
            return MockUser(user_id)
        except KeyError:
            raise exceptions.AuthenticationFailed('Token contained no user identifier')