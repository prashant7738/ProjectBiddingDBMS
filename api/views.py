from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions , get_auctions_by_seller
from .serializers import AuctionSerializer ,BidSerializer
from rest_framework import status
from core_db.bid_ops import place_bid, get_user_bidding_history


class AuctionListView(APIView):
    def get(self, request):
        # Call from SQLAlchemy
        data = get_active_auctions()
        
        serializer = AuctionSerializer(data, many=True)
        
        return Response(serializer.data)
    
    
# To post the bid
class PlaceBidView(APIView):
    def post(self , request):
        # get data of bidder
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
        if result == "Success : Bid Placed!":
            return Response({"message": result}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": result}, status=status.HTTP_400_BAD_REQUEST)
        

# view to see all the auction conducted by seller
class MyAuctionView(APIView):
    def get(self , request , user_id):
        
        data = get_auctions_by_seller(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)
    
# view to see all the bids that a user once bidded in a lifetime
class MyBidsView(APIView):
    def get(self , request , user_id):
        
        data = get_user_bidding_history(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)