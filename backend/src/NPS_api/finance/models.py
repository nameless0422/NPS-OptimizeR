import uuid
from django.db import models
from django.conf import settings

class FinanceRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # 입력 필드
    age = models.IntegerField()
    assets = models.FloatField()
    debt = models.FloatField()
    monthly_living_expense = models.FloatField()
    monthly_income = models.FloatField()
    dependents = models.IntegerField()
    has_own_house = models.BooleanField(default=False)
    has_insurance = models.BooleanField(default=False)

    # 결과 필드
    score = models.FloatField(null=True, blank=True)
    living_months = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at:%Y-%m-%d %H:%M:%S}"