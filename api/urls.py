from django.urls import path
from .views import AuctionListView, PlaceBidView, MyAuctionView, MyBidsView

urlpatterns = [
    path('auctions/', AuctionListView.as_view(), name='auction-list'),
    path('bids/place/', PlaceBidView.as_view(), name='place-bid'),
    path('my-auctions/<int:user_id>/', MyAuctionView.as_view(), name='auction-view'),
    path('my-bids/<int:user_id>/', MyBidsView.as_view(), name='bid-view'),

]
