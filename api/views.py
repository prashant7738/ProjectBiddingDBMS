from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions
from .serializers import AuctionSerializer


class AuctionListView(APIView):
    def get(self, request):
        # Call from SQLAlchemy
        data = get_active_auctions()
        
        serializer = AuctionSerializer(data, many=True)
        
        return Response(serializer.data)