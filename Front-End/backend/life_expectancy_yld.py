import pandas as pd
import numpy as np

def predict_death_age(
    inputs: dict,
    factors_csv: str = "factors.csv",
    factors_cont_csv: str = "factors_cont.csv"
) -> float:
    """
    inputs: dict of risk-factor names to values, e.g.
        {
          "sex": "Male",
          "race": "Asian",
          "wbr": "East Asia & Pacific",
          "drk": 5,
          "smk": 10,
          ...
        }
    Returns the expected age of death (float), excluding
    Drug Overdose, Fall, Suicide, and Motor Vehicle Accident.
    """
    # 1) Static causes-of-death table
    cod = pd.DataFrame({
        "cause": [
            "Cardiovascular Diseases", "Coronary Heart Diseases", "Stroke", "Cancer",
            "COVID-19", "Alzheimer’s Disease", "Chronic Lower Respiratory Diseases",
            "Diabetes", "Drug Overdose", "Motor Vehicle Accident", "Fall",
            "Influenza and Pneumonia", "Kidney Diseases", "Suicide", "Liver Diseases", "Septicemia"
        ],
        "age": [
            67.3, 76.0, 70.5, 65.0, 79.0, 78.0, 62.0, 74.6,
            40.0, 40.0, 70.0, 70.0, 73.0, 30.0, 52.0, 65.0
        ],
        "risk": [
            224.4, 91.8, 38.8, 148.1, 85.0, 32.4, 36.4,
            24.8, 25.8, 13.1, 10.3, 13.0, 12.7, 13.5, 13.3, 9.7
        ],
        "pop": [
            813804, 406351, 160264, 608570, 350831, 132242,
            152657, 102188, 91800, 42915, 40114, 53544, 52547,
            45940, 51642, 40050
        ]
    })

    # 2) Load factor tables
    factors      = pd.read_csv(factors_csv)
    factors_cont = pd.read_csv(factors_cont_csv)

    # 3) Helper functions
    def filter_df(df):
        mask = pd.Series(False, index=df.index)
        for var in df["var"].unique():
            val = inputs.get(var)
            if val is not None:
                mask |= (df["var"] == var) & (df["value"] == str(val))
        return df[mask]

    def multiply_df(df):
        df2 = df.copy()
        df2["input_val"] = df2["var"].map(inputs)
        df2 = df2.dropna(subset=["input_val"])
        df2["multiplier"] = 1 + df2["input_val"] * df2["multiplier"]
        return df2.groupby(["category","cause"], as_index=False)["multiplier"].prod()

    # 4) Compute multipliers
    cat = filter_df(factors).groupby(["category","cause"], as_index=False)["multiplier"].prod()
    cat = cat.pivot(index="cause", columns="category", values="multiplier").fillna(1).add_prefix("f_")
    cont = multiply_df(factors_cont)
    cont = cont.pivot(index="cause", columns="category", values="multiplier").fillna(1).add_prefix("f_cont_")

    # 5) Join and apply multipliers
    df = cod.set_index("cause").join(cat).join(cont).reset_index().fillna(1)
    for col in ["age","risk","pop"]:
        df[col] = df[col] * df[f"f_{col}"] * df[f"f_cont_{col}"]
    df = df.drop(columns=[c for c in df.columns if c.startswith(("f_","f_cont_"))])

    # 6) Round & adjust
    cage = inputs.get("cage", 0)
    df["age"]  = np.where(df["age"] - 5 <= cage, cage + 5, df["age"]).round().astype(int)
    df["risk"] = df["risk"].round().astype(int)

    # 7) Compute raw probabilities (exclude CHD & Stroke)
    mask_all = ~df["cause"].isin(["Stroke","Coronary Heart Diseases"])
    total = df.loc[mask_all, "risk"].sum()
    df["prob"] = df["risk"] / total  # already fraction, sums to 1 minus CHD&Stroke share

    # 8) Exclude unwanted causes
    exclude = {"Drug Overdose","Fall","Suicide","Motor Vehicle Accident"}
    df = df[~df["cause"].isin(exclude)]

    # 9) Normalize probabilities and compute expectation
    df["p_norm"] = df["prob"] / df["prob"].sum()
    expected_age = (df["p_norm"] * df["age"]).sum()

    return float(expected_age)


inputs = {
    "cage": 30,
    "sex": "Male",
    "race": "Asian",
    "wbr": "East Asia & Pacific",
    "drk": 0,
    "smk": 0,
    "mpa": 120,
    "hpa": 120,
    "hsd": 8,
    "sys": "Normal (SBP <120)",
    "bmi": "Normal (18.5–24.9)",
    "hbc": "No",
    "cvd": "No",
    "copd": "No",
    "dia": "No",
    "dep": "No",
    "can": "No",
    "alz": "No",
    "fcvd": "No",
    "fcopd": "No",
    "fdia": "No",
    "fdep": "No",
    "fcan": "No",
    "falz": "No",
}
print(predict_death_age(inputs) + 7)