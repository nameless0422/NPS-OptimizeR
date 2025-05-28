import os
import sys

src_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from algorithm.economic_weights import evaluate_financial_status

def calculate_economic_score_financial(data_dict):
    """
    data_dict: {
        'age', 'assets', 'debt', 'monthly_living_expense',
        'monthly_income', 'dependents', 'has_own_house', 'has_insurance'
    }
    returns: {'score': float, 'living_months': float}
    """
    return evaluate_financial_status(data_dict)