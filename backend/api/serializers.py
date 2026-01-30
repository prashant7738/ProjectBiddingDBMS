from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    name = serializers.CharField()
    email = serializers.EmailField()
    balance = serializers.DecimalField(max_digits=12 , decimal_places= 2)
    
class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    name = serializers.CharField()
    
    
class AuctionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    seller_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    image_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    starting_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_highest_bid = serializers.DecimalField(max_digits=12, decimal_places=2)
    end_time = serializers.DateTimeField()
    is_active = serializers.BooleanField()
    
    
class BidSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    auction_id = serializers.IntegerField()
    bidder_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    bid_time = serializers.DateTimeField()