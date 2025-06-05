from rest_framework import serializers
from .models import HealthRecord

class HealthInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRecord
        exclude = ('id','user','estimated_death_age','created_at')

class HealthOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRecord
        fields = ('id','estimated_death_age','created_at')

