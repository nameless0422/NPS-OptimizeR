import uuid
from django.db import models
from django.conf import settings

class PensionRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # 예시 필드: 가입일, 월납입액 등
    start_date = models.DateField()
    monthly_amount = models.FloatField()
    # 결과 필드
    recommended_age = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
