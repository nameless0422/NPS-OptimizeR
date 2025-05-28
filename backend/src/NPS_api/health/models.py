import uuid
from django.db import models
from django.conf import settings

class HealthRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # 입력 필드
    cage = models.IntegerField()
    sex  = models.CharField(max_length=10)
    race = models.CharField(max_length=50)
    wbr  = models.CharField(max_length=100)
    drk  = models.IntegerField()
    smk  = models.IntegerField()
    mpa  = models.IntegerField()
    hpa  = models.IntegerField()
    hsd  = models.IntegerField()
    sys  = models.CharField(max_length=50)
    bmi  = models.CharField(max_length=50)
    hbc  = models.CharField(max_length=10)
    cvd  = models.CharField(max_length=10)
    copd = models.CharField(max_length=10)
    dia  = models.CharField(max_length=10)
    dep  = models.CharField(max_length=10)
    can  = models.CharField(max_length=10)
    alz  = models.CharField(max_length=10)
    fcvd = models.CharField(max_length=10)
    fcopd= models.CharField(max_length=10)
    fdia = models.CharField(max_length=10)
    fdep = models.CharField(max_length=10)
    fcan = models.CharField(max_length=10)
    falz = models.CharField(max_length=10)

    # 결과 필드
    estimated_death_age = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} @ {self.created_at:%Y-%m-%d %H:%M}"
