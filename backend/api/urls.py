from django.urls import path
from .views import AuctionListView, PlaceBidView, MyAuctionView, MyBidsView, CreateAuction, ProfileView
from .auth_views import LoginView, RegisterView, LogoutView

urlpatterns = [
    path('create-auction/', CreateAuction.as_view(), name='auction-create'),
    path('auctions/', AuctionListView.as_view(), name='auction-list'),
    path('bids/place/', PlaceBidView.as_view(), name='place-bid'),
    path('my-auctions/<int:user_id>/', MyAuctionView.as_view(), name='auction-view'),
    path('my-bids/<int:user_id>/', MyBidsView.as_view(), name='bid-view'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
]


# for refresh token 
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns += [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
