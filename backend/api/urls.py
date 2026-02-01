from django.urls import path
from .views import (AuctionListView, PlaceBidView, MyAuctionView, MyBidsView, CreateAuction, 
                   ProfileView, RegisterForAuctionView, AuctionAccessView, AuctionRegisteredUsersView, 
                   AuctionDetailView, AuctionBidHistoryView)
from .auth_views import LoginView, RegisterView, LogoutView, TokenRefreshView

urlpatterns = [
    path('create-auction/', CreateAuction.as_view(), name='auction-create'),
    path('auctions/', AuctionListView.as_view(), name='auction-list'),
    path('auctions/<int:auction_id>/', AuctionDetailView.as_view(), name='auction-detail'),
    path('auctions/<int:auction_id>/users/<int:user_id>/', AuctionAccessView.as_view(), name='auction-access'),
    path('auctions/<int:auction_id>/registered-users/', AuctionRegisteredUsersView.as_view(), name='auction-registered-users'),
    path('auctions/<int:auction_id>/bids/', AuctionBidHistoryView.as_view(), name='auction-bid-history'),
    path('auctions/<int:auction_id>/register/', RegisterForAuctionView.as_view(), name='register-auction'),
    path('bids/place/', PlaceBidView.as_view(), name='place-bid'),
    path('my-auctions/<int:user_id>/', MyAuctionView.as_view(), name='auction-view'),
    path('my-bids/<int:user_id>/', MyBidsView.as_view(), name='bid-view'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
