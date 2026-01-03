# In this file all authentication are included

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core_db.user_ops import authenticate_user, register_user


class LoginView(APIView):
    def post(self ,request):
        username = request.data.get("name")
        password = request.data.get("password")
        
        # verify the password
        user = authenticate_user(username, password)
        
        if user:
            # if valid generate jwt token
            
           # Manually create the token 
            refresh = RefreshToken()
            
            # Attach your SQLAlchemy data to the token payload
            refresh['user_id'] = user['id']
            refresh['name'] = user['name']
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user' : {'id':user['id'] , 'name':user['name']}
            })
            
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