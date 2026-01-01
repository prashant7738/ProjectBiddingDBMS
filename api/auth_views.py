# In this file all authentication are included

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core_db.user_ops import authenticate_user


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