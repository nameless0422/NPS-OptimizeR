from rest_framework import serializers
from .models import PensionRecord

class PensionInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = PensionRecord
        exclude = ('id','user','recommended_age','created_at')

class PensionOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = PensionRecord
        fields = ('id','recommended_age','created_at')
