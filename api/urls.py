from django.urls import path
from .views import AuctionListView

urlpatterns = [
    path('auctions/', AuctionListView.as_view(), name='auction_list'),
]
