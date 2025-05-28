from rest_framework import serializers
from .models import FinanceRecord

class FinanceInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceRecord
        fields = (
            'age', 'assets', 'debt',
            'monthly_living_expense', 'monthly_income',
            'dependents', 'has_own_house', 'has_insurance'
        )

class FinanceOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceRecord
        fields = ('id', 'score', 'living_months', 'created_at')

class FinanceSimulationSerializer(serializers.Serializer):
    age                    = serializers.IntegerField()
    assets                 = serializers.FloatField()
    debt                   = serializers.FloatField()
    monthly_living_expense = serializers.FloatField()
    monthly_income         = serializers.FloatField()
    dependents             = serializers.IntegerField()
    has_own_house          = serializers.BooleanField()
    has_insurance          = serializers.BooleanField()