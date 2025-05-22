import pandas as pd
import numpy as np
import os
import sys

src_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

def calculate_life_expectancy(record):
    # inputs 딕셔너리로 변환
    inputs = {
        "cage": record.cage, "sex": record.sex, "race": record.race,
        "wbr": record.wbr, "drk": record.drk, "smk": record.smk,
        "mpa": record.mpa, "hpa": record.hpa, "hsd": record.hsd,
        "sys": record.sys, "bmi": record.bmi,
        "hbc": record.hbc, "cvd": record.cvd, "copd": record.copd,
        "dia": record.dia, "dep": record.dep, "can": record.can,
        "alz": record.alz, "fcvd": record.fcvd, "fcopd": record.fcopd,
        "fdia": record.fdia, "fdep": record.fdep,
        "fcan": record.fcan, "falz": record.falz,
    }
    # predict_death_age 함수 내용을 그대로 여기에 붙여넣거나, 별도 모듈로 import
    from algorithm.life_expectancy_yld import predict_death_age  # 예: predict.py에 구현
    return predict_death_age(inputs)
