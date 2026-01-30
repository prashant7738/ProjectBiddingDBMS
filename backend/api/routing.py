from django.urls import path

from .consumers import AuctionBidConsumer

websocket_urlpatterns = [
    path('ws/auctions/<int:auction_id>/', AuctionBidConsumer.as_asgi()),
]
