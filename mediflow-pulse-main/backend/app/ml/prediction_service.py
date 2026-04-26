import random

def predict_wait_time():
    return round(8 + random.random() * 32, 1)

def predict_patient_load():
    return round(15 + random.random() * 10, 0)
