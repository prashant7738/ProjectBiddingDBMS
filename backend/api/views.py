from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions , get_ended_auctions, get_auctions_by_seller, create_auction, register_user_for_auction, is_user_registered_for_auction, get_auction_registrations, get_auction_by_id, get_all_auctions_admin, delete_auction, update_auction, close_expired_auctions
from core_db.user_ops import get_all_users, update_user_balance, delete_user_by_id
from .serializers import AuctionSerializer ,BidSerializer, AdminAuctionSerializer, UserSerializer
from rest_framework import status
from django.conf import settings
from django.core.files.storage import default_storage
import os
import uuid
import cloudinary.uploader
from core_db.bid_ops import place_bid, get_user_bidding_history, get_won_items, get_user_notifications

# for pagination
from .paginations import StandardResultsSetPagination


# for authentication 
from .authenticate import SQLAlchemyJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsAdminUser


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
        image = request.FILES.get('image')

        if not all([seller_id , title , description, category_id, starting_price , end_time]):
            return Response(
                {"error": "Missing information"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate start_time and end_time
        from datetime import datetime
        from django.utils import timezone
        try:
            if start_time:
                start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            else:
                start_dt = timezone.now()
            
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            if timezone.is_naive(start_dt):
                start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())
            if timezone.is_naive(end_dt):
                end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())
            
            if start_dt >= end_dt:
                return Response(
                    {"error": "Start time must be before end time"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, AttributeError) as e:
            return Response(
                {"error": "Invalid date/time format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        image_url = None
        if image:
            if settings.DEBUG:
                ext = os.path.splitext(image.name)[1]
                filename = f"{uuid.uuid4().hex}{ext}"
                folder = settings.CLOUDINARY_UPLOAD_FOLDER
                relative_path = f"{folder}/{filename}"
                try:
                    saved_path = default_storage.save(relative_path, image)
                    image_url = default_storage.url(saved_path)
                except Exception:
                    return Response(
                        {"error": "Image upload failed"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                cloudinary_config = settings.CLOUDINARY_STORAGE or {}
                if not all([
                    cloudinary_config.get('CLOUD_NAME'),
                    cloudinary_config.get('API_KEY'),
                    cloudinary_config.get('API_SECRET')
                ]):
                    return Response(
                        {"error": "Cloudinary is not configured"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                try:
                    upload_result = cloudinary.uploader.upload(
                        image,
                        folder=settings.CLOUDINARY_UPLOAD_FOLDER,
                        resource_type="image",
                    )
                    image_url = upload_result.get("secure_url") or upload_result.get("url")
                except Exception:
                    return Response(
                        {"error": "Image upload failed"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

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


# To see all ended auctions
class EndedAuctionListView(APIView):
    def get(self, request):
        paginator = StandardResultsSetPagination()
        data = get_ended_auctions()
        result_page = paginator.paginate_queryset(data, request)
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
    
    def delete(self, request, user_id):
        """Delete a specific auction by auction_id passed in request body"""
        auction_id = request.data.get('auction_id')
        
        if not auction_id:
            return Response({"error": "auction_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the auction belongs to this seller
        auction = get_auction_by_id(auction_id)
        if not auction:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if auction['seller_id'] != user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        deleted = delete_auction(auction_id)
        if deleted:
            return Response({"message": "Auction deleted successfully"}, status=status.HTTP_200_OK)
        return Response({"error": "Failed to delete auction"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, user_id):
        """Update auction details"""
        auction_id = request.data.get('auction_id')
        
        if not auction_id:
            return Response({"error": "auction_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the auction belongs to this seller
        auction = get_auction_by_id(auction_id)
        if not auction:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if auction['seller_id'] != user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Prepare update data
        update_data = {}
        if 'title' in request.data:
            update_data['title'] = request.data['title']
        if 'description' in request.data:
            update_data['description'] = request.data['description']
        if 'category_id' in request.data:
            update_data['category_id'] = request.data['category_id']
        if 'starting_price' in request.data:
            update_data['starting_price'] = request.data['starting_price']
        if 'end_time' in request.data:
            update_data['end_time'] = request.data['end_time']
        if 'start_time' in request.data:
            update_data['start_time'] = request.data['start_time']
        
        # Validate start_time and end_time if both are being updated
        from datetime import datetime
        try:
            start_time_str = update_data.get('start_time') or auction.get('start_time')
            end_time_str = update_data.get('end_time') or auction.get('end_time')
            
            if start_time_str and end_time_str:
                if isinstance(start_time_str, str):
                    start_dt = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                else:
                    start_dt = start_time_str
                    
                if isinstance(end_time_str, str):
                    end_dt = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                else:
                    end_dt = end_time_str
                
                if start_dt >= end_dt:
                    return Response(
                        {"error": "Start time must be before end time"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
        except (ValueError, AttributeError) as e:
            return Response(
                {"error": "Invalid date/time format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_auction = update_auction(auction_id, **update_data)
        if updated_auction:
            serializer = AuctionSerializer(updated_auction)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": "Failed to update auction"}, status=status.HTTP_400_BAD_REQUEST)
    
# view to see all the bids that a user once bidded in a lifetime
class MyBidsView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self , request , user_id):
        
        data = get_user_bidding_history(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)


# view to see all auctions a user has won
class WonItemsView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        data = get_won_items(user_id)
        serializer = AuctionSerializer(data, many=True)
        return Response(serializer.data)
    

class ProfileView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from core_db.user_ops import get_user_balance
        balance = get_user_balance(request.user.id)
        return Response({
            'id': request.user.id, 
            'email': request.user.email, 
            'name': request.user.name,
            'balance': balance
        })


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
        
        auction = get_auction_by_id(auction_id)
        if not auction:
            return Response(
                {"error": "Auction not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if str(auction.get('seller_id')) == str(user_id):
            return Response(
                {"error": "Sellers cannot register for their own auctions"},
                status=status.HTTP_403_FORBIDDEN
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
        Get user's highest bid for a specific auction.
        """
        # Check if user is registered for this auction
        if not is_user_registered_for_auction(user_id, auction_id):
            return Response(
                {"error": "You are not registered for this auction"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from core_db.bid_ops import get_user_bid_for_auction
        
        user_bid = get_user_bid_for_auction(user_id, auction_id)
        
        if user_bid:
            return Response(user_bid, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "No bid found for this user on this auction"}, 
                status=status.HTTP_404_NOT_FOUND
            )


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


# Get bid history for a specific auction
class AuctionBidHistoryView(APIView):
    def get(self, request, auction_id):
        """
        Get all bids for a specific auction.
        """
        from core_db.bid_ops import get_auction_bid_history

        bids = get_auction_bid_history(auction_id)
        return Response(bids, status=status.HTTP_200_OK)


class AdminAuctionListView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        paginator = StandardResultsSetPagination()
        data = get_all_auctions_admin()
        result_page = paginator.paginate_queryset(data, request)
        serializer = AdminAuctionSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminAuctionDeleteView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, auction_id):
        deleted = delete_auction(auction_id)
        if deleted:
            return Response({"message": "Auction deleted"}, status=status.HTTP_200_OK)
        return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)


class AdminCloseExpiredAuctionsView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        closed_count = close_expired_auctions()
        return Response({"closed_count": closed_count}, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        paginator = StandardResultsSetPagination()
        data = get_all_users()
        result_page = paginator.paginate_queryset(data, request)
        serializer = UserSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserUpdateView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, user_id):
        new_balance = request.data.get('balance')
        
        if new_balance is None:
            return Response({"error": "Balance is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_balance = float(new_balance)
            if new_balance < 0:
                return Response({"error": "Balance cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid balance value"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = update_user_balance(user_id, new_balance)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        if getattr(request.user, 'id', None) == user_id:
            return Response({"error": "Admin cannot delete their own account"}, status=status.HTTP_400_BAD_REQUEST)

        deleted = delete_user_by_id(user_id)
        if not deleted:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "User deleted"}, status=status.HTTP_200_OK)


# Notifications polling endpoint
class NotificationsView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        from django.utils.dateparse import parse_datetime
        since = request.query_params.get('since')
        since_dt = parse_datetime(since) if since else None

        data = get_user_notifications(user_id, since_dt)
        return Response(data, status=status.HTTP_200_OK)