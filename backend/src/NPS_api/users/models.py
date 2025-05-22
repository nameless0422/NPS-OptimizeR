from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # email 필수로 만들려면 아래 주석 해제
    # email = models.EmailField(unique=True)
    pass
