from django.urls import path
from .views import (AuctionListView, EndedAuctionListView, PlaceBidView, MyAuctionView, MyBidsView, CreateAuction, KeepAliveView,
                   ProfileView, RegisterForAuctionView, AuctionAccessView, AuctionRegisteredUsersView, 
                   AuctionDetailView, AuctionBidHistoryView, WonItemsView, NotificationsView, 
                   AdminAuctionListView, AdminAuctionDeleteView, AdminCloseExpiredAuctionsView, AdminUserListView, AdminUserUpdateView)
from .auth_views import LoginView, RegisterView, LogoutView, TokenRefreshView, AdminLoginView

urlpatterns = [
    path('create-auction/', CreateAuction.as_view(), name='auction-create'),
    path('auctions/', AuctionListView.as_view(), name='auction-list'),
    path('keep-alive/', KeepAliveView.as_view(), name='keep-alive'),
    path('auctions/ended/', EndedAuctionListView.as_view(), name='auction-ended-list'),
    path('auctions/<int:auction_id>/', AuctionDetailView.as_view(), name='auction-detail'),
    path('auctions/<int:auction_id>/users/<int:user_id>/', AuctionAccessView.as_view(), name='auction-access'),
    path('auctions/<int:auction_id>/registered-users/', AuctionRegisteredUsersView.as_view(), name='auction-registered-users'),
    path('auctions/<int:auction_id>/bids/', AuctionBidHistoryView.as_view(), name='auction-bid-history'),
    path('auctions/<int:auction_id>/register/', RegisterForAuctionView.as_view(), name='register-auction'),
    path('bids/place/', PlaceBidView.as_view(), name='place-bid'),
    path('my-auctions/<int:user_id>/', MyAuctionView.as_view(), name='auction-view'),
    path('my-bids/<int:user_id>/', MyBidsView.as_view(), name='bid-view'),
    path('win-items/<int:user_id>/', WonItemsView.as_view(), name='won-items'),
    path('notifications/<int:user_id>/', NotificationsView.as_view(), name='notifications'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('admin/login/', AdminLoginView.as_view(), name='api-admin-login'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/auctions/', AdminAuctionListView.as_view(), name='admin-auction-list'),
    path('admin/auctions/close-expired/', AdminCloseExpiredAuctionsView.as_view(), name='admin-auction-close-expired'),
    path('admin/auctions/<int:auction_id>/', AdminAuctionDeleteView.as_view(), name='admin-auction-delete'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', AdminUserUpdateView.as_view(), name='admin-user-update'),
]
