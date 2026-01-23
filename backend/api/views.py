from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions , get_auctions_by_seller, create_auction
from .serializers import AuctionSerializer ,BidSerializer
from rest_framework import status
from core_db.bid_ops import place_bid, get_user_bidding_history

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
        title = request.data.get('title'),
        description = request.data.get('description'),
        category_id = request.data.get('category_id'), 
        starting_price = request.data.get('starting_price'), 
        end_time = request.data.get('end_time')

        if not all([seller_id , title , description, category_id, starting_price , end_time]):
            return Response(
                {"error": "Missing information"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        result = create_auction(seller_id , title , description, category_id, starting_price , end_time)

        return Response(result , status=status.HTTP_201_CREATED)




# To see all the auctions
class AuctionListView(APIView):
    def get(self, request):
        
        paginator = StandardResultsSetPagination()
        # Call from SQLAlchemy
        data = get_active_auctions()
        
        
        result_page = paginator.paginate_queryset(data , request)
        serializer = AuctionSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    
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
        return Response({'id': request.user.id, 'email': request.user.email})