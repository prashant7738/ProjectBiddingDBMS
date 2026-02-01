from decimal import Decimal

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication

from core_db.auction_ops import get_auction_by_id, is_user_registered_for_auction
from core_db.bid_ops import place_bid
from .authenticate import SQLAlchemyJWTAuthentication


class AuctionBidConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.auction_id = int(self.scope['url_route']['kwargs']['auction_id'])
        self.group_name = f"auction_{self.auction_id}"

        # Try cookie first, then query parameter as fallback
        token = self._get_token_from_cookies()
        if not token:
            token = self._get_token_from_query()
        
        if not token:
            print("❌ No token found in cookies or query")
            await self.close(code=4401)
            return
        else:
            print(f"✅ Token found: {token[:20]}...")

        try:
            self.user = await self._get_user_from_token(token)
            print(f"✅ User authenticated: {self.user.id}")
        except exceptions.AuthenticationFailed:
            print("❌ Token validation failed")
            await self.close(code=4401)
            return

        is_registered = await database_sync_to_async(is_user_registered_for_auction)(
            self.user.id,
            self.auction_id,
        )
        if not is_registered:
            print(f"❌ User {self.user.id} not registered for auction {self.auction_id}")
            await self.close(code=4403)
            return
        else:
            print(f"✅ User {self.user.id} registered for auction {self.auction_id}")

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        auction = await database_sync_to_async(get_auction_by_id)(self.auction_id)
        if auction:
            await self.send_json(
                {
                    "type": "auction_state",
                    "auction_id": self.auction_id,
                    "current_highest_bid": float(auction.get("current_highest_bid") or 0),
                    "starting_price": float(auction.get("starting_price") or 0),
                    "end_time": self._to_iso(auction.get("end_time")),
                }
            )

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("type")
        if action != "place_bid":
            await self.send_json({"type": "error", "message": "Unknown action"})
            return

        amount = content.get("amount")
        if amount is None:
            await self.send_json({"type": "error", "message": "Missing amount"})
            return
        
        # Validate amount is a positive number
        try:
            amount = float(amount)
            if amount <= 0:
                await self.send_json({"type": "error", "message": "Bid amount must be positive"})
                return
        except (ValueError, TypeError):
            await self.send_json({"type": "error", "message": "Invalid bid amount format"})
            return

        result = await database_sync_to_async(place_bid)(
            self.user.id,
            self.auction_id,
            amount,
        )

        if result.startswith("Success"):
            auction = await database_sync_to_async(get_auction_by_id)(self.auction_id)
            payload = {
                "type": "bid_update",
                "auction_id": self.auction_id,
                "bidder_id": self.user.id,
                "amount": amount,
                "current_highest_bid": float(auction.get("current_highest_bid") if auction else amount),
            }
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "broadcast_bid", "payload": payload},
            )
            print(f"✅ Bid placed successfully by user {self.user.id}: ${amount}")
        else:
            print(f"❌ Bid rejected for user {self.user.id}: {result}")
            # Send error with current auction state so client can correct UI
            auction = await database_sync_to_async(get_auction_by_id)(self.auction_id)
            await self.send_json({
                "type": "error", 
                "message": result,
                "current_highest_bid": float(auction.get("current_highest_bid") or 0) if auction else 0
            })

    async def broadcast_bid(self, event):
        await self.send_json(event["payload"])

    def _get_token_from_query(self):
        query_string = self.scope.get("query_string", b"").decode()
        if not query_string:
            return None
        from urllib.parse import parse_qs
        query = parse_qs(query_string)
        token_values = query.get("token")
        return token_values[0] if token_values else None

    def _get_token_from_cookies(self):
        headers = dict(self.scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        if not cookie_header:
            return None

        cookies = {}
        for chunk in cookie_header.split(";"):
            if "=" not in chunk:
                continue
            key, value = chunk.strip().split("=", 1)
            cookies[key] = value

        return cookies.get("access_token")

    @database_sync_to_async
    def _get_user_from_token(self, token):
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(token)
        return SQLAlchemyJWTAuthentication().get_user(validated_token)

    def _to_iso(self, value):
        return value.isoformat() if value else None
