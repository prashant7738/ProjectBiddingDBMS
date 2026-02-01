from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions , get_auctions_by_seller, create_auction, register_user_for_auction, is_user_registered_for_auction, get_auction_registrations, get_auction_by_id
from .serializers import AuctionSerializer ,BidSerializer
from rest_framework import status
from core_db.bid_ops import place_bid, get_user_bidding_history
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from pathlib import Path

# for pagination
from .paginations import StandardResultsSetPagination


# for authentication 
from .authenticate import SQLAlchemyJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


# To create Auction
class CreateAuction(APIView):

    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seller_id = request.data.get('seller_id')
        title = request.data.get('title')
        description = request.data.get('description')
        category_id = request.data.get('category_id')
        starting_price = request.data.get('starting_price')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        image = request.FILES.get('image')  # Get uploaded image

        if not all([seller_id , title , description, category_id, starting_price , end_time]):
            return Response(
                {"error": "Missing information"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Handle image upload
        image_url = None
        if image:
            # Save image to media/auctions/ directory
            # Get file extension
            ext = Path(image.name).suffix
            # Use timestamp to create unique filename without random suffix
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_name = f"auctions/auction_{seller_id}_{timestamp}{ext}"
            
            # Delete file if it already exists
            if default_storage.exists(file_name):
                default_storage.delete(file_name)
            
            image_path = default_storage.save(file_name, ContentFile(image.read()))
            # Store full URL in database for frontend access
            image_url = f"/media/{image_path}"

        result = create_auction(seller_id , title , description, category_id, starting_price , end_time, start_time, image_url)

        return Response({"message": result, "image_url": image_url} , status=status.HTTP_201_CREATED)




# To see all the auctions
class AuctionListView(APIView):
    def get(self, request):
        
        paginator = StandardResultsSetPagination()
        # Call from SQLAlchemy
        data = get_active_auctions()
        
        
        result_page = paginator.paginate_queryset(data , request)
        serializer = AuctionSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)


# To see a specific auction by ID
class AuctionDetailView(APIView):
    def get(self, request, auction_id):
        auction = get_auction_by_id(auction_id)
        
        if not auction:
            return Response(
                {"error": "Auction not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AuctionSerializer(auction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

# To post the bid
class PlaceBidView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self , request):
        # get data of bidder (now it is getting from token not raw json)
        bidder_id = request.data.get('bidder_id')
        auction_id = request.data.get('auction_id')
        amount = request.data.get('amount')
        
        # 2. Basic validation
        if not all([bidder_id, auction_id, amount]):
            return Response(
                {"error": "Missing bidder_id, auction_id, or amount"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        
        # Call sqlalchemy logic
        result = place_bid(bidder_id , auction_id , amount)
        
        # 4. Handle the response
        if "Success" in result:
            return Response({"message": result}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": result}, status=status.HTTP_400_BAD_REQUEST)
        

# view to see all the auction conducted by seller
class MyAuctionView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self , request , user_id):
        
        data = get_auctions_by_seller(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)
    
# view to see all the bids that a user once bidded in a lifetime
class MyBidsView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self , request , user_id):
        
        data = get_user_bidding_history(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)
    

class ProfileView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'id': request.user.id, 'email': request.user.email , 'name': request.user.name})


# Register user for an auction
class RegisterForAuctionView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, auction_id):
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "Missing user_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = register_user_for_auction(user_id, auction_id)
        
        if "Success" in result:
            return Response({"message": result}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": result}, status=status.HTTP_400_BAD_REQUEST)


# Access auction details - only registered users can access
class AuctionAccessView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, auction_id, user_id):
        """
        Get auction details. Only registered users can access.
        """
        # Check if user is registered for this auction
        if not is_user_registered_for_auction(user_id, auction_id):
            return Response(
                {"error": "You are not registered for this auction"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Retrieve auction details from get_active_auctions or a single auction query
        from core_db.auction_ops import auctions
        from core_db.engine import engine
        from sqlalchemy import select
        
        with engine.connect() as conn:
            query = select(auctions).where(auctions.c.id == auction_id)
            auction = conn.execute(query).first()
            
            if not auction:
                return Response(
                    {"error": "Auction not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = AuctionSerializer(dict(auction._mapping))
            return Response(serializer.data, status=status.HTTP_200_OK)


# Get all registered users for an auction
class AuctionRegisteredUsersView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, auction_id):
        """
        Get all registered users for a specific auction.
        """
        users = get_auction_registrations(auction_id)
        return Response(users, status=status.HTTP_200_OK)