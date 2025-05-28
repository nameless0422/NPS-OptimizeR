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