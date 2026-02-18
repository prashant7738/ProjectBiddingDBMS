from rest_framework.views import APIView
from rest_framework.response import Response
from core_db.auction_ops import get_active_auctions , get_ended_auctions, get_auctions_by_seller, create_auction, register_user_for_auction, is_user_registered_for_auction, get_auction_registrations, get_auction_by_id, get_all_auctions_admin, delete_auction, update_auction, close_expired_auctions
from core_db.user_ops import get_all_users, update_user_balance, delete_user_by_id
from .serializers import AuctionSerializer ,AdminAuctionSerializer, UserSerializer
from rest_framework import status
from django.conf import settings
from django.core.files.storage import default_storage
import os
import uuid
import cloudinary.uploader
from decimal import Decimal, InvalidOperation
from datetime import datetime
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from core_db.bid_ops import place_bid, get_user_bidding_history, get_won_items, get_user_notifications

# for pagination
from .paginations import StandardResultsSetPagination


# for authentication 
from .authenticate import SQLAlchemyJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser


def error_response(message, http_status, code=None):
    payload = {"error": message}
    if code:
        payload["code"] = code
    return Response(payload, status=http_status)


def parse_positive_int(value, field_name):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}")
    if parsed <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return parsed


def parse_positive_decimal(value, field_name):
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}")
    if parsed <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return parsed


def parse_iso_datetime(value, field_name):
    if value is None or value == "":
        raise ValueError(f"Missing {field_name}")

    if isinstance(value, datetime):
        parsed = value
    else:
        normalized = value.replace('Z', '+00:00') if isinstance(value, str) else value
        parsed = parse_datetime(normalized) if isinstance(normalized, str) else None
        if parsed is None:
            try:
                parsed = datetime.fromisoformat(normalized)
            except (TypeError, ValueError):
                raise ValueError(f"Invalid {field_name}")

    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def ensure_same_user(request, route_user_id):
    if getattr(request.user, 'id', None) != route_user_id:
        return error_response("Unauthorized", status.HTTP_403_FORBIDDEN, "FORBIDDEN_USER_SCOPE")
    return None


# To create Auction
class CreateAuction(APIView):

    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seller_id = getattr(request.user, 'id', None)
        title = (request.data.get('title') or '').strip()
        description = (request.data.get('description') or '').strip()
        category_id = request.data.get('category_id')
        starting_price = request.data.get('starting_price')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        image = request.FILES.get('image')

        if not seller_id:
            return error_response("Unauthorized", status.HTTP_401_UNAUTHORIZED, "AUTH_REQUIRED")

        if not all([title, description, category_id, starting_price, end_time]):
            return error_response("Missing information", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")

        try:
            category_id = parse_positive_int(category_id, "category_id")
            starting_price = parse_positive_decimal(starting_price, "starting_price")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")

        # Validate start_time and end_time
        try:
            if start_time:
                start_dt = parse_iso_datetime(start_time, "start_time")
            else:
                start_dt = timezone.now()
            end_dt = parse_iso_datetime(end_time, "end_time")
            
            if start_dt >= end_dt:
                return error_response("Start time must be before end time", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")

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
                    return error_response("Image upload failed", status.HTTP_400_BAD_REQUEST, "IMAGE_UPLOAD_FAILED")
            else:
                cloudinary_config = settings.CLOUDINARY_STORAGE or {}
                if not all([
                    cloudinary_config.get('CLOUD_NAME'),
                    cloudinary_config.get('API_KEY'),
                    cloudinary_config.get('API_SECRET')
                ]):
                    return error_response("Cloudinary is not configured", status.HTTP_500_INTERNAL_SERVER_ERROR, "SERVER_MISCONFIGURED")
                try:
                    upload_result = cloudinary.uploader.upload(
                        image,
                        folder=settings.CLOUDINARY_UPLOAD_FOLDER,
                        resource_type="image",
                    )
                    image_url = upload_result.get("secure_url") or upload_result.get("url")
                except Exception:
                    return error_response("Image upload failed", status.HTTP_400_BAD_REQUEST, "IMAGE_UPLOAD_FAILED")

        result = create_auction(seller_id, title, description, category_id, float(starting_price), end_dt, start_dt, image_url)

        return Response({"message": result, "image_url": image_url} , status=status.HTTP_201_CREATED)


# class KeepAliveView(APIView):
#     def get(self, request):
#         secret = settings.CRON_SECRET
#         header_value = request.headers.get("X-Cron-Key", "")
#         if not secret or header_value != secret:
#             return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
#         return Response({"status": "ok"}, status=status.HTTP_200_OK)


class KeepAliveView(APIView):
    def get(self, request):
        secret = settings.CRON_SECRET
        header_value = request.headers.get("X-Cron-Key", "")

        if not secret or header_value != secret:
            return error_response("Unauthorized", status.HTTP_401_UNAUTHORIZED, "INVALID_CRON_SECRET")

        closed_count = close_expired_auctions()
        return Response(
            {"status": "ok", "closed_count": closed_count},
            status=status.HTTP_200_OK
        )



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
            return error_response("Auction not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")
        
        serializer = AuctionSerializer(auction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

# To post the bid
class PlaceBidView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self , request):
        bidder_id = getattr(request.user, 'id', None)
        auction_id_raw = request.data.get('auction_id')
        amount_raw = request.data.get('amount')

        if not bidder_id:
            return error_response("Unauthorized", status.HTTP_401_UNAUTHORIZED, "AUTH_REQUIRED")

        try:
            auction_id = parse_positive_int(auction_id_raw, "auction_id")
            amount = parse_positive_decimal(amount_raw, "amount")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")

        # Call sqlalchemy logic
        result = place_bid(bidder_id, auction_id, amount)
        
        # 4. Handle the response
        if "Success" in result:
            return Response({"message": result}, status=status.HTTP_201_CREATED)
        else:
            return error_response(result, status.HTTP_400_BAD_REQUEST, "BID_REJECTED")
        

# view to see all the auction conducted by seller
class MyAuctionView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self , request , user_id):
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized
        
        data = get_auctions_by_seller(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)
    
    def delete(self, request, user_id):
        """Delete a specific auction by auction_id passed in request body"""
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized

        auction_id_raw = request.data.get('auction_id')
        try:
            auction_id = parse_positive_int(auction_id_raw, "auction_id")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        # Verify the auction belongs to this seller
        auction = get_auction_by_id(auction_id)
        if not auction:
            return error_response("Auction not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")
        
        if auction['seller_id'] != user_id:
            return error_response("Unauthorized", status.HTTP_403_FORBIDDEN, "FORBIDDEN_USER_SCOPE")
        
        deleted = delete_auction(auction_id)
        if deleted:
            return Response({"message": "Auction deleted successfully"}, status=status.HTTP_200_OK)
        return error_response("Failed to delete auction", status.HTTP_400_BAD_REQUEST, "DELETE_FAILED")
    
    def patch(self, request, user_id):
        """Update auction details"""
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized

        auction_id_raw = request.data.get('auction_id')
        try:
            auction_id = parse_positive_int(auction_id_raw, "auction_id")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        # Verify the auction belongs to this seller
        auction = get_auction_by_id(auction_id)
        if not auction:
            return error_response("Auction not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")
        
        if auction['seller_id'] != user_id:
            return error_response("Unauthorized", status.HTTP_403_FORBIDDEN, "FORBIDDEN_USER_SCOPE")
        
        # Prepare update data
        update_data = {}
        if 'title' in request.data:
            update_data['title'] = request.data['title']
        if 'description' in request.data:
            update_data['description'] = request.data['description']
        if 'category_id' in request.data:
            try:
                update_data['category_id'] = parse_positive_int(request.data['category_id'], "category_id")
            except ValueError as exc:
                return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        if 'starting_price' in request.data:
            try:
                update_data['starting_price'] = float(parse_positive_decimal(request.data['starting_price'], "starting_price"))
            except ValueError as exc:
                return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        if 'end_time' in request.data:
            update_data['end_time'] = request.data['end_time']
        if 'start_time' in request.data:
            update_data['start_time'] = request.data['start_time']
        
        # Validate start_time and end_time if both are being updated
        try:
            start_time_str = update_data.get('start_time') or auction.get('start_time')
            end_time_str = update_data.get('end_time') or auction.get('end_time')
            
            if start_time_str and end_time_str:
                start_dt = parse_iso_datetime(start_time_str, "start_time")
                end_dt = parse_iso_datetime(end_time_str, "end_time")
                
                if start_dt >= end_dt:
                    return error_response("Start time must be before end time", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        updated_auction = update_auction(auction_id, **update_data)
        if updated_auction:
            serializer = AuctionSerializer(updated_auction)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return error_response("Failed to update auction", status.HTTP_400_BAD_REQUEST, "UPDATE_FAILED")
    
# view to see all the bids that a user once bidded in a lifetime
class MyBidsView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self , request , user_id):
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized
        
        data = get_user_bidding_history(user_id)
        
        serializer = AuctionSerializer(data , many =True)
        
        return Response(serializer.data)


# view to see all auctions a user has won
class WonItemsView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized
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
        user_id = getattr(request.user, 'id', None)
        if not user_id:
            return error_response("Unauthorized", status.HTTP_401_UNAUTHORIZED, "AUTH_REQUIRED")

        try:
            auction_id = parse_positive_int(auction_id, "auction_id")
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        auction = get_auction_by_id(auction_id)
        if not auction:
            return error_response("Auction not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")

        if str(auction.get('seller_id')) == str(user_id):
            return error_response("Sellers cannot register for their own auctions", status.HTTP_403_FORBIDDEN, "FORBIDDEN_ACTION")

        result = register_user_for_auction(user_id, auction_id)
        
        if "Success" in result:
            return Response({"message": result}, status=status.HTTP_201_CREATED)
        else:
            return error_response(result, status.HTTP_400_BAD_REQUEST, "REGISTRATION_FAILED")


# Access auction details - only registered users can access
class AuctionAccessView(APIView):
    
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, auction_id, user_id):
        """
        Get user's highest bid for a specific auction.
        """
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized

        # Check if user is registered for this auction
        if not is_user_registered_for_auction(user_id, auction_id):
            return error_response("You are not registered for this auction", status.HTTP_403_FORBIDDEN, "FORBIDDEN_ACTION")
        
        from core_db.bid_ops import get_user_bid_for_auction
        
        user_bid = get_user_bid_for_auction(user_id, auction_id)
        
        if user_bid:
            return Response(user_bid, status=status.HTTP_200_OK)
        else:
            return error_response("No bid found for this user on this auction", status.HTTP_404_NOT_FOUND, "NOT_FOUND")


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
        return error_response("Auction not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")


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
            return error_response("Balance is required", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        try:
            new_balance = float(new_balance)
            if new_balance < 0:
                return error_response("Balance cannot be negative", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        except (ValueError, TypeError):
            return error_response("Invalid balance value", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")
        
        user = update_user_balance(user_id, new_balance)
        if not user:
            return error_response("User not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        if getattr(request.user, 'id', None) == user_id:
            return error_response("Admin cannot delete their own account", status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR")

        deleted = delete_user_by_id(user_id)
        if not deleted:
            return error_response("User not found", status.HTTP_404_NOT_FOUND, "NOT_FOUND")

        return Response({"message": "User deleted"}, status=status.HTTP_200_OK)


# Notifications polling endpoint
class NotificationsView(APIView):
    authentication_classes = [SQLAlchemyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        unauthorized = ensure_same_user(request, user_id)
        if unauthorized:
            return unauthorized

        since = request.query_params.get('since')
        since_dt = parse_datetime(since) if since else None

        data = get_user_notifications(user_id, since_dt)
        return Response(data, status=status.HTTP_200_OK)