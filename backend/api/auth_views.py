# In this file all authentication are included

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from core_db.user_ops import authenticate_user, register_user


@method_decorator(csrf_exempt, name='dispatch')
class TokenRefreshView(APIView):
    """
    Custom token refresh view that reads refresh token from cookies
    and returns new access token in cookies
    """
    def post(self, request):
        try:
            refresh_token_str = request.COOKIES.get('refresh_token')
            
            if not refresh_token_str:
                return Response(
                    {"error": "Refresh token not found in cookies"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate and get new tokens
            refresh = RefreshToken(refresh_token_str)
            
            response = Response({
                "message": "Token refreshed successfully"
            }, status=status.HTTP_200_OK)
            
            # Set new access token in cookie
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                max_age=3600,  # 1 hour
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                domain=None
            )
            
            # Optionally rotate refresh token
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                max_age=604800,  # 7 days
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                domain=None
            )
            
            return response
            
        except Exception as e:
            return Response(
                {"error": f"Invalid refresh token: {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LoginView(APIView):
    def post(self ,request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        # verify the password
        user = authenticate_user(email, password)
        
        if user:
            # if valid generate jwt token
            
           # Manually create the token 
            refresh = RefreshToken()
            
            # Attach your SQLAlchemy data to the token payload
            refresh['user_id'] = user['id']
            refresh['email'] = user['email']
            refresh['name'] = user['name']
            
            response = Response({
                'user' : {'id':user['id'] , 'email':user['email'], 'name': user['name']}
            })
            
            # Token lifetimes
            access_token_lifetime = 3600  # 1 hour in seconds
            refresh_token_lifetime = 604800  # 7 days in seconds
            
            # Set tokens in cookies (HttpOnly for security)
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                max_age=access_token_lifetime,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/',
                domain=None  # Allows same-site cookies, will use request.get_host()
            )
            
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                max_age=refresh_token_lifetime,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/',
                domain=None
            )
            
            return response
            
        return Response({"error":"Invalid Credentials"},status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    def post(self, request):
        name = request.data.get("name")
        email = request.data.get("email")
        password = request.data.get("password")
        
        # Validate required fields
        if not name or not email or not password:
            return Response(
                {"error": "name, email, and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Register the user with initial balance of 0.0
            user_id = register_user(name, email, password, initial_balance=0.0)
            
            return Response({
                "message": "User registered successfully",
                "user_id": user_id,
                "name": name,
                "email": email
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            error_msg = str(e)
            # Check for duplicate email/username errors
            if "unique constraint" in error_msg.lower() or "duplicate" in error_msg.lower():
                if "email" in error_msg.lower():
                    return Response(
                        {"error": "This email is already registered"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif "name" in error_msg.lower():
                    return Response(
                        {"error": "This username is already taken"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Generic error for other issues
            return Response(
                {"error": "Registration failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )
        
        # Delete tokens from cookies (MUST match set_cookie parameters)
        response.delete_cookie(
            'access_token',
            path='/',
            samesite='Lax',
            domain=None
        )
        response.delete_cookie(
            'refresh_token',
            path='/',
            samesite='Lax',
            domain=None
        )
        
        return response