# In this file all authentication are included
import jwt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core_db.user_ops import authenticate_user, register_user


class LoginView(APIView):
    def get(self, request):
        # 1. Grab the cookie
        token = request.COOKIES.get('access_token')
        if not token:
            return Response({"error": "No token"}, status=401)
        
        try:
            # 2. Decode it manually since you use SQLAlchemy/Custom logic
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return Response({
                "user": {
                    "id": payload.get("user_id"),
                    "email": payload.get("email"),
                    "name": payload.get("name")
                }
            })
        except Exception:
            return Response({"error": "Invalid session"}, status=401)
    def post(self ,request):
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        # verify the password
        user = authenticate_user(email, password)
        
        if user:
            # if valid generate jwt token
            
           # Manually create the token 
            refresh = RefreshToken()
            
            # Attach your SQLAlchemy data to the token payload
            refresh['user_id'] = user['id']
            refresh['email'] = user['email']
            
            response = Response({
                'user' : {'name':user['name'],'id':user['id'] , 'email':user['email'],},
            })
            
            # Set tokens in cookies (HttpOnly for security)
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                max_age=360000,  # 1 hour
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/'
            )
            
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                max_age=864000 * 7,  # 7 days
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/'
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
            # Handle duplicate username/email or other database errors
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )
        
        # Delete tokens from cookies
        response.delete_cookie('access_token', httponly=True, samesite='Lax')
        response.delete_cookie('refresh_token', httponly=True, samesite='Lax')
        
        return response