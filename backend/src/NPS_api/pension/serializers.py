# src/NPS_api/finance/urls.py

from rest_framework import serializers

class PensionSimulationSerializer(serializers.Serializer):
    # ─ Health inputs
    # (HealthRecord 모델 필드와 동일하게)
    cage = serializers.IntegerField()
    sex  = serializers.CharField()
    race = serializers.CharField()
    wbr  = serializers.CharField()
    drk  = serializers.IntegerField()
    smk  = serializers.IntegerField()
    mpa  = serializers.IntegerField()
    hpa  = serializers.IntegerField()
    hsd  = serializers.IntegerField()
    sys  = serializers.CharField()
    bmi  = serializers.CharField()
    hbc  = serializers.CharField()
    cvd  = serializers.CharField()
    copd = serializers.CharField()
    dia  = serializers.CharField()
    dep  = serializers.CharField()
    can  = serializers.CharField()
    alz  = serializers.CharField()
    fcvd = serializers.CharField()
    fcopd= serializers.CharField()
    fdia = serializers.CharField()
    fdep = serializers.CharField()
    fcan = serializers.CharField()
    falz = serializers.CharField()

    # ─ Finance inputs
    age                    = serializers.IntegerField()
    assets                 = serializers.FloatField()
    debt                   = serializers.FloatField()
    monthly_living_expense = serializers.FloatField()
    monthly_income         = serializers.FloatField()
    dependents             = serializers.IntegerField()
    has_own_house          = serializers.BooleanField()
    has_insurance          = serializers.BooleanField()

    # ─ Pension inputs
    Public_pension            = serializers.BooleanField()
    Subscription_period       = serializers.IntegerField(required=False)
    Monthly_insurance_premium = serializers.FloatField(required=False)
    Annual_income             = serializers.FloatField(required=False)
    Non_taxable_payment       = serializers.FloatField(required=False)
    Taxable_payment           = serializers.FloatField(required=False)

    Private_pension              = serializers.BooleanField()
    Private_subscription_period  = serializers.IntegerField(required=False)
    Private_monthly_premium      = serializers.FloatField(required=False)
    Private_lump_sum             = serializers.BooleanField(default=False)

    # ─ Demographic / 기타
    Dependent_parent_count = serializers.IntegerField()
    Child_count            = serializers.IntegerField()
    Spouse                 = serializers.ChoiceField(choices=['Y','N'])
    Current_age            = serializers.IntegerField()
    Pension_start_age      = serializers.IntegerField()
